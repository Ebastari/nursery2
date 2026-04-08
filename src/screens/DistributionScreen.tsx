import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { Truck, FileText, MapPin, User, Car } from 'lucide-react';
import type { ShipmentStatus } from '../data/types';

function getStatusVariant(status: ShipmentStatus): 'neutral' | 'info' | 'success' {
  switch (status) {
    case 'draft': return 'neutral';
    case 'dikirim': return 'info';
    case 'diterima': return 'success';
  }
}

function getStatusLabel(status: ShipmentStatus): string {
  switch (status) {
    case 'draft': return 'Draft';
    case 'dikirim': return 'Dikirim';
    case 'diterima': return 'Diterima';
  }
}

export function DistributionScreen() {
  const navigate = useNavigate();
  const { shipments, loadingShipments, submitting, fetchShipments, generateDocument } = useStore();

  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);

  if (loadingShipments) return <LoadingState />;
  if (shipments.length === 0) return <EmptyState message="Belum ada pengiriman" icon={Truck} />;

  return (
    <div className="fade-in space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Distribusi</h1>
        <p className="text-sm text-gray-500">{shipments.length} pengiriman</p>
      </div>

      <div className="space-y-3">
        {shipments.map((shipment) => (
          <Card key={shipment.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{shipment.id}</p>
                  <p className="text-xs text-gray-400">{shipment.tanggal}</p>
                </div>
              </div>
              <Badge variant={getStatusVariant(shipment.status)} size="md">
                {getStatusLabel(shipment.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Truck className="w-3.5 h-3.5" />
                <span>{shipment.bibit} — {shipment.jumlah.toLocaleString('id-ID')} bibit</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <MapPin className="w-3.5 h-3.5" />
                <span>{shipment.tujuan}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <User className="w-3.5 h-3.5" />
                <span>{shipment.sopir}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Car className="w-3.5 h-3.5" />
                <span>{shipment.nopol}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                icon={<FileText className="w-4 h-4" />}
                onClick={() => {
                  const idx = shipments.indexOf(shipment);
                  navigate(`/surat-jalan?row=${idx}`);
                }}
                className="flex-1"
              >
                Surat Jalan
              </Button>
              {shipment.status === 'dikirim' && (
                <Button
                  variant="secondary"
                  size="sm"
                  loading={submitting}
                  onClick={() => generateDocument(shipment.id)}
                  className="flex-1"
                >
                  Generate Dok
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
