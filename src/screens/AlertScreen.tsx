import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { LoadingState } from '../components/LoadingState';
import { EmptyState } from '../components/EmptyState';
import { AlertTriangle, PackageMinus, Leaf, FileWarning, Bell, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { AlertType, AlertSeverity } from '../data/types';

function getAlertIcon(type: AlertType) {
  switch (type) {
    case 'low-stock': return PackageMinus;
    case 'mortality': return Leaf;
    case 'document': return FileWarning;
  }
}

function getSeverityVariant(severity: AlertSeverity): 'danger' | 'warning' | 'info' {
  switch (severity) {
    case 'high': return 'danger';
    case 'medium': return 'warning';
    case 'low': return 'info';
  }
}

function getSeverityLabel(severity: AlertSeverity): string {
  switch (severity) {
    case 'high': return 'Tinggi';
    case 'medium': return 'Sedang';
    case 'low': return 'Rendah';
  }
}

function getAlertBg(severity: AlertSeverity): string {
  switch (severity) {
    case 'high': return 'bg-red-50';
    case 'medium': return 'bg-amber-50';
    case 'low': return 'bg-blue-50';
  }
}

function getAlertIconColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'high': return 'text-red-500';
    case 'medium': return 'text-amber-500';
    case 'low': return 'text-blue-500';
  }
}

export function AlertScreen() {
  const { alerts, loadingAlerts, fetchAlerts, markAlertRead, isAdmin } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  if (loadingAlerts) return <LoadingState />;
  if (alerts.length === 0) return <EmptyState message="Tidak ada peringatan" icon={Bell} />;

  const unread = alerts.filter((a) => !a.read);
  const read = alerts.filter((a) => a.read);

  return (
    <div className="fade-in space-y-4">
      {/* Submenu Approval untuk admin */}
      {isAdmin && (
        <div className="mb-4">
          <button
            onClick={() => navigate('/approval')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold hover:bg-emerald-100 transition-colors"
          >
            <Shield className="w-5 h-5" />
            Menu Approval Surat Jalan
          </button>
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Peringatan</h1>
          <p className="text-sm text-gray-500">{unread.length} belum dibaca</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
      </div>

      {unread.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Baru</h2>
          <div className="space-y-2">
            {unread.map((alert) => {
              const Icon = getAlertIcon(alert.type);
              return (
                <Card
                  key={alert.id}
                  className="flex items-start gap-3 border-l-4 border-l-red-400"
                  onClick={() => markAlertRead(alert.id)}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getAlertBg(alert.severity)}`}>
                    <Icon className={`w-5 h-5 ${getAlertIconColor(alert.severity)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant={getSeverityVariant(alert.severity)}>
                        {getSeverityLabel(alert.severity)}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(alert.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {read.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Sudah Dibaca</h2>
          <div className="space-y-2">
            {read.map((alert) => {
              const Icon = getAlertIcon(alert.type);
              return (
                <Card key={alert.id} className="flex items-start gap-3 opacity-60">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gray-50`}>
                    <Icon className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600">{alert.message}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge variant="neutral">
                        {getSeverityLabel(alert.severity)}
                      </Badge>
                      <span className="text-xs text-gray-400">
                        {new Date(alert.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
