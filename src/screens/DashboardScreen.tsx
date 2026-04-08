import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { DashboardSkeleton } from '../components/LoadingState';
import {
  Sprout,
  ArrowDownToLine,
  ArrowUpFromLine,
  Leaf,
  AlertTriangle,
  TrendingUp,
  Package,
  Sparkles,
  MessageCircle,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { ChatbotPanel } from '../components/chatbot/ChatbotPanel';
import { AnimatePresence } from 'framer-motion';

export function DashboardScreen() {
  const { plants, activities, alerts, loadingPlants, loadingActivities, fetchPlants, fetchActivities, fetchAlerts } =
    useStore();
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    fetchPlants();
    fetchActivities();
    fetchAlerts();
  }, [fetchPlants, fetchActivities, fetchAlerts]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayActivities = activities.filter((a) => a.tanggal === todayStr);
  const totalMasuk = todayActivities.reduce((sum, a) => sum + a.masuk, 0) || activities.reduce((sum, a) => sum + a.masuk, 0);
  const totalKeluar = todayActivities.reduce((sum, a) => sum + a.keluar, 0) || activities.reduce((sum, a) => sum + a.keluar, 0);
  const totalMati = todayActivities.reduce((sum, a) => sum + a.mati, 0) || activities.reduce((sum, a) => sum + a.mati, 0);
  const totalStock = plants.reduce((sum, p) => sum + p.stock, 0);
  const unreadAlerts = alerts.filter((a) => !a.read);
  const dateLabel = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  if (loadingPlants || loadingActivities) return <DashboardSkeleton />;

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[1.35rem] font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-gray-400 mt-0.5">{dateLabel}</p>
        </div>
        <div className="relative">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Sprout className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Total Stock Card — Premium gradient */}
      <Card className="!p-0 overflow-hidden border-0 !shadow-[0_4px_24px_rgba(5,150,105,0.18)]">
        <div className="bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <p className="text-emerald-100 text-[11px] font-semibold uppercase tracking-wider">Total Stok Bibit</p>
              </div>
              <p className="text-[2rem] font-extrabold text-white tracking-tight leading-none">{totalStock.toLocaleString('id-ID')}</p>
              <p className="text-emerald-200/80 text-xs mt-2 font-medium">{plants.length} jenis tanaman aktif</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center">
              <Package className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </Card>

      {/* Montana Bibit AI */}
      <button
        onClick={() => setChatOpen(true)}
        className="w-full text-left"
      >
        <Card className="!p-0 overflow-hidden border-0 !shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:!shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-shadow">
          <div className="flex items-center gap-3.5 p-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center shrink-0 shadow-lg">
              <MessageCircle className="w-5.5 h-5.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-bold text-gray-900">Montana Bibit AI</h3>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[9px] font-bold uppercase tracking-wider">Live</span>
              </div>
              <p className="text-[12px] text-gray-400 mt-0.5">Tanya stok, kinerja, tim & data nursery real-time</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300 shrink-0" />
          </div>
        </Card>
      </button>

      <AnimatePresence>
        {chatOpen && <ChatbotPanel onClose={() => setChatOpen(false)} />}
      </AnimatePresence>

      {/* Today's Activity */}
      <div>
        <h2 className="section-title mb-3">Aktivitas Hari Ini</h2>
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center !py-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/80 flex items-center justify-center mx-auto mb-2.5 shadow-sm">
              <ArrowDownToLine className="w-[18px] h-[18px] text-emerald-600" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{totalMasuk}</p>
            <p className="text-[11px] text-gray-400 mt-1 font-medium">Masuk</p>
          </Card>
          <Card className="text-center !py-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/80 flex items-center justify-center mx-auto mb-2.5 shadow-sm">
              <ArrowUpFromLine className="w-[18px] h-[18px] text-blue-600" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{totalKeluar}</p>
            <p className="text-[11px] text-gray-400 mt-1 font-medium">Keluar</p>
          </Card>
          <Card className="text-center !py-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-50 to-red-100/80 flex items-center justify-center mx-auto mb-2.5 shadow-sm">
              <Leaf className="w-[18px] h-[18px] text-red-500" />
            </div>
            <p className="text-2xl font-extrabold text-gray-900 tracking-tight">{totalMati}</p>
            <p className="text-[11px] text-gray-400 mt-1 font-medium">Mati</p>
          </Card>
        </div>
      </div>

      {/* Stock Per Plant */}
      <div>
        <h2 className="section-title mb-3">Stok Per Tanaman</h2>
        <div className="space-y-2.5">
          {plants.map((plant) => (
            <Card key={plant.id} className="flex items-center justify-between !py-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100/80 flex items-center justify-center shadow-sm">
                  <TrendingUp className="w-[18px] h-[18px] text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-[13px]">{plant.name}</p>
                  <p className="text-[11px] text-gray-400">Maks: {plant.maxStock.toLocaleString('id-ID')}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-gray-900 text-[15px] tracking-tight">{plant.stock.toLocaleString('id-ID')}</p>
                <Badge
                  dot
                  variant={plant.stock / plant.maxStock > 0.5 ? 'success' : plant.stock / plant.maxStock > 0.2 ? 'warning' : 'danger'}
                >
                  {Math.round((plant.stock / plant.maxStock) * 100)}%
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Alerts Preview */}
      {unreadAlerts.length > 0 && (
        <div>
          <h2 className="section-title mb-3 flex items-center gap-2">
            Peringatan
            <Badge variant="danger" size="md" dot>{unreadAlerts.length}</Badge>
          </h2>
          <div className="space-y-2.5">
            {unreadAlerts.slice(0, 3).map((alert) => (
              <Card key={alert.id} className="flex items-start gap-3.5 !py-3.5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  alert.severity === 'high' ? 'bg-gradient-to-br from-red-50 to-red-100/80' : alert.severity === 'medium' ? 'bg-gradient-to-br from-amber-50 to-amber-100/80' : 'bg-gradient-to-br from-blue-50 to-blue-100/80'
                }`}>
                  <AlertTriangle className={`w-4 h-4 ${
                    alert.severity === 'high' ? 'text-red-500' : alert.severity === 'medium' ? 'text-amber-500' : 'text-blue-500'
                  }`} />
                </div>
                <div>
                  <p className="text-sm text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(alert.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
