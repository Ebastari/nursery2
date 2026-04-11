import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  Wifi, WifiOff, RefreshCw, Shield, Sparkles, Package, MessageCircle, 
  ChevronRight, TrendingUp, AlertTriangle 
} from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { ApprovalModal } from '../components/ApprovalModal';
import { ChatbotPanel } from '../components/chatbot/ChatbotPanel';
import { useStore } from '../store/useStore';
import { useOnlineStatus } from '../data/useOnlineStatus';
import type { PlantStock, Alert, Document } from '../data/types';
import DocumentPreview from '../components/DocumentPreview';
import { ChartContainer } from '../components/ChartContainer';
import LineChartCard from '../../nursery-dashboard/src/components/LineChartCard';
import { loadPerformanceData, getPerformanceData, getSummary } from '../data/performanceData';

const DashboardScreen: React.FC = () => {
  // ...existing code...
  // State dan variabel lain
  // ...existing code...
  // (sudah dideklarasikan di atas, hapus duplikat)

  // Helper untuk Ringkasan Kinerja Bibit
  let summaryItems: any[] = [];
  if (summary) {
    summaryItems = [
      {
        title: 'Total Keluar',
        value: summary.totalKeseluruhan.toLocaleString('id-ID'),
        desc: 'Semua bibit',
        color: 'from-emerald-500 to-emerald-600',
        bg: 'from-emerald-50 to-emerald-100'
      },
      ...(summary.perBibit || []).slice(0, 8).map((b: any) => ({
        title: b.bibit,
        value: b.total.toLocaleString('id-ID'),
        desc: 'Keluar',
        color: 'from-blue-500 to-indigo-600',
        bg: 'from-blue-50 to-indigo-100'
      }))
    ];
  }
  const { plants, alerts, documents, approvals, lastUpdated, loadingPlants, fetchAlerts, loadLastUpdated, refreshAll, isAdmin } = useStore();
  function getApprovalStatus(nomorSurat: string) {
    return approvals.find((a) => a.nomorSurat === nomorSurat && a.status === 'approved');
  }

  const [showAdminModal, setShowAdminModal] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isOnline = useOnlineStatus();

  // (hapus duplikat deklarasi di sini)
  const [summary2026, setSummary2026] = useState<any>(null);
  const [avgPerDay2026, setAvgPerDay2026] = useState<number>(0);

  useEffect(() => {
    fetchAlerts();
    loadLastUpdated();
    loadPerformanceData().then(() => {
      const data = getPerformanceData('Semua');
      setPerfData(data);
      setSummary(getSummary(data));
      // Filter data tahun 2026
      const data2026 = data.filter((d: any) => {
        if (!d.tanggal) return false;
        const year = d.tanggal.slice(0, 4);
        return year === '2026';
      });
      setSummary2026(getSummary(data2026));
      setAvgPerDay2026(data2026.length > 0 ? getSummary(data2026).totalKeseluruhan / data2026.length : 0);
      setPerfLoaded(true);
    });
  }, [fetchAlerts, loadLastUpdated]);

  const totalStock = plants.reduce((sum, p: PlantStock) => sum + p.stock, 0);
  const unreadAlerts = alerts.filter((a: Alert) => !a.read);
  const dateLabel = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

  const handleRefresh = async () => {
    if (!isOnline || refreshing) return;
    setRefreshing(true);
    try {
      await refreshAll();
    } finally {
      setRefreshing(false);
    }
  };

  const lastUpdatedLabel = lastUpdated
    ? new Date(lastUpdated).toLocaleString('id-ID', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : null;

  if (loadingPlants) return <div>Loading...</div>;

  return (
    <>
      <div className="min-h-screen space-y-6 p-6 lg:p-8 max-w-7xl mx-auto py-8">
        {/* 1. Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 lg:gap-0">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent tracking-tight">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">{dateLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={!isOnline || refreshing}
              className="w-14 h-14 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 disabled:opacity-50 disabled:shadow-none transition-all text-white"
              title="Refresh Data"
            >
              <RefreshCw className={`w-6 h-6 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowAdminModal(true)}
              className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
              title={isAdmin ? 'Admin Active' : 'Admin Login'}
            >
              <Shield className={`w-6 h-6 ${isAdmin ? 'text-white' : 'text-white/80'}`} />
            </button>
          </div>
        </div>

        {/* 2. Status Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-white to-blue-50 border border-emerald-200 shadow-2xl">
          <div className="flex items-center gap-4 mb-4 md:mb-0">
            {isOnline ? (
              <>
                <div className="w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-emerald-200 animate-ping"></div>
                <span className="font-bold text-emerald-800 text-lg">● Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-8 h-8 text-amber-500" />
                <span className="font-bold text-amber-800 text-lg">● Offline</span>
              </>
            )}
          </div>
          {lastUpdatedLabel && (
            <div className="text-sm text-gray-600 font-semibold bg-white/80 px-4 py-2 rounded-2xl shadow-lg border border-gray-200">
              <span className="block md:inline text-xs text-gray-500">Last Update</span>
              <span>{lastUpdatedLabel}</span>
            </div>
          )}
        </div>

        {/* 3. Offline Warning (if offline) */}
        {!isOnline && (
          <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center shadow-lg">
                <WifiOff className="w-8 h-8 text-amber-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-amber-900 mb-1">Offline Mode</h3>
                <p className="text-amber-800">Showing cached data. Connect to internet for live updates.</p>
              </div>
            </div>
          </Card>
        )}

        {/* 4. Total Stok Bibit - Hero Card */}
        <Card className="overflow-hidden !border-0 shadow-2xl !rounded-3xl group hover:shadow-3xl transition-all duration-500">
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent opacity-75 blur-xl"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-7 h-7 text-emerald-300 drop-shadow-lg" />
                  <p className="text-emerald-100 font-bold text-lg uppercase tracking-wider">Total Stok Bibit</p>
                </div>
                <p className="text-6xl lg:text-7xl font-black text-white leading-none drop-shadow-2xl group-hover:scale-105 transition-transform duration-300">
                  {totalStock.toLocaleString('id-ID')}
                </p>
                <p className="text-emerald-100 text-lg font-semibold">{plants.length} jenis tanaman aktif</p>
              </div>
              <div className="w-28 h-28 bg-white/10 backdrop-blur-xl rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300">
                <Package className="w-12 h-12 text-white drop-shadow-lg" />
              </div>
            </div>
          </div>
        </Card>

        {/* 5. Montana Bibit AI */}
        <Card className="group hover:shadow-2xl transition-all duration-300 cursor-pointer border-0 overflow-hidden !rounded-3xl shadow-xl hover:-translate-y-2">
          <button className="w-full text-left p-0" onClick={() => setChatOpen(true)}>
            <div className="p-8 flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl flex items-center justify-center shadow-2xl shrink-0">
                <MessageCircle className="w-10 h-10 text-slate-200" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-2xl font-black text-gray-900">Montana Bibit AI</h3>
                  <Badge className="bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold uppercase tracking-wider">Live</Badge>
                </div>
                <p className="text-gray-600 text-lg leading-relaxed">Tanya stok, kinerja, distribusi, dan data nursery secara real-time</p>
              </div>
              <ChevronRight className="w-8 h-8 text-gray-400 group-hover:translate-x-1 transition-transform duration-300 shrink-0" />
            </div>
          </button>
        </Card>

        {/* 6. Ringkasan Kinerja Bibit - 3x3 Grid (khusus tahun 2026) */}
        <Card className="!p-0 border-0 shadow-2xl rounded-3xl overflow-hidden">
          <div className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-2xl font-black text-gray-900 mb-8">Ringkasan Kinerja Bibit 2026</h2>
            {summary ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {summaryItems.map((item, idx) => (
                  <div key={idx} className="group p-6 rounded-2xl hover:shadow-xl transition-all duration-300 bg-gradient-to-br bg-opacity-50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-sm font-bold text-gray-600 uppercase tracking-wide`}>{item.desc}</span>
                    </div>
                    <div className="space-y-2">
                      <p className={`text-4xl font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent drop-shadow-lg group-hover:scale-105 transition-transform`}>{item.value}</p>
                      <p className="text-lg font-bold text-gray-900">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-2xl animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Loading ringkasan kinerja...</p>
              </div>
            )}
          </div>
        </Card>

        {/* 7. Grafik Kinerja - Single Block */}
        {perfLoaded && (
          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-6">Grafik Kinerja - 7 Hari Terakhir</h2>
              <ChartContainer title="Total Bibit Keluar">
                <LineChartCard data={perfData.slice(-7)} />
              </ChartContainer>
            </div>
          </Card>
        )}

        {/* 8. Stok Per Tanaman */}
        <Card className="shadow-xl rounded-3xl border-0 p-1">
          <div className="p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
              Stok Per Tanaman
              <span className="text-sm text-emerald-600 font-bold bg-emerald-100 px-3 py-1 rounded-full">{plants.length} Jenis</span>
            </h2>
            <div className="space-y-4">
              {plants.slice(0, 8).map((plant: PlantStock) => {
                const percentage = plant.maxStock > 0 ? Math.round((plant.stock / plant.maxStock) * 100) : 0;
                const variant = percentage > 50 ? 'success' : percentage > 20 ? 'warning' : 'danger';
                const color = percentage > 50 ? 'emerald' : percentage > 20 ? 'amber' : 'red';
                return (
                  <Card key={plant.id} className="flex items-center justify-between p-6 hover:shadow-md transition-shadow !border-emerald-100">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-${color}-50 to-${color}-100 flex items-center justify-center shadow-md`}>
                        <TrendingUp className="w-7 h-7 text-${color}-600" />
                      </div>
                      <div>
                        <p className="font-bold text-xl text-gray-900">{plant.name}</p>
                        <p className="text-sm text-gray-500">Max: {plant.maxStock.toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-3xl font-black text-gray-900">{plant.stock.toLocaleString('id-ID')}</p>
                      <Badge variant={variant} className="text-xs">{percentage}%</Badge>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </Card>

        {/* 9. Peringatan */}
        {unreadAlerts.length > 0 && (
          <Card className="shadow-xl rounded-3xl border-red-200 border !border-opacity-50">
            <div className="p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                Peringatan
                <Badge variant="danger" className="text-lg px-4 py-2">
                  {unreadAlerts.length}
                </Badge>
              </h2>
              <div className="space-y-4">
                {unreadAlerts.slice(0, 5).map((alert: Alert) => {
                  const severityColor = alert.severity === 'high' ? 'red' : alert.severity === 'medium' ? 'amber' : 'blue';
                  return (
                    <div key={alert.id} className="flex items-start gap-4 p-5 bg-gradient-to-r from-white to-gray-50 rounded-2xl hover:shadow-md transition-all border-l-4 border-l-${severityColor}-500">
                      <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-${severityColor}-50 to-${severityColor}-100 flex items-center justify-center shadow-lg flex-shrink-0`}>
                        <AlertTriangle className={`w-6 h-6 text-${severityColor}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 mb-1 leading-tight">{alert.message}</p>
                        <p className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleTimeString('id-ID')}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        )}

        {/* 10. Distribusi & Surat Jalan */}
        <Card className="shadow-2xl rounded-3xl border-0">
          <div className="p-8">
            <h2 className="text-2xl font-black text-gray-900 mb-8">Distribusi & Surat Jalan</h2>
            {documents.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg">Belum ada dokumen distribusi</p>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.slice(0, 6).map((doc: Document) => {
                  const approval = getApprovalStatus(doc.nomor);
                  const statusColor = approval ? 'emerald' : 'gray';
                  return (
                    <div key={doc.id} className="flex flex-col lg:flex-row lg:items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-white rounded-2xl hover:shadow-md transition-all group">
                      <div>
                        <h4 className="font-bold text-xl text-gray-900">No: {doc.nomor}</h4>
                        <p className="text-gray-600">Tanggal: {doc.tanggal}</p>
                      </div>
                      <div className="flex items-center gap-3 mt-4 lg:mt-0">
                        <Badge className={`text-sm font-bold px-4 py-2 bg-${statusColor}-100 text-${statusColor}-800`}>
                          {approval ? '✅ Disetujui' : '⏳ Belum Disetujui'}
                        </Badge>
                        {approval && doc.pdfUrl && doc.pdfUrl !== '#' && (
                          <button
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                            onClick={() => window.open(doc.pdfUrl, '_blank')}
                          >
                            📄 Lihat PDF
                          </button>
                        )}
                      </div>
                      {approval && doc.pdfUrl && doc.pdfUrl !== '#' && (
                        <div className="mt-6 lg:mt-0">
                          <DocumentPreview url={doc.pdfUrl} height={200} ttdSopir={doc.ttdSopir} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>

      <AnimatePresence>
        {chatOpen && <ChatbotPanel onClose={() => setChatOpen(false)} mode="info" />}
      </AnimatePresence>

      <ApprovalModal 
        isOpen={showAdminModal} 
        onClose={() => setShowAdminModal(false)} 
        onSuccess={() => setShowAdminModal(false)} 
      />
    </>
  );
};

export default DashboardScreen;

