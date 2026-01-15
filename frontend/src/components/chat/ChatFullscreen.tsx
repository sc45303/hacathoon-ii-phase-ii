'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/providers/ChatProvider';
import { ChatPanel } from './ChatPanel';

/**
 * ChatFullscreen - Fullscreen wrapper for ChatPanel
 *
 * Used on all pages on mobile (<768px)
 * Features:
 * - Full-screen overlay
 * - Dynamic viewport height (dvh) for mobile keyboard handling
 * - Safe area insets for notched devices
 * - Slide-up animation with Framer Motion
 * - Respects reduced motion preference
 */
export function ChatFullscreen() {
  const { state, closeChat } = useChat();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // Handle mobile keyboard appearance
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const keyboardHeightCalc = windowHeight - viewportHeight;
        setKeyboardHeight(keyboardHeightCalc);
      }
    };

    // Listen for viewport resize (keyboard appearance)
    window.visualViewport?.addEventListener('resize', handleResize);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <AnimatePresence>
      {state.isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.3,
            type: 'spring',
            stiffness: 300,
            damping: 30
          }}
          className="fixed inset-0 z-[60] bg-white dark:bg-gray-900"
          style={{
            height: `calc(100dvh - ${keyboardHeight}px)`,
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
        >
          <ChatPanel variant="fullscreen" onClose={closeChat} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
