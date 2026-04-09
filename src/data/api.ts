// === Live API — Google Apps Script ===

import { saveRowsToDB, getRowsFromDB } from './indexedDb';

export interface ApiRow {
  tanggal: string;
  bulan: string;
  bibit: string;
  masuk: number;
  keluar: number;
  mati: number;
  total: number;
  sumber: string;
  tujuan: string;
  statusKirim: string;
  kodeVerifikasi?: string;
  linkPdf?: string;
  dibuatOleh?: string;
  driver?: string;
}

interface ApiResponse {
  data: ApiRow[];
  count: number;
  timestamp: string;
}

export interface DropdownOptions {
  dibuatOleh: string[];
  driver: string[];
}

export const API_URL =
  "https://script.google.com/macros/s/AKfycbwVL7LiFSK4Z7nxKkc42AkLRDCG1-mA_wssfgBFj5O76BMbkQCGK_VGzfOuXpNSmAxT/exec";

let cachedRows: ApiRow[] | null = null;

export async function fetchApiData(): Promise<ApiRow[]> {
  if (cachedRows) return cachedRows;

  // Jika online, ambil dari API lalu simpan ke IndexedDB
  if (navigator.onLine) {
    try {
      const res = await fetch(API_URL, { redirect: "follow" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const text = await res.text();
      if (text.trimStart().startsWith("<")) {
        throw new Error("Apps Script error — bukan JSON");
      }

      const json: ApiResponse = JSON.parse(text);
      if (!json.data || !Array.isArray(json.data)) {
        throw new Error("Format response tidak sesuai");
      }

      cachedRows = json.data;

      // Simpan ke IndexedDB untuk akses offline
      try {
        await saveRowsToDB(cachedRows);
      } catch {
        // Gagal simpan ke IDB tidak fatal
      }

      return cachedRows;
    } catch (err) {
      // Jika fetch gagal meskipun online, coba ambil dari IndexedDB
      const offlineRows = await getRowsFromDB();
      if (offlineRows.length > 0) {
        cachedRows = offlineRows;
        return cachedRows;
      }
      throw err;
    }
  }

  // Jika offline, ambil dari IndexedDB
  const offlineRows = await getRowsFromDB();
  if (offlineRows.length > 0) {
    cachedRows = offlineRows;
    return cachedRows;
  }

  throw new Error("Tidak ada koneksi internet dan tidak ada data tersimpan.");
}

let cachedDropdowns: DropdownOptions | null = null;

export async function fetchDropdowns(): Promise<DropdownOptions> {
  if (cachedDropdowns) return cachedDropdowns;
  try {
    const res = await fetch(`${API_URL}?action=dropdowns`, { redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: DropdownOptions = await res.json();
    cachedDropdowns = json;
    return json;
  } catch {
    return { dibuatOleh: [], driver: [] };
  }
}

export function clearCache() {
  cachedRows = null;
}

export interface VerifyResult {
  valid: boolean;
  tanggal?: string;
  bibit?: string;
  masuk?: number;
  keluar?: number;
  mati?: number;
  sumber?: string;
  tujuan?: string;
  kodeVerifikasi?: string;
  error?: string;
}

export async function verifyCode(code: string): Promise<VerifyResult> {
  const res = await fetch(`${API_URL}?verify=${encodeURIComponent(code)}`, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  if (text.trimStart().startsWith('<')) {
    throw new Error('Apps Script error — bukan JSON');
  }
  return JSON.parse(text);
}
