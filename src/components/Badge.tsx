interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export function Badge({ children, variant = 'neutral', size = 'sm', dot = false }: BadgeProps) {
  const variants = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 shadow-[0_0_0_1px_rgba(16,185,129,0.06)]',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/80 shadow-[0_0_0_1px_rgba(245,158,11,0.06)]',
    danger: 'bg-red-50 text-red-700 border-red-200/80 shadow-[0_0_0_1px_rgba(239,68,68,0.06)]',
    info: 'bg-blue-50 text-blue-700 border-blue-200/80 shadow-[0_0_0_1px_rgba(59,130,246,0.06)]',
    neutral: 'bg-gray-50 text-gray-600 border-gray-200/80',
  };

  const dotColors = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    neutral: 'bg-gray-400',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ${variants[variant]} ${sizes[size]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      {children}
    </span>
  );
}
