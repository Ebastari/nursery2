import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, RotateCcw, Loader2, Sparkles, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MENU_OPTIONS, GREETING, processMessage } from './chatbotLogic';

const LOGO = 'https://i.ibb.co.com/xSTT9wJK/download.png';

interface ChatMsg {
  id: number;
  role: 'bot' | 'user';
  text: string;
  ts: number;
}

function renderMarkdown(text: string) {
  const parts = text.split('\n');
  return parts.map((line, i) => {
    let html = line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>');
    return (
      <span key={i}>
        <span dangerouslySetInnerHTML={{ __html: html }} />
        {i < parts.length - 1 && <br />}
      </span>
    );
  });
}

export function ChatbotPanel({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: 0, role: 'bot', text: GREETING, ts: Date.now() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  let nextId = useRef(1);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const addMsg = (role: 'bot' | 'user', text: string) => {
    const msg: ChatMsg = { id: nextId.current++, role, text, ts: Date.now() };
    setMessages((prev) => [...prev, msg]);
    return msg;
  };

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    addMsg('user', trimmed);
    setInput('');
    setLoading(true);
    scrollToBottom();
    try {
      const resp = await processMessage(trimmed);
      addMsg('bot', resp);
    } catch {
      addMsg('bot', '❌ Gagal mengambil data. Coba lagi nanti.');
    }
    setLoading(false);
    inputRef.current?.focus();
  };

  const handleQuickReply = (menuId: string, label: string) => {
    handleSend(label);
  };

  const handleReset = () => {
    nextId.current = 1;
    setMessages([{ id: 0, role: 'bot', text: GREETING, ts: Date.now() }]);
    setInput('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 30, scale: 0.92 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[200] flex flex-col bg-[#212121] max-w-[420px] mx-auto"
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 h-14 bg-[#212121] border-b border-white/5 shrink-0">
        <img src={LOGO} alt="Montana" className="w-8 h-8 rounded-lg object-contain" />
        <div className="flex-1 min-w-0">
          <h2 className="text-[14px] font-semibold text-white truncate">Montana Bibit</h2>
          <p className="text-[10px] text-gray-500">AI Assistant • Nursery PT EBL</p>
        </div>
        <button onClick={handleReset} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition" title="Reset Chat">
          <RotateCcw className="w-4 h-4 text-gray-400" />
        </button>
        <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* ── Messages ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 overscroll-contain">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'bot' && (
              <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-[#2f2f2f] text-white rounded-br-md'
                  : 'bg-transparent text-gray-200'
              }`}
            >
              {msg.role === 'bot' ? renderMarkdown(msg.text) : msg.text}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {loading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex items-center gap-2 py-3 text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-[13px]">Mengambil data...</span>
            </div>
          </div>
        )}

        {/* Quick replies — show after bot messages when not loading */}
        {!loading && (
          <div className="pt-2">
            <p className="text-[11px] text-gray-500 mb-2 flex items-center gap-1">
              <ChevronDown className="w-3 h-3" /> Pilih menu
            </p>
            <div className="flex flex-wrap gap-1.5">
              {MENU_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleQuickReply(opt.id, opt.label)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-[12px] text-gray-300 hover:bg-white/10 hover:border-white/20 transition whitespace-nowrap"
                >
                  <span>{opt.icon}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Input ── */}
      <div className="shrink-0 border-t border-white/5 bg-[#212121] px-3 py-3">
        <div className="flex items-center gap-2 bg-[#2f2f2f] rounded-2xl px-4 py-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
            placeholder="Ketik pertanyaan..."
            className="flex-1 bg-transparent text-[13px] text-white placeholder:text-gray-500 outline-none"
            disabled={loading}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || loading}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
              input.trim() && !loading
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-white/10 text-gray-600'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-gray-600 text-center mt-2">Montana Bibit • Powered by Nursery Data API</p>
      </div>
    </motion.div>
  );
}
