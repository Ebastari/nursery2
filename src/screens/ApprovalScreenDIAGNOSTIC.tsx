import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { fetchApiData } from '../data/api';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { EmptyState } from '../components/EmptyState';
import { FileText, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import DocumentPreview from '../components/DocumentPreview';
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

export function ApprovalScreenDIAGNOSTIC() {
  console.log('🟢 [DIAGNOSTIC] ApprovalScreenDIAGNOSTIC MOUNTED');
  
  const [debugInfo, setDebugInfo] = useState('🔍 Loading diagnostics...');
  const navigate = useNavigate();
  
  const { isAdmin, clearAdminMode, approvals, documents, fetchDocuments, approvalError } = useStore();
  
  const [items, setItems] = useState<SuratJalanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdminState, setIsAdminState] = useState(false);
  const [documentsState, setDocumentsState] = useState(0);

  useEffect(() => {
    console.log('🟢 fetchDocuments called');
    fetchDocuments().catch(e => {
      console.error('❌ fetchDocuments FAILED:', e);
      setDebugInfo(`❌ fetchDocuments error: ${e.message}`);
    });
  }, [fetchDocuments]);

  useEffect(() => {
    console.log('🟢 fetchApiData useEffect START');
    fetchApiData()
      .then(rows => {
        console.log('✅ API Data loaded:', rows.length, 'rows');
        console.log('First row:', rows[0]);
        const distribusi = rows.filter(r => r.keluar > 0);
        console.log('📊 Distribusi rows:', distribusi.length);
        const items: SuratJalanItem[] = distribusi.map((r, idx) => ({
          nomor: `SJ-BIBIT/${String(idx + 1).padStart(4, '0')}/${new Date(r.tanggal).toLocaleString('id-ID', { month: 'long' })}/${new Date(r.tanggal).getFullYear()}`,
          tanggal: r.tanggal,
          bibit: r.bibit,
          jumlah: r.keluar,
          tujuan: r.tujuan,
          dibuatOleh: r.dibuatOleh || '-',
          driver: r.driver || '-',
        }));
        console.log('✅ Items created:', items.length);
        setItems(items);
        setDebugInfo(`✅ SUCCESS | Items: ${items.length} | Admin: ${isAdmin} | Docs: ${documents.length}`);
        setLoading(false);
      })
      .catch(e => {
        console.error('💥 fetchApiData CRASHED:', e);
        setDebugInfo(`💥 CRASH: ${e.message}`);
        setLoading(false);
      });
  }, []);

  const getApprovalStatus = (nomor: string): ApprovalStatus => {
    const approval = approvals.find((a) => a.nomorSurat === nomor);
    return approval?.status || 'pending';
  };

  return (
    <div className="min-h-screen p-6 space-y-6">
      {/* 🔥 BIG GREEN DIAGNOSTIC PANEL */}
      <div className="p-8 rounded-3xl border-8 border-emerald-400 bg-gradient-to-r from-emerald-50 to-blue-50 shadow-2xl">
        <h1 className="text-3xl font-black text-emerald-800 mb-6 flex items-center gap-3">
          <span className="text-4xl">🔍</span>
          APPROVAL MENU DIAGNOSTIC
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-emerald-200 shadow-lg">
            <h3 className="font-bold text-lg text-gray-800 mb-4">📊 STATUS</h3>
            <div className="space-y-3 text-sm">
              <p><strong>✅ Component:</strong> <span className="text-green-600 font-bold">MOUNTED</span></p>
              <p><strong>🔑 Admin Mode:</strong> <span className={isAdminState ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{isAdminState.toString()}</span></p>
              <p><strong>📈 Items Loaded:</strong> <span className="font-mono bg-gray-100 px-3 py-1 rounded-lg">{items.length}</span></p>
              <p><strong>📄 Documents:</strong> <span className="font-mono bg-gray-100 px-3 py-1 rounded-lg">{documentsState}</span></p>
              <p><strong>⚠️ Store Error:</strong> <span className="font-mono bg-yellow-100 px-3 py-1 rounded-lg">{approvalError || 'NONE'}</span></p>
              <p><strong>🔍 Debug Info:</strong></p>
              <pre className="bg-gray-900 text-green-400 text-xs p-3 rounded-lg font-mono overflow-auto max-h-32">{debugInfo}</pre>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-blue-200 shadow-lg">
            <h3 className="font-bold text-lg text-gray-800 mb-4">🛠️ DEBUG TOOLS</h3>
            <div className="space-y-3">
              <button 
                className="w-full p-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg transition-all text-center"
                onClick={() => {
                  window.location.reload();
                }}
              >
                🔄 RELOAD PAGE
              </button>
              <button 
                className="w-full p-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-2xl shadow-lg transition-all text-center"
                onClick={() => {
                  console.log('🐛 FULL STORE DUMP:', useStore.getState());
                  setDebugInfo('🐛 FULL STORE DUMP logged to console (F12)');
                }}
              >
                🐛 DUMP FULL STORE
              </button>
              <button 
                className="w-full p-4 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-2xl shadow-lg transition-all text-center"
                onClick={() => {
                  fetchApiData().then(rows => {
                    console.log('🔄 FRESH API DATA:', rows);
                    setDebugInfo(`🔄 Fresh API: ${rows.length} rows (check console)`);
                  }).catch(e => setDebugInfo(`API ERROR: ${e.message}`));
                }}
              >
                🔄 REFRESH API DATA
              </button>
            </div>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 text-center p-4 bg-gray-50 rounded-xl">
          <p>✅ If you see this → ApprovalScreen WORKS!</p>
          <p>❌ Blank screen → React crash (check console F12)</p>
          <p><strong>Password Admin:</strong> admin123</p>
        </div>
      </div>

      <div style={{display: 'none'}}>
        {/* ORIGINAL ApprovalScreen (disabled during diagnostic) */}
        Original content hidden for debugging...
      </div>
    </div>
  );
}
