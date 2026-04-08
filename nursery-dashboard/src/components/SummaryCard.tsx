import type { ReactNode } from "react";

type Props = {
  title: string;
  value: number;
  subtitle?: string;
  icon?: ReactNode;
  color?: string;
};

export default function SummaryCard({ title, value, subtitle, icon, color = "text-emerald-600" }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow p-4 flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">{title}</p>
        {icon && <span className={color}>{icon}</span>}
      </div>
      <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{value.toLocaleString("id-ID")}</p>
      {subtitle && <p className="text-[11px] text-gray-400">{subtitle}</p>}
    </div>
  );
}
