import { fetchApiData, fetchDropdowns } from '../../data/api';

// ── Types ──

export type Step =
  | 'greeting'
  | 'action'
  | 'bibit'
  | 'jumlah'
  | 'sumber'
  | 'tujuan'
  | 'dibuat_oleh'
  | 'driver'
  | 'confirm'
  | 'submitting'
  | 'done'
  | 'ask_print';

export interface FormData {
  action: 'masuk' | 'keluar' | 'mati' | '';
  bibit: string;
  jumlah: string;
  sumber: string;
  tujuan: string;
  dibuatOleh: string;
  driver: string;
}

export interface QuickReply {
  label: string;
  value: string;
  variant?: 'primary' | 'danger' | 'default';
}

export interface DropdownData {
  bibit: string[];
  sumber: string[];
  tujuan: string[];
  dibuatOleh: string[];
  driver: string[];
}

export interface StokMap {
  [key: string]: number;
}

// ── Constants ──

export const GREETING =
  'Selamat datang di **Fast Input** — asisten pencatatan bibit nursery.\n\nSilakan pilih jenis aktivitas yang ingin dicatat:';

export const STEP_LABELS: Record<Step, string> = {
  greeting: 'Memulai',
  action: 'Langkah 1 / 7 — Jenis Aktivitas',
  bibit: 'Langkah 2 / 7 — Jenis Bibit',
  jumlah: 'Langkah 3 / 7 — Jumlah',
  sumber: 'Langkah 4 / 7 — Sumber',
  tujuan: 'Langkah 5 / 7 — Tujuan',
  dibuat_oleh: 'Langkah 6 / 7 — Pembuat',
  driver: 'Langkah 7 / 7 — Driver',
  confirm: 'Konfirmasi Data',
  submitting: 'Menyimpan data...',
  done: 'Tersimpan',
  ask_print: 'Cetak Surat Jalan',
};

// ── Data loader ──

export async function loadOptions(): Promise<{ options: DropdownData; stokMap: StokMap }> {
  const [rows, dropdowns] = await Promise.all([fetchApiData(), fetchDropdowns()]);
  const bibitSet = new Set<string>();
  const sumberSet = new Set<string>();
  const tujuanSet = new Set<string>();
  const stok: StokMap = {};

  for (const r of rows) {
    if (r.bibit) bibitSet.add(r.bibit.trim());
    if (r.sumber) sumberSet.add(r.sumber.trim());
    if (r.tujuan) tujuanSet.add(r.tujuan.trim());
    const key = r.bibit.trim().toUpperCase();
    if (!stok[key]) stok[key] = 0;
    stok[key] += (r.masuk || 0) - (r.keluar || 0) - (r.mati || 0);
  }
  for (const k of Object.keys(stok)) {
    if (stok[k] < 0) stok[k] = 0;
  }

  return {
    options: {
      bibit: [...bibitSet].sort(),
      sumber: [...sumberSet].sort(),
      tujuan: [...tujuanSet].sort(),
      dibuatOleh: dropdowns.dibuatOleh || [],
      driver: dropdowns.driver || [],
    },
    stokMap: stok,
  };
}

// ── Helper ──

function fmt(n: number) {
  return n.toLocaleString('id-ID');
}

function stokBadge(stok: number): string {
  if (stok <= 0) return ' — Habis';
  if (stok < 1000) return ' — Menipis';
  return '';
}

// ── Quick reply builders ──

export function getQuickReplies(step: Step, options: DropdownData, stokMap: StokMap): QuickReply[] {
  const common = [
    { label: '**Input Bibit Manual** (bebas tulis)', value: '__free_input__', variant: 'primary' as const }
  ];
  
  switch (step) {
    case 'action':
    case 'greeting':
      return [
        ...common,
        { label: 'Bibit Masuk', value: 'masuk', variant: 'default' },
        { label: 'Bibit Keluar', value: 'keluar', variant: 'default' },
        { label: 'Bibit Mati', value: 'mati', variant: 'default' },
      ];
    case 'bibit':
      return options.bibit.map((b) => {
        const stok = stokMap[b.toUpperCase()] ?? 0;
        const badge = stokBadge(stok);
        return { label: `${b}${badge}`, value: b };
      });
    case 'sumber':
      return options.sumber.map((s) => ({ label: s, value: s }));
    case 'tujuan':
      return options.tujuan.map((t) => ({ label: t, value: t }));
    case 'dibuat_oleh':
      return options.dibuatOleh.map((d) => ({ label: d, value: d }));
    case 'driver':
      return options.driver.map((d) => ({ label: d, value: d }));
    case 'confirm':
      return [
        { label: 'Kirim Data', value: 'submit', variant: 'primary' },
        { label: 'Ulangi', value: 'reset', variant: 'default' },
      ];
    case 'ask_print':
      return [
        { label: 'Cetak Surat Jalan', value: 'print', variant: 'primary' },
        { label: 'Input Lagi', value: 'new', variant: 'default' },
        { label: 'Selesai', value: 'close', variant: 'default' },
      ];
    case 'done':
      return [
        { label: 'Input Lagi', value: 'new', variant: 'default' },
      ];
    default:
      return [];
  }
}

