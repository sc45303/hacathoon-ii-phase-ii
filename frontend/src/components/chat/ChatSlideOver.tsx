'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/providers/ChatProvider';
import { ChatPanel } from './ChatPanel';

/**
 * ChatSlideOver - Slide-over wrapper for ChatPanel
 *
 * Used on dashboard pages (/dashboard/*) on tablet
 * Features:
 * - Fixed position on right side
 * - 80% viewport width (max 28rem)
 * - Overlay with backdrop
 * - Slide-in animation with Framer Motion
 * - Respects reduced motion preference
 */
export function ChatSlideOver() {
  const { state, closeChat } = useChat();

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  return (
    <AnimatePresence>
      {state.isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            onClick={closeChat}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55]"
          />

          {/* Slide-over Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.3,
              type: 'spring',
              stiffness: 300,
              damping: 30
            }}
            className="fixed right-0 top-0 h-full z-[60]"
          >
            <ChatPanel variant="slide-over" onClose={closeChat} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
