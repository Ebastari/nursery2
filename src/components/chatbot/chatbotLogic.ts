import { fetchApiData } from '../../data/api';
import type { ApiRow } from '../../data/api';

export interface MenuOption {
  id: string;
  label: string;
  icon: string;
}

export const MENU_OPTIONS: MenuOption[] = [
  { id: 'stok', label: 'Total Stok Bibit', icon: '📦' },
  { id: 'masuk', label: 'Total Bibit Masuk', icon: '📥' },
  { id: 'keluar', label: 'Total Bibit Keluar', icon: '📤' },
  { id: 'mati', label: 'Total Bibit Mati', icon: '💀' },
  { id: 'hari-ini', label: 'Aktivitas Hari Ini', icon: '📅' },
  { id: '7-hari', label: '7 Hari Terakhir', icon: '📊' },
  { id: 'sengon', label: 'Stok SENGON POTTING', icon: '🌿' },
  { id: 'tim', label: 'Perbandingan Tim', icon: '👷' },
  { id: 'kritis', label: 'Bibit Kritis', icon: '🚨' },
  { id: 'kinerja', label: 'Ringkasan Kinerja', icon: '🌱' },
];

export const GREETING =
  'Halo! Saya **Montana Bibit**, asisten digital nursery PT EBL.\nPilih informasi yang ingin kamu ketahui, atau ketik pertanyaan kamu.';

