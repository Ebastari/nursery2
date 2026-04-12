import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { RefreshCw, Shield, MessageCircle, TrendingUp } from 'lucide-react';
import { Card } from '../components/Card';
import { ChatbotPanel } from '../components/chatbot/ChatbotPanel';
import { ApprovalModal } from '../components/ApprovalModal';
import { useStore } from '../store/useStore';
import { useOnlineStatus } from '../data/useOnlineStatus';
import { loadPerformanceData, getPerformanceData } from '../data/performanceData';
import { fetchApiData, invalidateCache } from '../data/api';
import type { ApiRow } from '../data/api';
import { CalendarHeatmap } from '../components/CalendarHeatmap';

const DashboardScreen: React.FC = () => {
  const [perfData, setPerfData] = useState<any[]>([]);
  const { plants, refreshAll, isAdmin } = useStore();

  const [chatOpen, setChatOpen] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const isOnline = useOnlineStatus();

  const [bibitStats, setBibitStats] = useState<{nama: string, jumlah: number, percent: number}[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [errorStats, setErrorStats] = useState<string | null>(null);

const selectedTim = "Basri";

  useEffect(() => {
    loadPerformanceData().then(() => {
      const data = getPerformanceData('Semua');
      setPerfData(data);
    });
  }, []);

  useEffect(() => {
        invalidateCache(); // Clear cache first
        const loadBibitStats = async () => {
      try {
        setLoadingStats(true);
        setErrorStats(null);
        const allRows: ApiRow[] = await fetchApiData();

        // Debug: log unique tujuan values
        console.log('[DEBUG] All unique tujuan:', [...new Set(allRows.map(r => r.tujuan).filter(Boolean))]);
        console.log('[DEBUG] Total rows:', allRows.length);
        
        // Show rows with keluar > 0
        const rowsWithKeluar = allRows.filter(r => r.keluar && r.keluar > 0);
        console.log('[DEBUG] Rows with keluar > 0:', rowsWithKeluar.length);
        console.log('[DEBUG] Sample keluar rows:', rowsWithKeluar.slice(0, 5).map(r => ({bibit: r.bibit, tujuan: r.tujuan, keluar: r.keluar})));

        // Filter by TIM + nama (sama seperti chatbot)
        const timName = selectedTim.toUpperCase();
        console.log('[DEBUG] Searching for:', 'TIM ' + timName);
        
        const filteredByTim = allRows.filter((row: ApiRow) => {
          if (!row.tujuan || !row.keluar || row.keluar <= 0) return false;
          const tujuanUpper = row.tujuan.toUpperCase();
          return tujuanUpper.includes('TIM ' + timName) || tujuanUpper.includes(timName);
        });

        console.log('[DEBUG] Filtered by Tim Basri:', filteredByTim.length);
        console.log('[DEBUG] Sample filtered:', filteredByTim.slice(0, 3));

        // Daily keluar data for calendar
        const dailyMap = new Map<string, number>();
        filteredByTim.forEach((row: ApiRow) => {
          const dateKey = row.tanggal;
          dailyMap.set(dateKey, (dailyMap.get(dateKey) || 0) + (row.keluar || 0));
        });
        const dailyData = Array.from(dailyMap, ([tanggal, total]) => ({ tanggal, total }));
        setDailyKeluarData(dailyData);

        // Bibit stats - Distribusi ke Tim Basri (sama seperti chatbot)
        const bibitMap = new Map<string, number>();
        filteredByTim.forEach((row: ApiRow) => {
          const key = row.bibit?.toUpperCase().trim();
          if (key) {
            bibitMap.set(key, (bibitMap.get(key) || 0) + (row.keluar || 0));
          }
        });

        let bibitList = Array.from(bibitMap, ([nama, jumlah]) => ({ 
          nama, 
          jumlah: Number(jumlah),
          percent: 0 
        }));
        const totalBibit = bibitList.reduce((sum, b) => sum + b.jumlah, 0);

        console.log('[DEBUG] Bibit stats:', bibitList);

        bibitList = bibitList
          .map(b => ({
            ...b,
            percent: totalBibit > 0 ? Math.round((b.jumlah / totalBibit) * 100 * 10) / 10 : 0
          }))
          .sort((a, b) => b.jumlah - a.jumlah);
          // Removed .slice(0, 5) to show ALL bibit distribusi for Tim Basri

        setBibitStats(bibitList);
      } catch (err) {
        setErrorStats(`Gagal memuat data: ${(err as Error).message}`);
        setBibitStats([]);
        setDailyKeluarData([]);
      } finally {
        setLoadingStats(false);
      }
    };

    loadBibitStats();
  }, []);

  const totalBibit = bibitStats.reduce((sum, b) => sum + b.jumlah, 0);
  const insight = bibitStats.length > 0
    ? `${bibitStats[0].nama} mendominasi ${bibitStats[0].percent.toFixed(1)}% distribusi Tim Basri`
    : 'Belum ada data distribusi Tim Basri';

  const [dailyKeluarData, setDailyKeluarData] = useState<{tanggal: string, total: number}[]>([]);

  const handleRefresh = async () => {
    if (!isOnline || refreshing) return;
    setRefreshing(true);
    invalidateCache();
    await refreshAll();
    setRefreshing(false);
  };

  return (
    <>
      <div className="min-h-screen p-4 max-w-5xl mx-auto space-y-4">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Dashboard Bibit</h1>
          <div className="flex gap-2">
            <button onClick={handleRefresh} className="w-10 h-10 bg-emerald-500 text-white rounded-xl flex items-center justify-center">
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => setShowAdminModal(true)} className="w-10 h-10 bg-amber-500 text-white rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 🔥 HERO SECTION */}
        {loadingStats ? (
          <Card className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/80 to-teal-600/80 text-white shadow-lg flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </Card>
        ) : errorStats ? (
          <Card className="p-5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg">
            <div className="text-center">
              <p className="text-sm mb-2">{errorStats}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-3 py-1 bg-white/20 rounded-lg text-xs hover:bg-white/30 transition-colors"
              >
                Muat ulang
              </button>
            </div>
          </Card>
        ) : (
          <Card className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-2xl">
            <div className="flex justify-between items-center">

              <div>
                <div className="text-xs opacity-80">Tim Aktif</div>
                <div className="text-lg font-bold">Tim {selectedTim}</div>

                <div className="mt-2 text-2xl font-black">
                  {totalBibit.toLocaleString('id-ID')}
                </div>

                <div className="text-xs opacity-80">Total Distribusi Tim Basri 2026</div>
              </div>

              <div className="text-right">
                <div className="text-xs opacity-80">Top Bibit</div>
                <div className="text-lg font-bold">
                  {bibitStats[0]?.nama || '-'}
                </div>
                <div className="text-sm opacity-80">
                  {bibitStats[0]?.percent?.toFixed(1) || '0'}%
                </div>
              </div>

            </div>
          </Card>
        )}

        {/* 🔥 TOP METRICS */}
        <div className="grid grid-cols-3 gap-3">

          <Card className="p-3 text-center transition-all hover:scale-[1.02] hover:shadow-md">
            <div className="text-xs text-gray-500">Total Bibit 2026</div>
            <div className="text-lg font-bold">{totalBibit.toLocaleString('id-ID')}</div>
          </Card>

          <Card className="p-3 text-center transition-all hover:scale-[1.02] hover:shadow-md">
            <div className="text-xs text-gray-500">Jenis Top 5</div>
            <div className="text-lg font-bold">{bibitStats.length}</div>
          </Card>

          <Card className="p-3 text-center transition-all hover:scale-[1.02] hover:shadow-md">
            <div className="text-xs text-gray-500">Dominasi</div>
            <div className="text-lg font-bold">{(bibitStats[0]?.percent || 0).toFixed(0)}%</div>
          </Card>

        </div>

        {/* 🔥 DISTRIBUSI */}
        <Card className="p-4 rounded-2xl transition-all hover:scale-[1.02] hover:shadow-md">

          <div className="text-sm font-bold mb-3">Distribusi Tim Basri</div>

          <div className="space-y-4">
            {bibitStats.map((b, i) => (
              <div key={b.nama} className="space-y-1">

                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="text-gray-400">#{i + 1}</span>
                    {b.nama}
                  </span>
                  <span>{b.percent.toFixed(1)}%</span>
                </div>

                <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden">

                  <div
                    className="absolute h-3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                    style={{ width: `${b.percent}%` }}
                  />

                </div>

                <div className="text-[10px] text-gray-500">
                  {b.jumlah.toLocaleString('id-ID')} bibit
                </div>

              </div>
            ))}
          </div>

        </Card>

        {/* 🔥 INSIGHT */}
        <Card className="p-4 rounded-2xl bg-gray-50 border border-gray-200 transition-all hover:scale-[1.02] hover:shadow-md">

          <div className="text-xs text-gray-500 mb-1">Insight</div>

          <div className="text-sm font-medium" dangerouslySetInnerHTML={{__html: insight.replace('%', '<span class="text-emerald-600 font-bold">%</span>')}} />

        </Card>

        {/* 🔥 MONTHLY KALENDER KELUAR */}
        <Card className="p-6 rounded-2xl border border-gray-200 transition-all hover:scale-[1.02] hover:shadow-md">
          <div className="text-sm font-bold mb-4 text-gray-800">Pengeluaran Harian Tim {selectedTim}</div>
          {dailyKeluarData.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <div className="text-lg mb-2">📅</div>
              <p className="text-sm">Belum ada data harian untuk bulan ini</p>
            </div>
          ) : (
            <CalendarHeatmap data={dailyKeluarData} />
          )}
        </Card>

        {/* AI */}
        <Card onClick={() => setChatOpen(true)} className="p-4 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-md">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            <div>
              <div className="font-semibold text-sm">Montana AI</div>
              <div className="text-xs text-gray-500">Analisis data bibit</div>
            </div>
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