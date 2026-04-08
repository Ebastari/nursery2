import { Loader2 } from 'lucide-react';

export function LoadingState({ message = 'Memuat data...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative">
        <div className="absolute inset-0 w-12 h-12 rounded-full bg-emerald-200/40 pulse-ring" />
        <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Loader2 className="w-5 h-5 text-white animate-spin" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-600">{message}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">Mohon tunggu sebentar</p>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-5 w-28 skeleton" />
          <div className="h-3 w-20 skeleton" />
        </div>
        <div className="w-10 h-10 skeleton rounded-full" />
      </div>
      {/* Hero card skeleton */}
      <div className="h-28 w-full skeleton rounded-2xl" />
      {/* Activity cards */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 skeleton rounded-2xl" />
        ))}
      </div>
      {/* List items */}
      <div className="space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 skeleton rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