function fmt(n: number) {
  return n.toLocaleString('id-ID');
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function dateLabel() {
  return new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

type Rekap = Record<string, { masuk: number; keluar: number; mati: number }>;

function buildRekap(rows: ApiRow[]): Rekap {
  const r: Rekap = {};
  for (const row of rows) {
    const k = row.bibit || 'UNKNOWN';
    if (!r[k]) r[k] = { masuk: 0, keluar: 0, mati: 0 };
    r[k].masuk += row.masuk;
    r[k].keluar += row.keluar;
    r[k].mati += row.mati;
  }
  return r;
}

function stokLabel(s: number) {
  if (s <= 0) return '🚨 Habis';
  if (s < 50) return '⚠️ Menipis';
  return '✅ Aman';
}

// ────────────────────────────────
// Handler per menu
// ────────────────────────────────

async function handleStok(): Promise<string> {
  const rows = await fetchApiData();
  const rekap = buildRekap(rows);
  const keys = Object.keys(rekap).sort();
  let total = 0;
  let lines = keys.map((k) => {
    const d = rekap[k];
    const stok = Math.max(0, d.masuk - d.keluar - d.mati);
    total += stok;
    return `• **${k}**: ${fmt(stok)} batang ${stokLabel(stok)}`;
  });
  return `📦 **Rekap Stok Seluruh Bibit**\n*Update: ${dateLabel()}*\n━━━━━━━━━━━━━━━━━━\n${lines.join('\n')}\n━━━━━━━━━━━━━━━━━━\n**Total Stok**: ${fmt(total)} batang | ${keys.length} jenis bibit`;
}

async function handleMasuk(): Promise<string> {
  const rows = await fetchApiData();
  const rekap = buildRekap(rows);
  const keys = Object.keys(rekap).sort();
  let grandTotal = 0;
  const lines = keys.map((k) => {
    grandTotal += rekap[k].masuk;
    return `• **${k}**: ${fmt(rekap[k].masuk)} batang`;
  });
  return `📥 **Total Bibit Masuk (Keseluruhan)**\n*Update: ${dateLabel()}*\n━━━━━━━━━━━━━━━━━━\n${lines.join('\n')}\n━━━━━━━━━━━━━━━━━━\n**Grand Total Masuk**: ${fmt(grandTotal)} batang`;
}

async function handleKeluar(): Promise<string> {
  const rows = await fetchApiData();
  const rekap = buildRekap(rows);
  const keys = Object.keys(rekap).sort();
  let grandTotal = 0;
  const lines = keys.map((k) => {
    grandTotal += rekap[k].keluar;
    return `• **${k}**: ${fmt(rekap[k].keluar)} batang`;
  });
  return `📤 **Total Bibit Keluar (Keseluruhan)**\n*Update: ${dateLabel()}*\n━━━━━━━━━━━━━━━━━━\n${lines.join('\n')}\n━━━━━━━━━━━━━━━━━━\n**Grand Total Keluar**: ${fmt(grandTotal)} batang`;
}

async function handleMati(): Promise<string> {
  const rows = await fetchApiData();
  const rekap = buildRekap(rows);
  const keys = Object.keys(rekap).sort();
  let totalMasuk = 0;
  let totalMati = 0;
  const lines = keys.map((k) => {
    const d = rekap[k];
    totalMasuk += d.masuk;
    totalMati += d.mati;
    const pct = d.masuk > 0 ? ((d.mati / d.masuk) * 100).toFixed(1) : '0.0';
    return `• **${k}**: ${fmt(d.mati)} mati (${pct}% mortalitas)`;
  });
  const overall = totalMasuk > 0 ? ((totalMati / totalMasuk) * 100).toFixed(1) : '0.0';
  return `💀 **Total Bibit Mati & Mortalitas**\n*Update: ${dateLabel()}*\n━━━━━━━━━━━━━━━━━━\n${lines.join('\n')}\n━━━━━━━━━━━━━━━━━━\n**Total Mati**: ${fmt(totalMati)} batang\n**Mortalitas Keseluruhan**: ${overall}%`;
}

async function handleHariIni(): Promise<string> {
  const rows = await fetchApiData();
  const today = todayStr();
  const todayRows = rows.filter((r) => r.tanggal === today);
  if (todayRows.length === 0) {
    return `📅 **Aktivitas Hari Ini** — ${dateLabel()}\n\nBelum ada data masuk untuk hari ini.\nData terakhir tercatat pada: **${rows.length > 0 ? rows[rows.length - 1].tanggal : '-'}**`;
  }
  let totalM = 0, totalK = 0, totalD = 0;
  const lines = todayRows.map((r) => {
    totalM += r.masuk; totalK += r.keluar; totalD += r.mati;
    const aksi = r.keluar > 0 ? `keluar ${fmt(r.keluar)}` : r.masuk > 0 ? `masuk ${fmt(r.masuk)}` : `mati ${fmt(r.mati)}`;
    return `• **${r.bibit}** — ${aksi} batang${r.tujuan ? ` → ${r.tujuan}` : ''}`;
  });
  return `📅 **Aktivitas Hari Ini** — ${dateLabel()}\n━━━━━━━━━━━━━━━━━━\n${lines.join('\n')}\n━━━━━━━━━━━━━━━━━━\n📥 Masuk: ${fmt(totalM)} | 📤 Keluar: ${fmt(totalK)} | 💀 Mati: ${fmt(totalD)}\n**Total transaksi**: ${todayRows.length} record`;
}

async function handle7Hari(): Promise<string> {
  const rows = await fetchApiData();
  const today = new Date();
  const days: { date: string; masuk: number; keluar: number; mati: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    const dayRows = rows.filter((r) => r.tanggal === ds);
    const masuk = dayRows.reduce((a, r) => a + r.masuk, 0);
    const keluar = dayRows.reduce((a, r) => a + r.keluar, 0);
    const mati = dayRows.reduce((a, r) => a + r.mati, 0);
    const label = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
    days.push({ date: label, masuk, keluar, mati });
  }
  const totalM = days.reduce((a, d) => a + d.masuk, 0);
  const totalK = days.reduce((a, d) => a + d.keluar, 0);
  const totalD = days.reduce((a, d) => a + d.mati, 0);
  const lines = days.map((d) => `• **${d.date}** — 📥 ${fmt(d.masuk)} | 📤 ${fmt(d.keluar)} | 💀 ${fmt(d.mati)}`);
  return `📊 **Aktivitas 7 Hari Terakhir**\n━━━━━━━━━━━━━━━━━━\n${lines.join('\n')}\n━━━━━━━━━━━━━━━━━━\n**Total 7 hari**:\n📥 Masuk: ${fmt(totalM)} | 📤 Keluar: ${fmt(totalK)} | 💀 Mati: ${fmt(totalD)}\nRata-rata keluar/hari: **${fmt(Math.round(totalK / 7))}** batang`;
}

async function handleSengon(): Promise<string> {
  const rows = await fetchApiData();
  const sp = rows.filter((r) => r.bibit.toUpperCase().includes('SENGON POTTING'));
  const masuk = sp.reduce((a, r) => a + r.masuk, 0);
  const keluar = sp.reduce((a, r) => a + r.keluar, 0);
  const mati = sp.reduce((a, r) => a + r.mati, 0);
  const stok = Math.max(0, masuk - keluar - mati);

  const today = new Date();
  const sevenAgo = new Date(today.getTime() - 7 * 86400000);
  const recent = sp.filter((r) => { const d = new Date(r.tanggal); return d >= sevenAgo && d <= today; });
  const keluar7 = recent.reduce((a, r) => a + r.keluar, 0);
  let avg = Math.round(keluar7 / 7);
  if (avg <= 0 && keluar > 0 && sp.length > 0) {
    const first = new Date(sp[0].tanggal);
    const totalDays = Math.max(1, Math.round((today.getTime() - first.getTime()) / 86400000));
    avg = Math.round(keluar / totalDays);
  }
  if (avg <= 0) avg = 400;

  const daysLeft = avg > 0 && stok > 0 ? Math.ceil(stok / avg) : 0;
  const predDate = daysLeft > 0
    ? new Date(Date.now() + daysLeft * 86400000).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })
    : '-';

  return `🌿 **Detail SENGON POTTING**\n*Update: ${dateLabel()}*\n━━━━━━━━━━━━━━━━━━\n📥 Total Masuk: **${fmt(masuk)}** batang\n📤 Total Keluar: **${fmt(keluar)}** batang\n💀 Total Mati: **${fmt(mati)}** batang\n📦 Sisa Stok: **${fmt(stok)}** batang ${stokLabel(stok)}\n━━━━━━━━━━━━━━━━━━\n📈 **Proyeksi**:\nRata-rata keluar: **${fmt(avg)}** batang/hari\nEstimasi habis: **±${daysLeft} hari** lagi (${predDate})\nTotal transaksi: ${sp.length} record`;
}

