import { fetchApiData } from './api';
import type { ApiRow } from './api';

export interface DailyOutput {
  tanggal: string;
  total: number;
  [bibit: string]: string | number;
}

export interface PerformanceSummary {
  totalKeseluruhan: number;
  perBibit: { bibit: string; total: number }[];
}

// Auto-assign colors for unlimited bibit types
const colorPalette = [
  '#3b82f6', '#14b8a6', '#a855f7', '#22c55e', '#eab308',
  '#ef4444', '#ec4899', '#f97316', '#06b6d4', '#6366f1',
  '#84cc16', '#e11d48',
];

let cachedRows: ApiRow[] | null = null;
let cachedBibitTypes: string[] = [];
let cachedBibitColors: Record<string, string> = {};
let cachedBibitLabels: Record<string, string> = {};

async function ensureData() {
  if (!cachedRows) {
    cachedRows = await fetchApiData();
    cachedBibitTypes = [...new Set(cachedRows.map((r) => r.bibit).filter(Boolean))].sort();
    cachedBibitColors = {};
    cachedBibitLabels = {};
    cachedBibitTypes.forEach((b, i) => {
      const key = b.replace(/\s+/g, '_');
      cachedBibitColors[key] = colorPalette[i % colorPalette.length];
      cachedBibitLabels[key] = b;
    });
  }
}

export async function loadPerformanceData() {
  await ensureData();
}

export function getBibitTypes(): string[] {
  return cachedBibitTypes;
}

export function getBibitColors(): Record<string, string> {
  return cachedBibitColors;
}

export function getBibitLabels(): Record<string, string> {
  return cachedBibitLabels;
}

export function getTujuanOptions(): string[] {
  if (!cachedRows) return ['Semua'];
  const unique = [...new Set(
    cachedRows
      .map((r) => r.tujuan)
      .filter((t) => t && t.toUpperCase().startsWith('TIM'))
  )].sort();
  return ['Semua', ...unique];
}

export function getBibitOptions(): string[] {
  if (!cachedRows) return ['Semua'];
  return ['Semua', ...cachedBibitTypes];
}

export function getPerformanceData(tujuanBibit: string, filterBibit: string = 'Semua'): DailyOutput[] {
  if (!cachedRows) return [];

  let filtered = tujuanBibit === 'Semua'
    ? cachedRows
    : cachedRows.filter((r) => r.tujuan === tujuanBibit);

  if (filterBibit !== 'Semua') {
    filtered = filtered.filter((r) => r.bibit === filterBibit);
  }

  const map = new Map<string, DailyOutput>();
  for (const rec of filtered) {
    if (!rec.tanggal) continue;
    let row = map.get(rec.tanggal);
    if (!row) {
      row = { tanggal: rec.tanggal, total: 0 };
      for (const b of cachedBibitTypes) {
        row[b.replace(/\s+/g, '_')] = 0;
      }
      map.set(rec.tanggal, row);
    }
    const key = rec.bibit.replace(/\s+/g, '_');
    if (key && row[key] !== undefined) {
      (row[key] as number) += rec.keluar;
    }
    row.total += rec.keluar;
  }

  return [...map.values()].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
}

// Get ISO week label from a date string (yyyy-MM-dd)
function getWeekLabel(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  // Get Monday of the week
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (dt: Date) => `${dt.getDate()}/${dt.getMonth() + 1}`;
  return `${fmt(monday)}-${fmt(sunday)}`;
}

function getWeekSortKey(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return '';
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  return monday.toISOString().slice(0, 10);
}

export function getWeeklyPerformanceData(tujuanBibit: string, filterBibit: string = 'Semua'): DailyOutput[] {
  if (!cachedRows) return [];

  let filtered = tujuanBibit === 'Semua'
    ? cachedRows
    : cachedRows.filter((r) => r.tujuan === tujuanBibit);

  if (filterBibit !== 'Semua') {
    filtered = filtered.filter((r) => r.bibit === filterBibit);
  }

  const map = new Map<string, { output: DailyOutput; sortKey: string }>();
  for (const rec of filtered) {
    if (!rec.tanggal) continue;
    const weekLabel = getWeekLabel(rec.tanggal);
    const sortKey = getWeekSortKey(rec.tanggal);
    if (!weekLabel) continue;

    let entry = map.get(weekLabel);
    if (!entry) {
      const row: DailyOutput = { tanggal: weekLabel, total: 0 };
      for (const b of cachedBibitTypes) {
        row[b.replace(/\s+/g, '_')] = 0;
      }
      entry = { output: row, sortKey };
      map.set(weekLabel, entry);
    }
    const key = rec.bibit.replace(/\s+/g, '_');
    if (key && entry.output[key] !== undefined) {
      (entry.output[key] as number) += rec.keluar;
    }
    entry.output.total += rec.keluar;
  }

  // Sort newest first
  return [...map.values()]
    .sort((a, b) => b.sortKey.localeCompare(a.sortKey))
    .map((e) => e.output);
}

export function getFilteredRecordCount(tujuanBibit: string, filterBibit: string = 'Semua'): number {
  if (!cachedRows) return 0;
  let rows = cachedRows;
  if (tujuanBibit !== 'Semua') rows = rows.filter((r) => r.tujuan === tujuanBibit);
  if (filterBibit !== 'Semua') rows = rows.filter((r) => r.bibit === filterBibit);
  return rows.length;
}

export function getSummary(data: DailyOutput[]): PerformanceSummary {
  const totalKeseluruhan = data.reduce((acc, d) => acc + (d.total as number), 0);
  const perBibit: { bibit: string; total: number }[] = [];

  for (const b of cachedBibitTypes) {
    const key = b.replace(/\s+/g, '_');
    const total = data.reduce((acc, d) => acc + ((d[key] as number) || 0), 0);
    if (total > 0) perBibit.push({ bibit: b, total });
  }
  perBibit.sort((a, b) => b.total - a.total);

  return { totalKeseluruhan, perBibit };
}
