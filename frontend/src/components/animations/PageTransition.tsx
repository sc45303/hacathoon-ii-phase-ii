'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { pageTransition, fadeIn } from '@/lib/animations';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

/**
 * PageTransition component for smooth page/route transitions
 *
 * Wraps page content with fade and slide animations
 * Respects user's reduced motion preferences
 *
 * @example
 * ```tsx
 * <PageTransition>
 *   <div>Your page content</div>
 * </PageTransition>
 * ```
 */
export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={prefersReducedMotion ? fadeIn : pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  );
}