// ── Natural Language Parser ──
export interface ParsedInput {
  complete: boolean;
  formData: Partial<FormData>;
  missing: string[];
  confidence: number; // 0-1
}

export function parseFreeInput(text: string, options: DropdownData, stokMap: StokMap): ParsedInput | null {
  const lower = text.toLowerCase().trim();
  
  // Keywords
  const actionMatch = lower.match(/(input|catat|masuk[kan]?|keluar|mati)/);
  const rawAction = actionMatch?.[1] || '';
  const actionMap: Record<string, FormData['action']> = {
    'masuk': 'masuk', 
    'masukkan': 'masuk', 
    'input': 'masuk', 
    'keluar': 'keluar',
    'mati': 'mati', 
    'catat': 'masuk'
  };
  const action = actionMap[rawAction] || '';

  // Numbers
  const numMatch = lower.match(/(\d+(?:\.\d+)?)/);
  const jumlah = numMatch ? numMatch[1] : '';
  
  // Bibit - match against whitelist (fuzzy), check stok
  let bibit = '';
  for (const b of options.bibit) {
    if (lower.includes(b.toLowerCase()) || lower.includes(b.toLowerCase().replace(/ /g, ''))) {
      bibit = b;
      // Verify has stock if using stokMap
      const hasStock = stokMap[b.toUpperCase()] ?? 0 > 0;
      if (!hasStock) console.warn(`Low stock warning for bibit: ${b}`);
      break;
    }
  }
  
  // Named fields
  const sumberMatch = lower.match(/(?:dari|sumber|asal)\s*([^\s,.;]+(?:\s+[^\s,.;]+)?)/i);
  const tujuanMatch = lower.match(/(?:ke|tujuan)\s*([^\s,.;]+(?:\s+[^\s,.;]+)?)/i);
  const dibuatMatch = lower.match(/(?:oleh|dibuat)\s*([^\s,.;]+(?:\s+[^\s,.;]+)?)/i);
  const driverMatch = lower.match(/(?:driver|sopir)\s*([^\s,.;]+)/i);
  
  const parsed: Partial<FormData> = {
    action,
    bibit,
    jumlah,
    sumber: sumberMatch?.[1]?.trim() || '',
    tujuan: tujuanMatch?.[1]?.trim() || '',
    dibuatOleh: dibuatMatch?.[1]?.trim() || '',
    driver: driverMatch?.[1]?.trim() || ''
  };
  
  // Count filled fields
  const filledCount = Object.values(parsed).filter(Boolean).length;
  const confidence = filledCount / 7; // 7 main fields
  
  const required = ['action', 'bibit', 'jumlah'];
  const missing = required.filter(field => !parsed[field as keyof typeof parsed]);
  
  return {
    complete: confidence >= 0.8 && missing.length === 0,
    formData: parsed,
    missing,
    confidence: Math.round(confidence * 100) / 100
  };
}

// ── Step processor — returns bot message and next step ──

