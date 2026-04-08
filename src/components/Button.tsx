import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-gradient-to-b from-emerald-500 to-emerald-600 text-white shadow-[0_2px_8px_rgba(5,150,105,0.3)] hover:shadow-[0_4px_16px_rgba(5,150,105,0.35)] active:from-emerald-600 active:to-emerald-700',
    secondary: 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 active:bg-gray-200',
    danger: 'bg-gradient-to-b from-red-500 to-red-600 text-white shadow-[0_2px_8px_rgba(239,68,68,0.3)] hover:shadow-[0_4px_16px_rgba(239,68,68,0.35)] active:from-red-600 active:to-red-700',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-50 active:bg-gray-100',
  };

  const sizes = {
    sm: 'px-3.5 py-2 text-sm',
    md: 'px-5 py-2.5 text-[0.9375rem]',
    lg: 'px-6 py-3.5 text-base',
  };

  return (
    <button
      className={`inline-flex items-center justify-center gap-2 font-semibold rounded-2xl transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : icon}
      {children}
    </button>
  );
}
