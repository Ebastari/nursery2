
import { Badge } from '../components/Badge';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { Sprout, Package } from 'lucide-react';
import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';



function getMortalityColor(rate: number): string {
  if (rate <= 10) return 'bg-emerald-500';
  if (rate <= 25) return 'bg-amber-500';
  return 'bg-red-500';
}
function getMortalityBg(rate: number): string {
  if (rate <= 10) return 'bg-emerald-100';
  if (rate <= 25) return 'bg-amber-100';
  return 'bg-red-100';
}
function getMortalityVariant(rate: number): 'success' | 'warning' | 'danger' {
  if (rate <= 10) return 'success';
  if (rate <= 25) return 'warning';
  return 'danger';
}
function getMortalityLabel(rate: number): string {
  if (rate <= 10) return 'Sehat';
  if (rate <= 25) return 'Waspada';
  return 'Kritis';
}

export function StockScreen() {
  const { plants, loadingPlants, fetchPlants, activities, loadingActivities, fetchActivities } = useStore();

  useEffect(() => {
    fetchPlants();
    fetchActivities();
  }, [fetchPlants, fetchActivities]);

  if (loadingPlants || loadingActivities) return <LoadingState />;
  if (plants.length === 0) return <EmptyState message="Belum ada data stok" icon={Sprout} />;

  // Hitung total
  const totalMasuk = activities.reduce((sum, a) => sum + (a.masuk || 0), 0);
  const totalKeluar = activities.reduce((sum, a) => sum + (a.keluar || 0), 0);
  const totalMati = activities.reduce((sum, a) => sum + (a.mati || 0), 0);
  const totalStok = plants.reduce((sum, p) => sum + (p.stock || 0), 0);

  // Hari ini
  const today = new Date().toISOString().split('T')[0];
  const masukHariIni = activities.filter(a => a.tanggal === today).reduce((sum, a) => sum + (a.masuk || 0), 0);
  const keluarHariIni = activities.filter(a => a.tanggal === today).reduce((sum, a) => sum + (a.keluar || 0), 0);
  const matiHariIni = activities.filter(a => a.tanggal === today).reduce((sum, a) => sum + (a.mati || 0), 0);

  return (
    <div className="fade-in space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Stok Bibit</h1>
        <p className="text-sm text-gray-500">{plants.length} jenis tanaman</p>
      </div>

      {/* Ringkasan total */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Total Bibit</div>
          <div className="text-lg font-bold text-emerald-700">{totalStok.toLocaleString('id-ID')}</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Total Masuk</div>
          <div className="text-lg font-bold text-blue-700">{totalMasuk.toLocaleString('id-ID')}</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Total Keluar</div>
          <div className="text-lg font-bold text-orange-700">{totalKeluar.toLocaleString('id-ID')}</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Total Mati</div>
          <div className="text-lg font-bold text-red-700">{totalMati.toLocaleString('id-ID')}</div>
        </Card>
      </div>

      {/* Ringkasan hari ini */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Masuk Hari Ini</div>
          <div className="text-lg font-bold text-blue-600">{masukHariIni.toLocaleString('id-ID')}</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Keluar Hari Ini</div>
          <div className="text-lg font-bold text-orange-600">{keluarHariIni.toLocaleString('id-ID')}</div>
        </Card>
        <Card className="p-3 text-center">
          <div className="text-xs text-gray-500 mb-1">Mati Hari Ini</div>
          <div className="text-lg font-bold text-red-600">{matiHariIni.toLocaleString('id-ID')}</div>
        </Card>
      </div>

      <div className="space-y-3">
        {plants.map((plant) => (
          <Card key={plant.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Package className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{plant.name}</p>
                  <p className="text-xs text-gray-400">Diperbarui: {plant.lastUpdated}</p>
                </div>
              </div>
              <Badge variant={getMortalityVariant(plant.mortalityRate)} size="md">
                {getMortalityLabel(plant.mortalityRate)}
              </Badge>
            </div>

            {/* Stock info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Stok Saat Ini</span>
              <span className="font-bold text-gray-900">{plant.stock.toLocaleString('id-ID')} / {plant.maxStock.toLocaleString('id-ID')}</span>
            </div>

            {/* Mortality rate progress bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-500">Persentase Kematian</span>
                <span className="font-semibold text-gray-700">{plant.totalMati.toLocaleString('id-ID')} / {plant.totalMasuk.toLocaleString('id-ID')} = {plant.mortalityRate}%</span>
              </div>
              <div className={`w-full h-2.5 rounded-full ${getMortalityBg(plant.mortalityRate)}`}>
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getMortalityColor(plant.mortalityRate)}`}
                  style={{ width: `${Math.min(plant.mortalityRate, 100)}%` }}
                />
              </div>
            </div>

            {/* Stock progress bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-gray-500">Kapasitas Stok</span>
                <span className="font-semibold text-gray-700">{Math.round((plant.stock / plant.maxStock) * 100)}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min((plant.stock / plant.maxStock) * 100, 100)}%` }}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
