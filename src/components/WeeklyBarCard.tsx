import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { DailyOutput } from '../data/performanceData';

const HARI_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const BULAN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

interface WeeklyBarCardProps {
  /** Daily data sorted by tanggal ascending (yyyy-MM-dd) */
  data: DailyOutput[];
  bibitKeys: string[];
  bibitLabels: Record<string, string>;
  bibitColors: Record<string, string>;
}

interface WeekBucket {
  label: string;
  mondayKey: string;
  days: { label: string; data: DailyOutput | null }[];
}

function getMondayOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatDateShort(d: Date): string {
  return `${d.getDate()} ${BULAN[d.getMonth()]}`;
}

function buildWeeks(data: DailyOutput[], _bibitKeys: string[]): WeekBucket[] {
  // Map tanggal -> DailyOutput
  const dataMap = new Map<string, DailyOutput>();
  for (const d of data) {
    dataMap.set(d.tanggal, d);
  }

  // Find date range
  const dates = data.map((d) => d.tanggal).filter(Boolean).sort();
  if (dates.length === 0) return [];

  const firstDate = getMondayOfWeek(new Date(dates[0] + 'T00:00:00'));
  const lastDate = new Date(dates[dates.length - 1] + 'T00:00:00');
  const lastMonday = getMondayOfWeek(lastDate);

  const weeks: WeekBucket[] = [];
  const current = new Date(firstDate);

  while (current <= lastMonday) {
    const monday = new Date(current);
    const sunday = new Date(current);
    sunday.setDate(sunday.getDate() + 6);

    const days: { label: string; data: DailyOutput | null }[] = [];
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(current);
      dayDate.setDate(dayDate.getDate() + i);
      const key = dayDate.toISOString().slice(0, 10);
      const dayLabel = HARI_SHORT[dayDate.getDay()];
      days.push({
        label: `${dayLabel}\n${dayDate.getDate()}`,
        data: dataMap.get(key) || null,
      });
    }

    weeks.push({
      label: `${formatDateShort(monday)} – ${formatDateShort(sunday)}`,
      mondayKey: monday.toISOString().slice(0, 10),
      days,
    });

    current.setDate(current.getDate() + 7);
  }

  return weeks;
}

export function WeeklyBarCard({ data, bibitKeys, bibitLabels, bibitColors }: WeeklyBarCardProps) {
  const weeks = useMemo(() => buildWeeks(data, bibitKeys), [data, bibitKeys]);

  // Global max across all weeks for consistent Y scale
  const globalMax = useMemo(() => {
    let max = 0;
    for (const week of weeks) {
      for (const day of week.days) {
        if (day.data) {
          const total = day.data.total as number;
          if (total > max) max = total;
        }
      }
    }
    return Math.ceil(max * 1.1) || 100; // 10% padding
  }, [weeks]);

  // Start at last week (newest)
  const [weekIndex, setWeekIndex] = useState(Math.max(0, weeks.length - 1));
  const [direction, setDirection] = useState(0);

  const goNext = useCallback(() => {
    if (weekIndex >= weeks.length - 1) return;
    setDirection(1);
    setWeekIndex((i) => i + 1);
  }, [weekIndex, weeks.length]);

  const goPrev = useCallback(() => {
    if (weekIndex <= 0) return;
    setDirection(-1);
    setWeekIndex((i) => i - 1);
  }, [weekIndex]);

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    if (info.offset.x < -50) goNext();
    else if (info.offset.x > 50) goPrev();
  }, [goNext, goPrev]);

  if (weeks.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">Tidak ada data</p>;
  }

  const currentWeek = weeks[weekIndex];

  // Build chart data for the 7 days
  const chartData = currentWeek.days.map((day) => {
    const entry: Record<string, string | number> = { hari: day.label };
    for (const key of bibitKeys) {
      entry[key] = day.data ? ((day.data[key] as number) || 0) : 0;
    }
    entry.total = day.data ? (day.data.total as number) : 0;
    return entry;
  });

  // Week total
  const weekTotal = currentWeek.days.reduce((sum, d) => sum + (d.data ? (d.data.total as number) : 0), 0);

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 250 : -250, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -250 : 250, opacity: 0 }),
  };

  return (
    <div className="select-none">
      {/* Week navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goPrev}
          disabled={weekIndex <= 0}
          className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100 flex items-center justify-center transition-colors active:scale-95"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div className="text-center">
          <span className="text-sm font-bold text-gray-800">{currentWeek.label}</span>
          <p className="text-[10px] text-gray-400 font-medium">
            Minggu {weekIndex + 1}/{weeks.length} · Total: {weekTotal.toLocaleString('id-ID')} bibit
          </p>
        </div>
        <button
          onClick={goNext}
          disabled={weekIndex >= weeks.length - 1}
          className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-gray-100 flex items-center justify-center transition-colors active:scale-95"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Swipeable bar chart */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={weekIndex}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.15}
          onDragEnd={handleDragEnd}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="hari"
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                tickLine={false}
                axisLine={false}
                domain={[0, globalMax]}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: 12 }}
                labelStyle={{ fontWeight: 700, color: '#111827' }}
                formatter={(value, name) => [Number(value).toLocaleString('id-ID') + ' bibit', name]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 10, paddingTop: 4 }}
              />
              {bibitKeys.map((key) => (
                <Bar
                  key={key}
                  dataKey={key}
                  name={bibitLabels[key]}
                  fill={bibitColors[key]}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                  stackId="stack"
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
