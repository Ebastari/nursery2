import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input, Select } from '../components/Input';
import { CheckCircle, Plus, AlertTriangle, FileText } from 'lucide-react';
import { fetchApiData } from '../data/api';
import type { ApiRow } from '../data/api';

export function QuickInputScreen() {
  const navigate = useNavigate();
  const { plants, submitting, submitActivity, fetchPlants } = useStore();
  const [submitted, setSubmitted] = useState(false);
  const [sumberOptions, setSumberOptions] = useState<{ value: string; label: string }[]>([]);
  const [tujuanOptions, setTujuanOptions] = useState<{ value: string; label: string }[]>([]);
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

  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    tanggal: today,
    bibit: '',
    masuk: '',
    keluar: '',
    mati: '',
    sumber: '',
    tujuan: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ tanggal: today, bibit: '', masuk: '', keluar: '', mati: '', sumber: '', tujuan: '' });
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

  return (
    <div className="fade-in space-y-4 pb-24">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Input Cepat</h1>
        <p className="text-sm text-gray-500">Catat aktivitas bibit hari ini</p>
      </div>

      <Card className="space-y-4">
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
          disabled={!form.bibit}
          className="w-full"
        >
          Simpan Data
        </Button>
      </div>
    </div>
  );
}
