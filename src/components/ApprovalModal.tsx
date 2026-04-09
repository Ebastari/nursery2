import { useState, useEffect, useRef } from 'react';
import { X, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './Button';
import { useStore } from '../store/useStore';

interface ApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApprovalModal({ isOpen, onClose, onSuccess }: ApprovalModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const setAdminMode = useStore((s) => s.setAdminMode);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    await new Promise((r) => setTimeout(r, 300));

    if (setAdminMode(password)) {
      onSuccess();
      onClose();
    } else {
      setError('Password salah. Coba lagi.');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="p-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Mode Admin</h2>
          <p className="text-sm text-gray-500 mb-6">Masukkan password untuk mengakses fitur approval</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                ref={inputRef}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password admin"
                className="w-full px-4 py-3 text-center text-lg font-mono tracking-widest rounded-2xl border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all"
                autoComplete="current-password"
              />
              {error && (
                <p className="mt-2 text-sm text-red-500 flex items-center justify-center gap-1">
                  <XCircle className="w-4 h-4" />
                  {error}
                </p>
              )}
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              <CheckCircle className="w-5 h-5" />
              Masuk Mode Admin
            </Button>
          </form>

          <p className="mt-4 text-xs text-gray-400">Default: admin123</p>
        </div>
      </div>
    </div>
  );
}
