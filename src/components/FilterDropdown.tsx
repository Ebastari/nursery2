import { ChevronDown, Filter, X } from 'lucide-react';

interface FilterDropdownProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  resultCount?: number;
}

export function FilterDropdown({ label, value, options, onChange, resultCount }: FilterDropdownProps) {
  const isFiltered = value !== 'Semua';

  return (
    <div className="space-y-2.5">
      <label className="flex items-center gap-1.5 section-title">
        <Filter className="w-3.5 h-3.5" />
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none border rounded-2xl px-4 py-3 pr-10 text-sm font-semibold shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-emerald-500/40 focus:border-emerald-500 ${
            isFiltered
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-white border-gray-200/80 text-gray-800'
          }`}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors ${
          isFiltered ? 'text-emerald-500' : 'text-gray-400'
        }`} />
      </div>

      {/* Active filter chip + result count */}
      {isFiltered && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => onChange('Semua')}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-[11px] font-semibold transition-all hover:bg-emerald-200 active:scale-95"
          >
            {value}
            <X className="w-3 h-3" />
          </button>
          {resultCount !== undefined && (
            <span className="text-[11px] text-gray-400 font-medium">{resultCount} record</span>
          )}
        </div>
      )}
    </div>
  );
}
