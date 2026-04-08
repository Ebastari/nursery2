import { motion } from 'framer-motion';

interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: number;
}

export function ChartContainer({ title, subtitle, children, delay = 0 }: ChartContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-2xl bg-white border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_14px_rgba(0,0,0,0.04)] overflow-hidden"
    >
      {/* Header with subtle gradient */}
      <div className="px-5 pt-5 pb-3 bg-gradient-to-b from-gray-50/80 to-white">
        <h3 className="text-sm font-bold text-gray-800 tracking-tight">{title}</h3>
        {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-4 pb-5 w-full overflow-x-auto">
        {children}
      </div>
    </motion.div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100/60 bg-white overflow-hidden">
      <div className="px-5 pt-5 pb-3">
        <div className="h-4 w-40 skeleton" />
      </div>
      <div className="px-5 pb-5">
        <div className="h-52 w-full skeleton rounded-xl" />
      </div>
    </div>
  );
}
