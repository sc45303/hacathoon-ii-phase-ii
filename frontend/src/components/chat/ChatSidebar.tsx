'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/providers/ChatProvider';
import { ChatPanel } from './ChatPanel';

/**
 * ChatSidebar - Sidebar wrapper for ChatPanel
 *
 * Used on dashboard pages (/dashboard/*) on desktop
 * Features:
 * - Fixed position on right side
 * - 400px width
 * - Slide-in animation with Framer Motion
 * - Respects reduced motion preference
 */
export function ChatSidebar() {
  const { state, closeChat } = useChat();

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  return (
    <AnimatePresence>
      {state.isOpen && (
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
          <ChatPanel variant="sidebar" onClose={closeChat} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
