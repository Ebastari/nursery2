import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: 'default' | 'elevated' | 'glass';
}

export function Card({ children, className = '', onClick, variant = 'default' }: CardProps) {
  const base = 'rounded-2xl p-4 transition-all duration-200';
  const variants = {
    default: 'bg-white border border-gray-100/80 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)]',
    elevated: 'bg-white border border-gray-100/60 shadow-[0_2px_6px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.06)]',
    glass: 'bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_2px_12px_rgba(0,0,0,0.06)]',
  };
  const interactive = onClick
    ? 'cursor-pointer hover:shadow-[0_2px_8px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 active:scale-[0.98] active:shadow-sm'
    : '';

  return (
    <div onClick={onClick} className={`${base} ${variants[variant]} ${interactive} ${className}`}>
      {children}
    </div>
  );
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-2xl p-4 border border-gray-100/60 bg-white space-y-3 ${className}`}>
      <div className="h-4 w-2/3 skeleton" />
      <div className="h-8 w-1/2 skeleton" />
      <div className="h-3 w-1/3 skeleton" />
    </div>
  );
}
