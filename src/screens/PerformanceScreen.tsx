import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import {
  Package, Sprout, Loader2,
} from 'lucide-react';
import { SummaryCard, SummaryCardSkeleton } from '../components/SummaryCard';
import { ChartContainer, ChartSkeleton } from '../components/ChartContainer';
import { FilterDropdown } from '../components/FilterDropdown';
import { EmptyState } from '../components/EmptyState';
import { CalendarHeatmap } from '../components/CalendarHeatmap';
import {
  loadPerformanceData,
  getPerformanceData,
  getSummary,
  getTujuanOptions,
  getFilteredRecordCount,
  getBibitColors,
  getBibitLabels,
  getBibitOptions,
} from '../data/performanceData';

export function PerformanceScreen() {
  const [tujuanBibit, setTujuanBibit] = useState('Semua');
  const [filterBibit, setFilterBibit] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadPerformanceData().then(() => {
      setReady(true);
      setLoading(false);
    });
  }, []);

  const tujuanOptions = useMemo(() => (ready ? getTujuanOptions() : ['Semua']), [ready]);
  const bibitOptions = useMemo(() => (ready ? getBibitOptions() : ['Semua']), [ready]);
  const data = useMemo(() => (ready ? getPerformanceData(tujuanBibit, filterBibit) : []), [ready, tujuanBibit, filterBibit]);
  const summary = useMemo(() => getSummary(data), [data]);
  const recordCount = useMemo(() => (ready ? getFilteredRecordCount(tujuanBibit, filterBibit) : 0), [ready, tujuanBibit, filterBibit]);
  const bibitColors = useMemo(() => (ready ? getBibitColors() : {}), [ready]);
  const bibitLabels = useMemo(() => (ready ? getBibitLabels() : {}), [ready]);

  const handleFilterChange = (value: string) => {
    setLoading(true);
    setTujuanBibit(value);
    setTimeout(() => setLoading(false), 300);
  };

  const handleBibitFilterChange = (value: string) => {
    setLoading(true);
    setFilterBibit(value);
    setTimeout(() => setLoading(false), 300);
  };

  const bibitKeys = Object.keys(bibitLabels);

  if (!ready) {
    return (
      <div className="flex flex-col items-center py-20 gap-3">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        <p className="text-sm text-gray-400">Memuat data dari spreadsheet...</p>
      </div>
    );
  }

  // Build summary cards dynamically from live data
  const summaryCards = [
    { key: 'total', title: 'Total Keseluruhan', value: summary.totalKeseluruhan, color: 'text-emerald-600', colorLight: 'bg-emerald-50', icon: <Package className="w-4 h-4 text-emerald-600" /> },
    ...summary.perBibit.slice(0, 5).map((item, i) => {
      const colors = ['text-blue-600', 'text-teal-600', 'text-purple-600', 'text-green-600', 'text-yellow-600'];
      const bgs = ['bg-blue-50', 'bg-teal-50', 'bg-purple-50', 'bg-green-50', 'bg-yellow-50'];
      return {
        key: item.bibit,
        title: item.bibit,
        value: item.total,
        color: colors[i % colors.length],
        colorLight: bgs[i % bgs.length],
        icon: <Sprout className={`w-4 h-4 ${colors[i % colors.length]}`} />,
      };
    }),
  ];

  return (
    <div className="space-y-5 pb-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <h1 className="text-[1.2rem] font-extrabold text-gray-900 tracking-tight">Laporan Kinerja Tim Nursery</h1>
        <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Data Live dari Spreadsheet &middot; {recordCount} record</p>
      </motion.div>

      {/* Summary Cards — clickable bibit cards to filter */}
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => <SummaryCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {summaryCards.map((card, i) => (
            <div
              key={card.key}
              onClick={() => {
                if (card.key === 'total') {
                  handleBibitFilterChange('Semua');
                } else {
                  handleBibitFilterChange(filterBibit === card.title ? 'Semua' : card.title);
                }
              }}
              className="cursor-pointer"
            >
              <SummaryCard
                title={card.title}
                value={card.value}
                color={card.color}
                colorLight={card.colorLight}
                icon={card.icon}
                subtitle={filterBibit === card.title ? '✓ Aktif' : 'Keluar'}
                delay={i * 0.06}
              />
            </div>
          ))}
        </div>
      )}

      {/* Sticky Filters */}
      <div className="sticky top-14 z-40 bg-gray-50 py-2 -mx-4 px-4 space-y-2">
        <FilterDropdown
          label="Filter Tim / Tujuan Bibit"
          value={tujuanBibit}
          options={tujuanOptions}
          onChange={handleFilterChange}
          resultCount={recordCount}
        />
        <FilterDropdown
          label="Filter Jenis Bibit"
          value={filterBibit}
          options={bibitOptions}
          onChange={handleBibitFilterChange}
          resultCount={recordCount}
        />
      </div>

      {data.length === 0 ? (
        <EmptyState message="Tidak ada data untuk filter ini" />
      ) : (
        <>
          {/* Kalender Bulanan — Total Keluar Per Hari */}
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ChartContainer title="Kalender Distribusi Bibit" delay={0.1}>
              <CalendarHeatmap data={data.map((d) => ({ tanggal: d.tanggal, total: d.total as number }))} />
            </ChartContainer>
          )}

          {/* Detail Harian — Keluar Per Jenis Bibit */}
          {loading ? (
            <ChartSkeleton />
          ) : (() => {
            const reversed = [...data].reverse();
            // Cari max total harian untuk skala bar
            const maxDaily = Math.max(...reversed.map(d => (d.total as number) || 0), 1);
            return (
            <ChartContainer title="Keluar Per Jenis Bibit (Harian)" delay={0.2}>
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {reversed.map((day, i) => {
                  const total = (day.total as number) || 0;
                  if (total <= 0) return null;
                  const dateStr = (() => {
                    const d = new Date(day.tanggal + 'T00:00:00');
                    if (isNaN(d.getTime())) return day.tanggal;
                    const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
                    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
                  })();
                  // Kumpulkan jenis bibit yang > 0
                  const items = bibitKeys
                    .filter(k => (day[k] as number) > 0)
                    .map(k => ({ key: k, label: bibitLabels[k], value: day[k] as number, color: bibitColors[k] }));
                  return (
                    <motion.div
                      key={day.tanggal}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03, duration: 0.3 }}
                      className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-gray-800">{dateStr}</span>
                        <span className="text-xs font-extrabold text-emerald-600">{total.toLocaleString('id-ID')} bibit</span>
                      </div>
                      {/* Total bar */}
                      <div className="h-1.5 rounded-full bg-gray-100 mb-2.5">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                          style={{ width: `${(total / maxDaily) * 100}%` }}
                        />
                      </div>
                      {/* Per jenis bibit */}
                      <div className="space-y-1.5">
                        {items.map(item => {
                          const pct = total > 0 ? (item.value / total) * 100 : 0;
                          return (
                            <div key={item.key} className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                              <span className="text-[11px] text-gray-600 truncate flex-1 min-w-0">{item.label}</span>
                              <div className="w-20 h-2 rounded-full bg-gray-100 flex-shrink-0">
                                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: item.color }} />
                              </div>
                              <span className="text-[11px] font-bold text-gray-800 w-12 text-right flex-shrink-0">{item.value.toLocaleString('id-ID')}</span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </ChartContainer>
            );
          })()}

          {/* Bar Chart — Total Per Jenis Bibit (Summary) */}
          {loading ? (
            <ChartSkeleton />
          ) : (
            <ChartContainer title="Total Keluar Per Jenis Bibit" delay={0.3}>
              <div style={{ minWidth: '100%' }}>
                <ResponsiveContainer width="100%" height={Math.max(summary.perBibit.length * 44, 160)}>
                  <BarChart
                    data={summary.perBibit.map((item) => ({
                      bibit: item.bibit,
                      total: item.total,
                      fill: bibitColors[item.bibit.replace(/\s+/g, '_')] || '#6b7280',
                    }))}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
                    <YAxis
                      dataKey="bibit"
                      type="category"
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      tickLine={false}
                      axisLine={false}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }}
                      labelStyle={{ fontWeight: 700, color: '#111827' }}
                    />
                    <Bar
                      dataKey="total"
                      name="Total Keluar"
                      radius={[0, 6, 6, 0]}
                      maxBarSize={24}
                    >
                      {summary.perBibit.map((item, idx) => {
                        const color = bibitColors[item.bibit.replace(/\s+/g, '_')] || '#6b7280';
                        return <Cell key={idx} fill={color} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartContainer>
          )}
        </>
      )}
    </div>
  );
}
