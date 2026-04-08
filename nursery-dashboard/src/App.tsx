import { useEffect, useMemo, useState } from "react";
import {
  fetchData,
  filterRows,
  getSummary,
  getDailyData,
  getRekapPerBibit,
  uniqueBibit,
  uniqueTujuan,
  uniqueBulan,
  getBibitColor,
} from "./data";
import type { Row } from "./data";
import SummaryCard from "./components/SummaryCard";
import Filter from "./components/Filter";
import LineChartCard from "./components/LineChartCard";
import BarChartCard from "./components/BarChartCard";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Leaf,
  Package,
  Loader2,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

export default function App() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tujuan, setTujuan] = useState("Semua");
  const [bulan, setBulan] = useState("Semua");
  const [bibit, setBibit] = useState("Semua");

  const load = () => {
    setLoading(true);
    setError("");
    fetchData()
      .then(setRows)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const tujuanOpts = useMemo(() => uniqueTujuan(rows), [rows]);
  const bulanOpts = useMemo(() => uniqueBulan(rows), [rows]);
  const bibitOpts = useMemo(() => ["Semua", ...uniqueBibit(rows)], [rows]);

  const filtered = useMemo(
    () => filterRows(rows, { tujuan, bulan, bibit }),
    [rows, tujuan, bulan, bibit]
  );

  const summary = useMemo(() => getSummary(filtered), [filtered]);
  const bibitTypes = useMemo(() => uniqueBibit(filtered), [filtered]);
  const daily = useMemo(() => getDailyData(filtered, bibitTypes), [filtered, bibitTypes]);
  const rekap = useMemo(() => getRekapPerBibit(filtered), [filtered]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-md px-4 py-5 space-y-5 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-extrabold text-gray-900 tracking-tight">
              Nursery Dashboard
            </h1>
            <p className="text-[11px] text-gray-400 mt-0.5">
              PT Energi Batubara Lestari
            </p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-sm text-gray-400">Memuat data dari spreadsheet...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="flex flex-col items-center py-16 gap-3 text-center">
            <AlertTriangle className="w-10 h-10 text-red-400" />
            <p className="text-sm text-gray-600">{error}</p>
            <button
              onClick={load}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Data loaded */}
        {!loading && !error && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 gap-3">
              <SummaryCard
                title="Total Masuk"
                value={summary.totalMasuk}
                subtitle="Bibit masuk"
                icon={<ArrowDownToLine className="w-4 h-4" />}
                color="text-emerald-600"
              />
              <SummaryCard
                title="Total Keluar"
                value={summary.totalKeluar}
                subtitle="Bibit keluar"
                icon={<ArrowUpFromLine className="w-4 h-4" />}
                color="text-blue-600"
              />
              <SummaryCard
                title="Mati"
                value={summary.totalMati}
                subtitle="Mortalitas"
                icon={<Leaf className="w-4 h-4" />}
                color="text-red-500"
              />
              <SummaryCard
                title="Stok Akhir"
                value={summary.stokAkhir}
                subtitle="Masuk − Keluar − Mati"
                icon={<Package className="w-4 h-4" />}
                color="text-purple-600"
              />
            </div>

            {/* Filters */}
            <Filter
              tujuan={tujuan}
              tujuanOptions={tujuanOpts}
              onTujuanChange={setTujuan}
              bulan={bulan}
              bulanOptions={bulanOpts}
              onBulanChange={setBulan}
              bibit={bibit}
              bibitOptions={bibitOpts}
              onBibitChange={setBibit}
              count={filtered.length}
            />

            {/* Charts */}
            <LineChartCard data={daily} />
            <BarChartCard data={daily} bibitTypes={bibitTypes} />

            {/* Rekap Stok per Bibit */}
            <div className="space-y-2">
              <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                Rekap Stok per Jenis Bibit
              </h3>
              {rekap.map((r, i) => (
                <div
                  key={r.bibit}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex items-center gap-3"
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: getBibitColor(i) }}
                  >
                    {r.bibit.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{r.bibit}</p>
                    <p className="text-[10px] text-gray-400">
                      M: {r.masuk.toLocaleString("id-ID")} &middot;
                      K: {r.keluar.toLocaleString("id-ID")} &middot;
                      †: {r.mati.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-gray-900">{r.stok.toLocaleString("id-ID")}</p>
                    <span className={`text-[10px] font-medium ${
                      r.stok <= 0 ? "text-red-500" : r.stok < 1000 ? "text-amber-500" : "text-emerald-500"
                    }`}>
                      {r.stok <= 0 ? "Habis" : r.stok < 1000 ? "Menipis" : "Aman"}
                    </span>
                  </div>
                </div>
              ))}
              {rekap.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">Tidak ada data</p>
              )}
            </div>

            {/* Footer */}
            <p className="text-center text-[10px] text-gray-300 pt-4">
              Data langsung dari Google Sheets &middot; {rows.length} total record
            </p>
          </>
        )}
      </div>
    </div>
  );
}
