import { motion } from 'framer-motion';

interface SummaryCardProps {
  title: string;
  value: number;
  subtitle?: string;
  color: string;
  colorLight: string;
  icon: React.ReactNode;
  delay?: number;
}

export function SummaryCard({ title, value, subtitle = 'Keluar', colorLight, icon, delay = 0 }: SummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      whileTap={{ scale: 0.97 }}
      className="relative overflow-hidden rounded-2xl bg-white border border-gray-100/80 p-3 flex flex-col gap-2 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_14px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] transition-shadow duration-300 cursor-default"
    >
      {/* Decorative gradient blob */}
      <div className={`absolute -top-6 -right-6 w-20 h-20 rounded-full ${colorLight} opacity-60 blur-2xl pointer-events-none`} />

      <div className="flex items-center justify-between relative">
        <span className="section-title text-[8px] line-clamp-1 max-w-[90px] md:max-w-[110px]">{title}</span>
        <div className={`w-7 h-7 rounded-xl ${colorLight} flex items-center justify-center shadow-sm`}>
          {icon}
        </div>
      </div>
      <p className="text-base md:text-lg font-extrabold text-gray-900 tracking-tight leading-none relative">
        {value.toLocaleString('id-ID')}
      </p>
      <span className="text-[8px] text-gray-400 font-medium tracking-wide relative">{subtitle}</span>
    </motion.div>
  );
}

export function SummaryCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100/60 bg-white p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="h-2.5 w-16 skeleton" />
        <div className="w-8 h-8 skeleton rounded-xl" />
      </div>
      <div className="h-7 w-20 skeleton" />
      <div className="h-2.5 w-14 skeleton" />
    </div>
  );
}

