'use client';

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/providers/ChatProvider';
import { ChatPanel } from './ChatPanel';

/**
 * ChatModal - Modal wrapper for ChatPanel
 *
 * Used on content pages (/, /about) on desktop
 * Features:
 * - Radix UI Dialog for accessibility
 * - Focus trap and ESC key support
 * - Backdrop blur effect
 * - Smooth animations with Framer Motion
 */
export function ChatModal() {
  const { state, closeChat } = useChat();

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  return (
    <Dialog.Root open={state.isOpen} onOpenChange={(open) => !open && closeChat()}>
      <Dialog.Portal>
        <AnimatePresence>
          {state.isOpen && (
            <>
              {/* Backdrop */}
              <Dialog.Overlay asChild>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55]"
                />
              </Dialog.Overlay>

              {/* Modal Content */}
              <Dialog.Content asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.3,
                    type: 'spring',
                    stiffness: 300,
                    damping: 30
                  }}
                  className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[60] focus:outline-none"
                >
                  <ChatPanel variant="modal" onClose={closeChat} />
                </motion.div>
              </Dialog.Content>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