async function handleTim(): Promise<string> {
  const rows = await fetchApiData();
  const sp = rows.filter((r) => r.bibit.toUpperCase().includes('SENGON POTTING'));
  const timData = sp.filter((r) => r.tujuan.toUpperCase().includes('TIM'));
  const basri = timData.filter((r) => r.tujuan.toUpperCase().includes('BASRI'));
  const bahran = timData.filter((r) => r.tujuan.toUpperCase().includes('BAHRAN'));

  const totalBasri = basri.reduce((a, r) => a + r.keluar, 0);
  const totalBahran = bahran.reduce((a, r) => a + r.keluar, 0);
  const gabungan = totalBasri + totalBahran;

  const pctB = gabungan > 0 ? ((totalBasri / gabungan) * 100).toFixed(1) : '0.0';
  const pctH = gabungan > 0 ? ((totalBahran / gabungan) * 100).toFixed(1) : '0.0';
  const avgB = Math.round(totalBasri / (basri.length || 1));
  const avgH = Math.round(totalBahran / (bahran.length || 1));
  const diff = gabungan > 0 ? ((Math.abs(totalBasri - totalBahran) / gabungan) * 100).toFixed(1) : '0.0';

  const status = Number(diff) <= 15 ? '✅ Seimbang' : Number(diff) <= 30 ? '⚙️ Cukup Seimbang' : '⚠️ Timpang';

  return `👷 **Perbandingan Tim Lapangan**\n*(SENGON POTTING — Update: ${dateLabel()})*\n━━━━━━━━━━━━━━━━━━\n👷‍♂️ **Tim Basri**:\nTotal Realisasi: **${fmt(totalBasri)}** batang\nRata-rata: **${fmt(avgB)}** batang/hari\nKontribusi: **${pctB}%**\n\n👷‍♂️ **Tim Bahran**:\nTotal Realisasi: **${fmt(totalBahran)}** batang\nRata-rata: **${fmt(avgH)}** batang/hari\nKontribusi: **${pctH}%**\n━━━━━━━━━━━━━━━━━━\n📈 Selisih antar-tim: **${diff}%** — ${status}\nTotal gabungan: **${fmt(gabungan)}** batang`;
}

async function handleKritis(): Promise<string> {
  const rows = await fetchApiData();
  const rekap = buildRekap(rows);
  const items = Object.entries(rekap)
    .map(([k, d]) => ({ bibit: k, stok: Math.max(0, d.masuk - d.keluar - d.mati), mortalitas: d.masuk > 0 ? (d.mati / d.masuk) * 100 : 0 }))
    .filter((x) => x.stok < 50 || x.mortalitas > 10)
    .sort((a, b) => a.stok - b.stok);

  if (items.length === 0) {
    return `🚨 **Bibit Kritis**\n\n✅ Tidak ada bibit dalam kondisi kritis saat ini.\nSemua stok dalam keadaan aman.`;
  }

  const lines = items.map((x) => {
    const tag = x.stok <= 0 ? '🚨 HABIS' : x.stok < 50 ? '⚠️ MENIPIS' : '⚠️ MORTALITAS TINGGI';
    return `• **${x.bibit}** — Stok: ${fmt(x.stok)} | Mortalitas: ${x.mortalitas.toFixed(1)}% — ${tag}`;
  });

  return `🚨 **Bibit Kritis — Perlu Perhatian**\n*Update: ${dateLabel()}*\n━━━━━━━━━━━━━━━━━━\n${lines.join('\n')}\n━━━━━━━━━━━━━━━━━━\n**${items.length} jenis bibit** dalam kondisi kritis.`;
}

