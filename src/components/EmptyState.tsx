import { Inbox } from 'lucide-react';

export function EmptyState({ message = 'Belum ada data', subtitle, icon: Icon = Inbox }: { message?: string; subtitle?: string; icon?: React.ElementType }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="relative">
        <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-gray-100 rotate-6" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/60 flex items-center justify-center shadow-sm">
          <Icon className="w-7 h-7 text-gray-400" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-gray-600">{message}</p>
        <p className="text-[11px] text-gray-400 mt-1">{subtitle || 'Data akan muncul setelah ada input'}</p>
      </div>
    </div>
  );
}