export function processStep(
  step: Step,
  value: string,
  formData: FormData,
  stokMap: StokMap,
): { message: string; nextStep: Step; updatedForm: Partial<FormData> } | null {
  switch (step) {
    case 'action': {
      const map: Record<string, FormData['action']> = { masuk: 'masuk', keluar: 'keluar', mati: 'mati' };
      const action = map[value];
      if (!action) return null;

      const labels = { masuk: 'Bibit Masuk', keluar: 'Bibit Keluar', mati: 'Bibit Mati' };
      return {
        message: `**${labels[action]}** — dicatat.\n\nPilih jenis bibit:`,
        nextStep: 'bibit',
        updatedForm: { action },
      };
    }

    case 'bibit': {
      const stok = stokMap[value.toUpperCase()] ?? 0;
      const stokInfo = `Stok saat ini: **${fmt(stok)}** bibit`;
      return {
        message: `Bibit: **${value}**\n${stokInfo}\n\nMasukkan jumlah:`,
        nextStep: 'jumlah',
        updatedForm: { bibit: value },
      };
    }

    case 'jumlah': {
      const num = parseInt(value);
      if (isNaN(num) || num <= 0) return null;

      let warning = '';
      if (formData.action === 'keluar' || formData.action === 'mati') {
        const stok = stokMap[formData.bibit.toUpperCase()] ?? 0;
        if (num > stok) {
          warning = `\n\n**Perhatian:** Jumlah melebihi stok tersedia (${fmt(stok)}).`;
        }
      }

      return {
        message: `Jumlah: **${fmt(num)}** bibit${warning}\n\nPilih sumber / asal bibit:`,
        nextStep: 'sumber',
        updatedForm: { jumlah: String(num) },
      };
    }

    case 'sumber': {
      if (formData.action === 'keluar') {
        return {
          message: `Sumber: **${value}**\n\nPilih tujuan distribusi:`,
          nextStep: 'tujuan',
          updatedForm: { sumber: value },
        };
      }
      // masuk/mati — skip to confirm
      return {
        message: `Sumber: **${value}**\n\n${buildSummary({ ...formData, sumber: value })}`,
        nextStep: 'confirm',
        updatedForm: { sumber: value },
      };
    }

    case 'tujuan': {
      return {
        message: `Tujuan: **${value}**\n\nPilih nama pembuat dokumen:`,
        nextStep: 'dibuat_oleh',
        updatedForm: { tujuan: value },
      };
    }

    case 'dibuat_oleh': {
      return {
        message: `Dibuat oleh: **${value}**\n\nPilih driver / pengantar:`,
        nextStep: 'driver',
        updatedForm: { dibuatOleh: value },
      };
    }

    case 'driver': {
      const updated = { ...formData, driver: value };
      return {
        message: `Driver: **${value}**\n\n${buildSummary(updated)}`,
        nextStep: 'confirm',
        updatedForm: { driver: value },
      };
    }

    default:
      return null;
  }
}

// ── Summary builder ──

function buildSummary(data: FormData): string {
  const labels = { masuk: 'Bibit Masuk', keluar: 'Bibit Keluar', mati: 'Bibit Mati' };
  const jumlah = fmt(Number(data.jumlah));

  let text = '━━━━━━━━━━━━━━━━━━\n';
  text += '**Ringkasan Data**\n\n';
  text += `Aktivitas: **${labels[data.action as keyof typeof labels] || '-'}**\n`;
  text += `Bibit: **${data.bibit}**\n`;
  text += `Jumlah: **${jumlah}** bibit\n`;
  text += `Sumber: **${data.sumber || '-'}**\n`;

  if (data.action === 'keluar') {
    text += `Tujuan: **${data.tujuan || '-'}**\n`;
    text += `Dibuat oleh: **${data.dibuatOleh || '-'}**\n`;
    text += `Driver: **${data.driver || '-'}**\n`;
  }

  text += '━━━━━━━━━━━━━━━━━━\n';
  text += 'Periksa data di atas. Jika sudah benar, tekan **Kirim Data**.';
  return text;
}

// ── After-submit messages ──

export function getSuccessMessage(formData: FormData): string {
  const jumlah = fmt(Number(formData.jumlah));
  const labels = { masuk: 'Bibit Masuk', keluar: 'Bibit Keluar', mati: 'Bibit Mati' };
  const label = labels[formData.action as keyof typeof labels] || '-';

  let msg = '**Data berhasil disimpan.**\n\n';
  msg += `${label} — ${formData.bibit} — ${jumlah} bibit\n`;
  msg += 'Notifikasi WhatsApp telah dikirim ke grup admin.';

  if (formData.action === 'keluar' && Number(formData.jumlah) > 0) {
    msg += '\n\nApakah Anda ingin mencetak **Surat Jalan** untuk distribusi ini?';
  }

  return msg;
}

export function getSuccessStep(formData: FormData): Step {
  if (formData.action === 'keluar' && Number(formData.jumlah) > 0) {
    return 'ask_print';
  }
  return 'done';
}
