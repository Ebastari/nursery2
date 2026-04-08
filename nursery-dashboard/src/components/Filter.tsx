import { ChevronDown, X } from "lucide-react";

type DropdownProps = {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
};

function Dropdown({ label, value, options, onChange }: DropdownProps) {
  const active = value !== "Semua";
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-xl border px-3 py-2 pr-8 text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            active
              ? "border-emerald-400 bg-emerald-50 text-emerald-800"
              : "border-gray-200 bg-white text-gray-700"
          }`}
        >
          {options.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <ChevronDown
          className={`pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${
            active ? "text-emerald-500" : "text-gray-400"
          }`}
        />
      </div>
    </div>
  );
}

type Props = {
  tujuan: string;
  tujuanOptions: string[];
  onTujuanChange: (v: string) => void;
  bulan: string;
  bulanOptions: string[];
  onBulanChange: (v: string) => void;
  bibit: string;
  bibitOptions: string[];
  onBibitChange: (v: string) => void;
  count: number;
};

export default function Filter(props: Props) {
  const activeFilters = [
    props.tujuan !== "Semua" ? { label: props.tujuan, clear: () => props.onTujuanChange("Semua") } : null,
    props.bulan !== "Semua" ? { label: props.bulan, clear: () => props.onBulanChange("Semua") } : null,
    props.bibit !== "Semua" ? { label: props.bibit, clear: () => props.onBibitChange("Semua") } : null,
  ].filter(Boolean) as { label: string; clear: () => void }[];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Dropdown label="Tujuan" value={props.tujuan} options={props.tujuanOptions} onChange={props.onTujuanChange} />
        <Dropdown label="Bulan" value={props.bulan} options={props.bulanOptions} onChange={props.onBulanChange} />
        <Dropdown label="Bibit" value={props.bibit} options={props.bibitOptions} onChange={props.onBibitChange} />
      </div>

      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeFilters.map((f) => (
            <button
              key={f.label}
              onClick={f.clear}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-200"
            >
              {f.label}
              <X className="w-3 h-3" />
            </button>
          ))}
          <span className="text-[11px] text-gray-400 ml-auto">{props.count} record</span>
        </div>
      )}
    </div>
  );
}
