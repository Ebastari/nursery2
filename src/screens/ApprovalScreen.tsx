import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { fetchApiData } from '../data/api';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { FileText, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import type { ApprovalRecord, ApprovalStatus } from '../data/types';

interface SuratJalanItem {
  nomor: string;
  tanggal: string;
  bibit: string;
  jumlah: number;
  tujuan: string;
  dibuatOleh: string;
  driver: string;
}

function getStatusVariant(status: ApprovalStatus): 'neutral' | 'success' | 'danger' {
  switch (status) {
    case 'pending': return 'neutral';
    case 'approved': return 'success';
    case 'rejected': return 'danger';
  }
}

function getStatusLabel(status: ApprovalStatus): string {
  switch (status) {
    case 'pending': return 'Menunggu';
    case 'approved': return 'Disetujui';
    case 'rejected': return 'Ditolak';
  }
}

export function ApprovalScreen() {
  const navigate = useNavigate();
  const { isAdmin, clearAdminMode, approveSuratJalan, rejectSuratJalan, approvals } = useStore();
  const [items, setItems] = useState<SuratJalanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<SuratJalanItem | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchApiData().then((rows) => {
      const distribusi = rows.filter((r) => r.keluar > 0);
      const items: SuratJalanItem[] = distribusi.map((r, idx) => ({
        nomor: `SJ-BIBIT/${String(idx + 1).padStart(4, '0')}/${new Date(r.tanggal).toLocaleString('id-ID', { month: 'long' })}/${new Date(r.tanggal).getFullYear()}`,
        tanggal: r.tanggal,
        bibit: r.bibit,
        jumlah: r.keluar,
        tujuan: r.tujuan,
        dibuatOleh: r.dibuatOleh || '-',
        driver: r.driver || '-',
      }));
      setItems(items);
      setLoading(false);
    });
  }, []);

  const getApprovalStatus = (nomor: string): ApprovalStatus => {
    const approval = approvals.find((a) => a.nomorSurat === nomor);
    return approval?.status || 'pending';
  };

  const getApprovalRecord = (nomor: string): ApprovalRecord | undefined => {
    return approvals.find((a) => a.nomorSurat === nomor);
  };

  const handleApprove = (item: SuratJalanItem) => {
    approveSuratJalan(item.nomor, 'Admin');
  };

  const handleReject = (item: SuratJalanItem) => {
    setSelectedItem(item);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    if (selectedItem && rejectReason.trim()) {
      rejectSuratJalan(selectedItem.nomor, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedItem(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="fade-in flex flex-col items-center justify-center py-20 gap-4 text-center px-4">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <Clock className="w-10 h-10 text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Mode Admin Diperlukan</h2>
        <p className="text-sm text-gray-500 max-w-xs">
          Anda perlu masuk sebagai admin untuk mengakses fitur approval surat jalan.
        </p>
        <p className="text-xs text-gray-400 mt-2">Kembali ke halaman utama</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="fade-in flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Memuat data...</p>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Approval Surat Jalan</h1>
          <p className="text-xs text-gray-500">{items.length} dokumen</p>
        </div>
        <Button variant="ghost" size="sm" onClick={clearAdminMode}>
          Keluar Admin
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState message="Belum ada surat jalan" icon={FileText} />
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => {
            const status = getApprovalStatus(item.nomor);
            const approval = getApprovalRecord(item.nomor);

            return (
              <div key={idx} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900">{item.nomor}</p>
                        <p className="text-xs text-gray-400">{item.tanggal}</p>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(status)} size="md">
                      {getStatusLabel(status)}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Bibit</p>
                      <p className="font-medium text-gray-700">{item.bibit}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Jumlah</p>
                      <p className="font-medium text-gray-700">{item.jumlah.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-400">Tujuan</p>
                      <p className="font-medium text-gray-700">{item.tujuan}</p>
                    </div>
                  </div>

                  {status === 'approved' && approval && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-green-700">
                        Disetujui oleh {approval.approvedBy} pada {new Date(approval.approvedAt!).toLocaleString('id-ID', { 
                          day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  )}

                  {status === 'rejected' && approval && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span className="text-xs text-red-700">
                        Ditolak: {approval.rejectionReason}
                      </span>
                    </div>
                  )}

                  {status === 'pending' && (
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="primary"
                        size="sm"
                        icon={<CheckCircle className="w-4 h-4" />}
                        onClick={() => handleApprove(item)}
                        className="flex-1"
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<XCircle className="w-4 h-4" />}
                        onClick={() => handleReject(item)}
                        className="flex-1"
                      >
                        Reject
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<ArrowRight className="w-4 h-4" />}
                        onClick={() => navigate(`/surat-jalan?row=${idx}`)}
                      >
                        Lihat
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRejectModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Tolak Dokumen</h3>
            <p className="text-sm text-gray-500 mb-4">
              Berikan alasan penolakan untuk {selectedItem?.nomor}
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Alasan penolakan..."
              className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none resize-none h-24"
            />
            <div className="flex gap-2 mt-4">
              <Button variant="secondary" onClick={() => setShowRejectModal(false)} className="flex-1">
                Batal
              </Button>
              <Button variant="danger" onClick={confirmReject} disabled={!rejectReason.trim()} className="flex-1">
                Tolak
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