async function handleKinerja(): Promise<string> {
  const rows = await fetchApiData();
  const totalMasuk = rows.reduce((a, r) => a + r.masuk, 0);
  const totalKeluar = rows.reduce((a, r) => a + r.keluar, 0);
  const totalMati = rows.reduce((a, r) => a + r.mati, 0);
  const totalHidup = totalMasuk - totalMati;
  const sr = totalMasuk > 0 ? (totalHidup / totalMasuk) * 100 : 100;
  const rp = totalMasuk > 0 ? (totalKeluar / totalMasuk) * 100 : 0;

  const efisiensi = sr >= 97 && rp >= 90 ? '✅ Sangat Baik' : sr >= 90 && rp >= 80 ? '⚙️ Stabil' : '⚠️ Perlu Evaluasi';

  const rekap = buildRekap(rows);
  const top5 = Object.entries(rekap)
    .map(([k, d]) => ({ bibit: k, stok: Math.max(0, d.masuk - d.keluar - d.mati) }))
    .sort((a, b) => b.stok - a.stok)
    .slice(0, 5);

  const topLines = top5.map((x, i) => `${i + 1}. **${x.bibit}**: ${fmt(x.stok)} batang`);

  return `🌱 **Ringkasan Kinerja Nursery**\n*Update: ${dateLabel()}*\n━━━━━━━━━━━━━━━━━━\n📥 Bibit Masuk: **${fmt(totalMasuk)}** batang\n📤 Bibit Keluar: **${fmt(totalKeluar)}** batang\n💀 Bibit Mati: **${fmt(totalMati)}** batang\n🌿 Bibit Hidup: **${fmt(totalHidup)}** batang\n━━━━━━━━━━━━━━━━━━\n📈 Persentase Hidup: **${sr.toFixed(1)}%**\n📈 Realisasi Penyerapan: **${rp.toFixed(1)}%**\n🏆 Status Efisiensi: **${efisiensi}**\n━━━━━━━━━━━━━━━━━━\n🏅 **Top 5 Stok Tertinggi**:\n${topLines.join('\n')}\n\nTotal data: ${rows.length} record | ${Object.keys(rekap).length} jenis bibit`;
}

const HANDLERS: Record<string, () => Promise<string>> = {
  stok: handleStok,
  masuk: handleMasuk,
  keluar: handleKeluar,
  mati: handleMati,
  'hari-ini': handleHariIni,
  '7-hari': handle7Hari,
  sengon: handleSengon,
  tim: handleTim,
  kritis: handleKritis,
  kinerja: handleKinerja,
};

export async function processMessage(text: string): Promise<string> {
  const lower = text.toLowerCase().trim();

  // match by menu id
  for (const opt of MENU_OPTIONS) {
    if (lower === opt.id || lower === opt.label.toLowerCase()) {
      return HANDLERS[opt.id]();
    }
  }

  // keyword matching
  if (lower.includes('stok') && !lower.includes('sengon')) return HANDLERS.stok();
  if (lower.includes('masuk')) return HANDLERS.masuk();
  if (lower.includes('keluar') && !lower.includes('sengon')) return HANDLERS.keluar();
  if (lower.includes('mati') || lower.includes('mortalitas')) return HANDLERS.mati();
  if (lower.includes('hari ini') || lower.includes('today')) return HANDLERS['hari-ini']();
  if (lower.includes('7 hari') || lower.includes('minggu') || lower.includes('tren')) return HANDLERS['7-hari']();
  if (lower.includes('sengon') || lower.includes('potting')) return HANDLERS.sengon();
  if (lower.includes('tim') || lower.includes('basri') || lower.includes('bahran')) return HANDLERS.tim();
  if (lower.includes('kritis') || lower.includes('habis') || lower.includes('warning')) return HANDLERS.kritis();
  if (lower.includes('kinerja') || lower.includes('ringkasan') || lower.includes('performa')) return HANDLERS.kinerja();

  return 'Maaf, saya belum mengerti pertanyaan itu. 🤔\nSilakan pilih salah satu menu di bawah, atau ketik kata kunci seperti **stok**, **masuk**, **keluar**, **mati**, **hari ini**, **sengon**, **tim**, **kritis**, atau **kinerja**.';
}
