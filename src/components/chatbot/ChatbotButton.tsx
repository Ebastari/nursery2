import { useState } from 'react';
import { Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatbotPanel } from './ChatbotPanel';

export function ChatbotButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button — Fast Input */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-24 right-4 z-[150] flex items-center gap-2 h-12 pl-3.5 pr-4 rounded-full bg-[#1a1a1a] text-white shadow-[0_4px_24px_rgba(0,0,0,0.35)] border border-white/10 hover:border-white/20 hover:shadow-[0_6px_32px_rgba(0,0,0,0.45)] hover:scale-[1.03] transition-all"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[13px] font-semibold tracking-tight">Fast Input</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Fast Input Panel */}
      <AnimatePresence>
        {open && <ChatbotPanel onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
