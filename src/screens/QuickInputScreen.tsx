import { useState, useEffect, useMemo } from 'react';
import { ChatbotPanel } from '../components/chatbot/ChatbotPanel';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';
import { CheckCircle, Plus, AlertTriangle, FileText, WifiOff } from 'lucide-react';
import { fetchApiData } from '../data/api';
import { fetchDropdowns } from '../data/api';
import type { ApiRow } from '../data/api';
import { useOnlineStatus } from '../data/useOnlineStatus';

export function QuickInputScreen() {
    // State untuk mode input: 'chatbot' | 'manual' | null
    const [inputMode, setInputMode] = useState<null | 'chatbot' | 'manual'>(null);
  const navigate = useNavigate();
  const { plants, submitting, submitActivity, fetchPlants, inputForm: form, setInputForm, resetInputForm } = useStore();
  const [submitted, setSubmitted] = useState(false);
  const isOnline = useOnlineStatus();
  const [sumberOptions, setSumberOptions] = useState<{ value: string; label: string }[]>([]);
  const [tujuanOptions, setTujuanOptions] = useState<{ value: string; label: string }[]>([]);
  const [dibuatOlehOptions, setDibuatOlehOptions] = useState<{ value: string; label: string }[]>([]);
  const [driverOptions, setDriverOptions] = useState<{ value: string; label: string }[]>([]);
  const [apiRows, setApiRows] = useState<ApiRow[]>([]);

  useEffect(() => {
    if (plants.length === 0) fetchPlants();
  }, [plants.length, fetchPlants]);

  useEffect(() => {
    fetchApiData().then((rows) => {
      setApiRows(rows);
      const sumberSet = new Set<string>();
      const tujuanSet = new Set<string>();
      for (const r of rows) {
        if (r.sumber) sumberSet.add(r.sumber);
        if (r.tujuan) tujuanSet.add(r.tujuan);
      }
      setSumberOptions([...sumberSet].sort().map((s) => ({ value: s, label: s })));
      setTujuanOptions([...tujuanSet].sort().map((s) => ({ value: s, label: s })));
    });
    fetchDropdowns().then((opts) => {
      setDibuatOlehOptions(opts.dibuatOleh.map((s) => ({ value: s, label: s })));
      setDriverOptions(opts.driver.map((s) => ({ value: s, label: s })));
    });
  }, []);

  // Hitung stok per jenis bibit dari data API
  const stokPerBibit = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of apiRows) {
      const key = r.bibit.trim().toUpperCase();
      if (!key) continue;
      if (!map[key]) map[key] = 0;
      map[key] += (r.masuk || 0) - (r.keluar || 0) - (r.mati || 0);
    }
    // Pastikan stok minimal 0
    for (const k of Object.keys(map)) {
      if (map[k] < 0) map[k] = 0;
    }
    return map;
  }, [apiRows]);

  const plantOptions = useMemo(
    () => plants.map((p) => ({ value: p.name, label: p.name })),
    [plants],
  );

  const handleChange = (field: string, value: string) => {
    setInputForm({ [field]: value });
  };

  // Stok saat ini untuk bibit yang dipilih
  const currentStok = form.bibit ? (stokPerBibit[form.bibit.trim().toUpperCase()] ?? null) : null;
  const keluarVal = Number(form.keluar) || 0;
  const matiVal = Number(form.mati) || 0;
  const totalPengurangan = keluarVal + matiVal;
  const stokWarning = currentStok !== null && totalPengurangan > currentStok;

  const handleSubmit = async () => {
    if (!form.bibit) return;
    await submitActivity({
      tanggal: form.tanggal,
      bibit: form.bibit,
      masuk: Number(form.masuk) || 0,
      keluar: Number(form.keluar) || 0,
      mati: Number(form.mati) || 0,
      sumber: form.sumber,
      tujuan: form.tujuan,
      dibuatOleh: form.dibuatOleh,
      driver: form.driver,
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      resetInputForm();
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="fade-in flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Berhasil Disimpan!</h2>
        <p className="text-gray-500 text-sm">Data aktivitas telah dicatat</p>
      </div>
    );
  }


  // Import Fast Input Panel (ChatbotPanel)
  // NOTE: Import di atas file: import { ChatbotPanel } from '../components/chatbot/ChatbotPanel';
  // Render di sini, di atas form manual
  // Hilangkan floating button di halaman ini

  return (
    <div className="fade-in space-y-4 pb-24">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Input Aktivitas Bibit</h1>
        <p className="text-sm text-gray-500">Pilih metode input yang diinginkan</p>
      </div>

      {/* Pilihan mode input */}
      <div className="flex gap-3 mb-4">
        <Button
          variant={inputMode === 'chatbot' ? 'primary' : 'secondary'}
          onClick={() => setInputMode('chatbot')}
          className="flex-1"
        >
          Input Cepat (Chatbot)
        </Button>
        <Button
          variant={inputMode === 'manual' ? 'primary' : 'secondary'}
          onClick={() => setInputMode('manual')}
          className="flex-1"
        >
          Input Manual (Formulir)
        </Button>
      </div>

      {/* Tampilkan panel sesuai pilihan */}
      {inputMode === 'chatbot' && (
        <div className="mb-6">
            <ChatbotPanel onClose={() => setInputMode(null)} mode="input" />
        </div>
      )}

      {inputMode === 'manual' && (
        <>
          {/* Offline Warning */}
          {!isOnline && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200">
              <WifiOff className="w-5 h-5 text-red-500 shrink-0" />
              <div>
                <p className="text-[13px] font-semibold text-red-700">Tidak ada koneksi internet</p>
                <p className="text-[11px] text-red-500 mt-0.5">Form hanya bisa dikirim saat online. Silakan sambungkan internet terlebih dahulu.</p>
              </div>
            </div>
          )}

          <Card className={`space-y-4 ${!isOnline ? 'opacity-50 pointer-events-none' : ''}`}>
            <Input
              label="Tanggal"
              type="date"
              value={form.tanggal}
              onChange={(e) => handleChange('tanggal', e.target.value)}
            />

            <Select
              label="Jenis Bibit"
              options={plantOptions}
              value={form.bibit}
              onChange={(e) => handleChange('bibit', e.target.value)}
            />

            {form.bibit && currentStok !== null && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-200">
                <span className="text-sm text-blue-700">
                  📦 Stok <strong>{form.bibit}</strong> saat ini: <strong>{currentStok.toLocaleString('id-ID')}</strong> bibit
                </span>
              </div>
            )}

            {form.bibit && currentStok === 0 && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">Stok <strong>{form.bibit}</strong> sudah habis!</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Masuk"
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={form.masuk}
                onChange={(e) => handleChange('masuk', e.target.value)}
              />
              <Input
                label="Keluar"
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={form.keluar}
                onChange={(e) => handleChange('keluar', e.target.value)}
              />
              <Input
                label="Mati"
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={form.mati}
                onChange={(e) => handleChange('mati', e.target.value)}
              />
            </div>

            {stokWarning && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-300">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Peringatan!</strong> Keluar ({keluarVal.toLocaleString('id-ID')}) + Mati ({matiVal.toLocaleString('id-ID')}) = <strong>{totalPengurangan.toLocaleString('id-ID')}</strong> melebihi stok saat ini (<strong>{currentStok?.toLocaleString('id-ID')}</strong>).
                </div>
              </div>
            )}

            <Select
              label="Sumber"
              options={sumberOptions}
              value={form.sumber}
              onChange={(e) => handleChange('sumber', e.target.value)}
            />

            <Select
              label="Tujuan"
              options={tujuanOptions}
              value={form.tujuan}
              onChange={(e) => handleChange('tujuan', e.target.value)}
            />

            <Select
              label="Dibuat Oleh"
              options={dibuatOlehOptions}
              value={form.dibuatOleh}
              onChange={(e) => handleChange('dibuatOleh', e.target.value)}
            />

            <Select
              label="Driver"
              options={driverOptions}
              value={form.driver}
              onChange={(e) => handleChange('driver', e.target.value)}
            />
          </Card>

          {/* Fixed bottom submit */}
          <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-full max-w-[420px] p-4 bg-white/80 backdrop-blur-lg border-t border-gray-100 space-y-2">
            {form.bibit && keluarVal > 0 && (
              <Button
                size="md"
                variant="secondary"
                icon={<FileText className="w-4 h-4" />}
                onClick={() => {
                  const params = new URLSearchParams({
                    preview: '1',
                    tanggal: form.tanggal,
                    bibit: form.bibit,
                    keluar: String(keluarVal),
                    sumber: form.sumber,
                    tujuan: form.tujuan,
                    dibuatOleh: form.dibuatOleh,
                    driver: form.driver,
                  });
                  navigate(`/surat-jalan?${params.toString()}`);
                }}
                className="w-full"
              >
                Preview Surat Jalan
              </Button>
            )}
            <Button
              size="lg"
              loading={submitting}
              icon={<Plus className="w-5 h-5" />}
              onClick={handleSubmit}
              disabled={!form.bibit || !isOnline}
              className="w-full"
            >
              {isOnline ? 'Simpan Data' : 'Offline — Tidak Bisa Simpan'}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
