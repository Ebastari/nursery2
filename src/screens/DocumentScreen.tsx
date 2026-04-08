import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { LoadingState } from '../components/LoadingState';
import { FileText, ExternalLink, CheckCircle, XCircle } from 'lucide-react';

export function DocumentScreen() {
  const navigate = useNavigate();
  const { documents, loadingDocuments, fetchDocuments } = useStore();

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  if (loadingDocuments) return <LoadingState />;
  if (documents.length === 0) return (
    <div className="fade-in space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dokumen</h1>
        <p className="text-sm text-gray-500">Surat Jalan & dokumen lainnya</p>
      </div>
      <Card className="space-y-4 text-center py-8">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-50 flex items-center justify-center">
          <FileText className="w-8 h-8 text-emerald-600" />
        </div>
        <div>
          <p className="font-bold text-gray-900">Surat Jalan Bibit</p>
          <p className="text-sm text-gray-500 mt-1">Buat surat jalan dari data distribusi terbaru</p>
        </div>
        <Button
          variant="primary"
          icon={<ExternalLink className="w-4 h-4" />}
          onClick={() => navigate('/surat-jalan')}
        >
          Buka Surat Jalan Terbaru
        </Button>
      </Card>
    </div>
  );

  return (
    <div className="fade-in space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dokumen</h1>
        <p className="text-sm text-gray-500">Surat Jalan & dokumen lainnya</p>
      </div>

      <div className="space-y-3">
        {documents.map((doc) => (
          <Card key={doc.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  doc.status === 'success' ? 'bg-emerald-50' : 'bg-red-50'
                }`}>
                  {doc.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-900 text-sm">{doc.nomor}</p>
                  <p className="text-xs text-gray-400">{doc.tanggal}</p>
                </div>
              </div>
              <Badge variant={doc.status === 'success' ? 'success' : 'danger'} size="md">
                {doc.status === 'success' ? 'Berhasil' : 'Gagal'}
              </Badge>
            </div>

            <div className="text-sm text-gray-500">
              <p>Pengiriman: {doc.shipmentId}</p>
            </div>

            {doc.status === 'success' && doc.pdfUrl && (
              <Button
                variant="secondary"
                size="sm"
                icon={<ExternalLink className="w-4 h-4" />}
                onClick={() => window.open(doc.pdfUrl, '_blank')}
                className="w-full"
              >
                Buka PDF
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
