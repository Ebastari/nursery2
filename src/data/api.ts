// === Live API — Google Apps Script ===

// API URL di-export dari bawah agar bisa digunakan di mockData.ts

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
}

interface ApiResponse {
  data: ApiRow[];
  count: number;
  timestamp: string;
}

export const API_URL =
  "https://script.google.com/macros/s/AKfycbwVL7LiFSK4Z7nxKkc42AkLRDCG1-mA_wssfgBFj5O76BMbkQCGK_VGzfOuXpNSmAxT/exec";

let cachedRows: ApiRow[] | null = null;

export async function fetchApiData(): Promise<ApiRow[]> {
  if (cachedRows) return cachedRows;

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
  return cachedRows;
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
