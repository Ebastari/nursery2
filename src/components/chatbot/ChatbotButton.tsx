import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatbotPanel } from './ChatbotPanel';

export function ChatbotButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-24 right-4 z-[150] w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_4px_20px_rgba(5,150,105,0.4)] flex items-center justify-center hover:shadow-[0_6px_28px_rgba(5,150,105,0.5)] hover:scale-105 transition-all"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chatbot Panel */}
      <AnimatePresence>
        {open && <ChatbotPanel onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
