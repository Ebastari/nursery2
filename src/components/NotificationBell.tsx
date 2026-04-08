import { useEffect, useState, useRef } from 'react';
import { Bell, X, ArrowDownToLine, ArrowUpFromLine, Leaf, CheckCheck, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import type { Notification } from '../data/types';

function getJenisIcon(jenis: Notification['jenis']) {
  switch (jenis) {
    case 'masuk': return <ArrowDownToLine className="w-4 h-4 text-emerald-600" />;
    case 'keluar': return <ArrowUpFromLine className="w-4 h-4 text-blue-600" />;
    case 'mati': return <Leaf className="w-4 h-4 text-red-500" />;
  }
}

function getJenisLabel(jenis: Notification['jenis']) {
  switch (jenis) {
    case 'masuk': return 'Bibit Masuk';
    case 'keluar': return 'Realisasi Keluar';
    case 'mati': return 'Mortalitas';
  }
}

function getJenisBgColor(jenis: Notification['jenis']) {
  switch (jenis) {
    case 'masuk': return 'bg-emerald-50';
    case 'keluar': return 'bg-blue-50';
    case 'mati': return 'bg-red-50';
  }
}

function formatTanggal(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const {
    notifications,
    loadingNotifications,
    fetchNotifications,
    markNotificationRead,
    markAllNotificationsRead,
  } = useStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition"
      >
        <Bell className="w-[18px] h-[18px] text-white" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-lg"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-12 w-[340px] max-h-[70vh] bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.16)] border border-gray-100 overflow-hidden z-[100]"
          >
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/80">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-gray-900">Notifikasi</h3>
                {unreadCount > 0 && (
                  <span className="min-w-[20px] h-5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold flex items-center justify-center px-1.5">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-emerald-600 font-medium hover:underline px-2 py-1"
                  >
                    Tandai semua dibaca
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center transition"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(70vh-52px)] overscroll-contain">
              {loadingNotifications && (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
                </div>
              )}

              {!loadingNotifications && notifications.length === 0 && (
                <div className="flex flex-col items-center py-12 gap-2">
                  <Bell className="w-10 h-10 text-gray-200" />
                  <p className="text-sm text-gray-400">Belum ada notifikasi</p>
                </div>
              )}

              {!loadingNotifications && notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => markNotificationRead(notif.id)}
                  className={`px-4 py-3 border-b border-gray-50 cursor-pointer transition hover:bg-gray-50/80 ${
                    !notif.read ? 'bg-emerald-50/40' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${getJenisBgColor(notif.jenis)}`}>
                      {getJenisIcon(notif.jenis)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-semibold uppercase tracking-wider ${
                          notif.jenis === 'masuk' ? 'text-emerald-600' : notif.jenis === 'keluar' ? 'text-blue-600' : 'text-red-500'
                        }`}>
                          {getJenisLabel(notif.jenis)}
                        </span>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[13px] font-medium text-gray-900 mt-0.5 leading-snug">
                        Kegiatan realisasi {notif.jenis} bibit <strong>{notif.bibit}</strong> sebanyak{' '}
                        <strong>{notif.jumlah.toLocaleString('id-ID')}</strong> batang
                        {notif.sumber ? ` dari ${notif.sumber}` : ''}
                        {notif.tujuan ? ` menuju ${notif.tujuan}` : ''}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] text-gray-400">{formatTanggal(notif.tanggal)}</span>
                        {notif.statusKirim.includes('Terkirim') && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium">
                            <CheckCheck className="w-3 h-3" /> {notif.statusKirim.replace('✅ ', '')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
