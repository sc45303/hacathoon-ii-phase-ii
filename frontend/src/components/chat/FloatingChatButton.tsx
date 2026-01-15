'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '@/providers/ChatProvider';

/**
 * FloatingChatButton - Global chat access button
 *
 * Features:
 * - Fixed position (bottom-right corner)
 * - Animated entrance/exit with Framer Motion
 * - Accessible with keyboard navigation
 * - Hidden on /chat route (standalone page)
 * - Respects reduced motion preference
 */
export function FloatingChatButton() {
  const pathname = usePathname();
  const { toggleChat } = useChat();

  // Hide on /chat route (standalone chat page)
  const shouldHide = pathname === '/chat';

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  // Animation variants
  const buttonVariants = {
    hidden: {
      scale: 0,
      opacity: 0,
      transition: { duration: prefersReducedMotion ? 0 : 0.2 }
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: prefersReducedMotion ? { duration: 0 } : {
        type: 'spring' as const,
        stiffness: 260,
        damping: 20
      }
    },
  };

  const handleClick = () => {
    toggleChat();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleChat();
    }
  };

  if (shouldHide) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.button
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={buttonVariants}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="fixed bottom-6 right-6 z-50 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Open AI chat assistant"
        title="Chat with AI Assistant"
      >
        <MessageCircle className="w-6 h-6" />

        {/* Unread indicator (future enhancement) */}
        {/* <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white" /> */}
      </motion.button>
    </AnimatePresence>
  );
}
