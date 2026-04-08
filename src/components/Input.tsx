import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-600">{label}</label>
      <input
        className={`w-full px-4 py-3 rounded-xl border bg-white text-gray-900 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
          error ? 'border-red-300' : 'border-gray-200'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-600">{label}</label>
      <select
        className={`w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${className}`}
        {...props}
      >
        <option value="">Pilih...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
