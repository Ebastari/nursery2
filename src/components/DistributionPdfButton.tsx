import { useState, useEffect } from 'react';
import { X, Download, FileText, Loader2 } from 'lucide-react';
import QRCode from 'qrcode';
import { downloadDistributionPdf, type DistributionPdfData } from '../utils/generateDistributionPdf';

interface DistributionPdfButtonProps {
  data: DistributionPdfData;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

const iconSizes = {
  sm: 14,
  md: 16,
  lg: 18,
};

export function DistributionPdfButton({
  data,
  variant = 'primary',
  size = 'md',
  label = 'Download PDF',
  className = '',
}: DistributionPdfButtonProps) {
  const [loading, setLoading] = useState(false);

  const baseClasses = `inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`;
  
  const variantClasses = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100',
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      downloadDistributionPdf(data);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading ? (
        <Loader2 className="animate-spin" style={{ width: iconSizes[size], height: iconSizes[size] }} />
      ) : (
        <Download style={{ width: iconSizes[size], height: iconSizes[size] }} />
      )}
      {label}
    </button>
  );
}

interface DistributionPdfPreviewProps {
  data: DistributionPdfData;
}

export function DistributionPdfPreview({ data }: DistributionPdfPreviewProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (data.qrValue) {
      QRCode.toDataURL(data.qrValue, {
        width: 140,
        margin: 1,
        color: { dark: '#1a1a1a', light: '#ffffff' },
      }).then(setQrDataUrl);
    }
  }, [data.qrValue]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden max-w-md">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-white" />
          <span className="text-white font-semibold text-sm">Preview Distribution PDF</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="text-center border-b border-gray-200 pb-3">
          <h2 className="text-sm font-bold text-gray-900">SURAT JALAN DISTRIBUSI BIBIT</h2>
          <p className="text-xs text-gray-500">No: {data.nomorSurat || '-'}</p>
          <p className="text-xs text-gray-500">{data.tanggal}</p>
        </div>

        <div className="space-y-1 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-500">Jenis Bibit:</span>
            <span className="font-medium text-gray-900">{data.jenisBibit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Jumlah:</span>
            <span className="font-bold text-emerald-600">
              {data.jumlah.toLocaleString('id-ID')} {data.satuan}
            </span>
          </div>
        </div>

        <div className="rounded-lg overflow-hidden border border-gray-200">
          <div className="bg-emerald-600 text-white text-xs py-2 px-2 font-semibold">
            No | Jenis Bibit | Jumlah | Satuan
          </div>
          <div className="bg-white py-2 px-2 text-xs flex items-center">
            <span className="w-6 text-gray-500">1</span>
            <span className="flex-1 font-medium">{data.jenisBibit}</span>
            <span className="font-bold text-emerald-600 text-right">
              {data.jumlah.toLocaleString('id-ID')}
            </span>
            <span className="w-16 text-right text-gray-500">{data.satuan}</span>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs">
          <span className="text-blue-700">
            Sisa stok <strong>{data.jenisBibit.toUpperCase()}</strong> setelah distribusi:{' '}
            <strong>{data.sisaStok.toLocaleString('id-ID')}</strong> {data.satuan}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-2 text-center">
          <div>
            <p className="text-[10px] font-semibold text-gray-700">Dibuat oleh</p>
            <div className="border-b border-gray-400 w-16 mx-auto mt-1 relative">
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-green-600 bg-white px-1">✓</span>
            </div>
            <p className="text-[9px] font-bold mt-1">{data.dibuatOleh}</p>
            <p className="text-[8px] text-gray-400">{data.dibuatOlehJabatan}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-700">Disetujui</p>
            <div className="border-b border-gray-400 w-16 mx-auto mt-1 relative">
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-green-600 bg-white px-1">✓</span>
            </div>
            <p className="text-[9px] font-bold mt-1">{data.disetujuiOleh}</p>
            <p className="text-[8px] text-gray-400">{data.disetujuiOlehJabatan}</p>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-700">Driver</p>
            <div className="border-b border-gray-400 w-16 mx-auto mt-1 relative">
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-green-600 bg-white px-1">✓</span>
            </div>
            <p className="text-[9px] font-bold mt-1">{data.driver}</p>
            <p className="text-[8px] text-gray-400">{data.driverJabatan}</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-3 flex items-start gap-3">
          {qrDataUrl && (
            <img src={qrDataUrl} alt="QR" className="w-16 h-16 rounded border border-gray-200" />
          )}
          <div className="space-y-1">
            <p className="text-[10px] font-semibold text-gray-700">Scan QR Code untuk verifikasi</p>
            <p className="text-[9px] text-gray-400">
              Verifikasi keaslian dokumen ini melalui fitur Scanner di aplikasi Smart Nursery.
            </p>
            <p className="text-[8px] text-gray-300 pt-1">
              Dicetak otomatis oleh Montana AI Engine
            </p>
            <p className="text-[8px] text-gray-300">
              {data.perusahaan}{data.unit && ` — ${data.unit}`}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1 px-3 py-1.5 rounded bg-emerald-50 border border-emerald-200">
          <span className="text-green-600 text-xs font-semibold">✓ Dokumen Final</span>
          <span className="text-green-600 text-xs">—</span>
          <span className="text-green-600 text-xs">Siap Distribusi</span>
        </div>
      </div>
    </div>
  );
}

export const defaultDistributionPdfData: DistributionPdfData = {
  nomorSurat: 'SJ-BIBIT/0001/I/2026',
  tanggal: '13 April 2026',
  jenisBibit: 'GAMAL',
  jumlah: 1120,
  satuan: 'polybag',
  sisaStok: 2347,
  dibuatOleh: 'Petugas Nursery',
  dibuatOlehJabatan: 'Petugas Nursery',
  disetujuiOleh: 'Mariano Alvarado Simamor',
  disetujuiOlehJabatan: 'Dept Head Revegetasi & Rehabilitasi',
  driver: 'Sopir / Kurir',
  driverJabatan: 'Sopir / Kurir',
  qrValue: 'https://url-verifikasi.com/123',
  perusahaan: 'PT Energi Batubara Lestari',
  unit: 'Unit Nursery',
};