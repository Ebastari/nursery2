import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DayData {
  tanggal: string; // yyyy-MM-dd
  total: number;
}

interface CalendarHeatmapProps {
  data: DayData[];
}

const HARI = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1; // Monday=0
}

function getIntensity(value: number, max: number): string {
  if (value <= 0) return 'bg-gray-50 text-gray-300';
  const ratio = max > 0 ? value / max : 0;
  if (ratio >= 0.75) return 'bg-emerald-500 text-white';
  if (ratio >= 0.5) return 'bg-emerald-400 text-white';
  if (ratio >= 0.25) return 'bg-emerald-200 text-emerald-800';
  return 'bg-emerald-100 text-emerald-700';
}

export function CalendarHeatmap({ data }: CalendarHeatmapProps) {
  const dataMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of data) {
      m.set(d.tanggal, (m.get(d.tanggal) || 0) + d.total);
    }
    return m;
  }, [data]);

  // Find latest month with data, fallback to current
  const initialDate = useMemo(() => {
    if (data.length === 0) return new Date();
    const sorted = [...data].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    const d = new Date(sorted[0].tanggal + 'T00:00:00');
    return isNaN(d.getTime()) ? new Date() : d;
  }, [data]);

  const [year, setYear] = useState(initialDate.getFullYear());
  const [month, setMonth] = useState(initialDate.getMonth());
  const [direction, setDirection] = useState(0);

  const goNext = useCallback(() => {
    setDirection(1);
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }, [month]);

  const goPrev = useCallback(() => {
    setDirection(-1);
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }, [month]);

  const handleDragEnd = useCallback((_: unknown, info: PanInfo) => {
    if (info.offset.x < -50) goNext();
    else if (info.offset.x > 50) goPrev();
  }, [goNext, goPrev]);

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);

  const monthMax = useMemo(() => {
    let max = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const v = dataMap.get(key) || 0;
      if (v > max) max = v;
    }
    return max;
  }, [year, month, daysInMonth, dataMap]);

  const monthTotal = useMemo(() => {
    let total = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      total += dataMap.get(key) || 0;
    }
    return total;
  }, [year, month, daysInMonth, dataMap]);

  const cells: { day: number; value: number }[] = [];
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) cells.push({ day: 0, value: 0 });
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, value: dataMap.get(key) || 0 });
  }

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0 }),
  };

  return (
    <div className="select-none">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={goPrev}
          className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95"
        >
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <div className="text-center">
          <span className="text-sm font-bold text-gray-800">{BULAN[month]} {year}</span>
          <p className="text-[10px] text-gray-400 font-medium">Total: {monthTotal.toLocaleString('id-ID')} bibit</p>
        </div>
        <button
          onClick={goNext}
          className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors active:scale-95"
        >
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {HARI.map((h) => (
          <div key={h} className="text-center text-[10px] font-semibold text-gray-400 py-1">{h}</div>
        ))}
      </div>

      {/* Calendar grid with swipe */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`${year}-${month}`}
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
          className="grid grid-cols-7 gap-1"
        >
          {cells.map((cell, i) => {
            if (cell.day === 0) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }
            const intensity = getIntensity(cell.value, monthMax);
            return (
              <div
                key={cell.day}
                className={`aspect-square rounded-lg ${intensity} flex flex-col items-center justify-center transition-colors duration-200 relative`}
              >
                <span className="text-[10px] font-bold leading-none">{cell.day}</span>
                {cell.value > 0 && (
                  <span className="text-[8px] font-semibold leading-none mt-0.5 opacity-80">
                    {cell.value >= 1000 ? `${(cell.value / 1000).toFixed(1)}k` : cell.value}
                  </span>
                )}
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-3">
        <span className="text-[9px] text-gray-400">Sedikit</span>
        <div className="flex gap-0.5">
          <div className="w-3 h-3 rounded-sm bg-gray-50 border border-gray-200" />
          <div className="w-3 h-3 rounded-sm bg-emerald-100" />
          <div className="w-3 h-3 rounded-sm bg-emerald-200" />
          <div className="w-3 h-3 rounded-sm bg-emerald-400" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
        </div>
        <span className="text-[9px] text-gray-400">Banyak</span>
      </div>
    </div>
  );
}
