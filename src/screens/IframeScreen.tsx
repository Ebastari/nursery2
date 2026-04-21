import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const APPSHEET_URL = 'https://script.google.com/macros/s/AKfycbxO4WFEjJVp5rzDOq0zRX3hycgB9zaZ_JB6vfM2gqxuwf7Qq46MjrojF_j1O8px4OV0/exec';

export function IframeScreen() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 2000);
    // Logging mount event
    console.log('[AppSheet Iframe] Komponen dimount:', new Date().toISOString());

    // Event listener untuk reload iframe
    const handleReload = () => {
      console.log('[AppSheet Iframe] Iframe reload:', new Date().toISOString());
    };
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleReload);
    }

    return () => {
      clearTimeout(timeout);
      if (iframe) {
        iframe.removeEventListener('load', handleReload);
      }
    };
  }, []);

  const handleIframeLoad = () => {
    setLoading(false);
    setError(null);
    console.log('[AppSheet Iframe] onLoad dipanggil:', new Date().toISOString());
  };

  const handleIframeError = () => {
    setError('Gagal memuat formulir AppSheet. Periksa koneksi internet.');
    setLoading(false);
    console.error('[AppSheet Iframe] onError dipanggil:', new Date().toISOString());
  };

  // Modal fullscreen style, tetap menyisakan header/footer
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col border border-gray-200"
        style={{
          marginTop: '56px', // header tinggi 56px (h-14)
          marginBottom: '68px', // footer tinggi 68px (h-[4.25rem])
          maxHeight: 'calc(100vh - 124px)',
        }}
      >
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 p-8">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm text-gray-600 font-medium">Memuat formulir...</p>
            </div>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/90 backdrop-blur-sm">
            <p className="text-center text-red-600 font-semibold p-4">{error}</p>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={APPSHEET_URL}
          style={{
            width: '100%',
            height: '100%',
            border: 0,
            background: 'white',
            borderRadius: '12px',
          }}
          title="AppSheet Input Form"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          allowFullScreen
          sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-top-navigation"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  );
}
