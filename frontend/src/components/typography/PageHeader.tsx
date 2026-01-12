'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * PageHeader Component
 *
 * A consistent header component for page titles with optional subtitle,
 * icon, and action button. Includes subtle animations and proper spacing.
 *
 * Features:
 * - Animated title and subtitle
 * - Optional icon with pulse animation
 * - Optional action button slot
 * - Responsive layout
 * - Dark mode support
 */

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  action,
  className,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const titleVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    },
  };

  const subtitleVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        delay: 0.1,
        ease: 'easeOut' as const,
      },
    },
  };

  const iconVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut' as const,
      },
    },
  };

  return (
    <header
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <motion.div
            initial={prefersReducedMotion ? false : 'hidden'}
            animate={prefersReducedMotion ? false : ['visible', 'pulse']}
            variants={prefersReducedMotion ? undefined : iconVariants}
            className="flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
              <Icon className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
          </motion.div>
        )}

        <div className="flex-1 min-w-0">
          <motion.h1
            initial={prefersReducedMotion ? false : 'hidden'}
            animate="visible"
            variants={prefersReducedMotion ? undefined : titleVariants}
            className="text-2xl font-bold text-gray-900 dark:text-white leading-tight text-balance"
          >
            {title}
          </motion.h1>

          {subtitle && (
            <motion.p
              initial={prefersReducedMotion ? false : 'hidden'}
              animate="visible"
              variants={prefersReducedMotion ? undefined : subtitleVariants}
              className="text-sm text-gray-500 dark:text-gray-500 mt-1 leading-normal"
            >
              {subtitle}
            </motion.p>
          )}
        </div>
      </div>

      {action && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex-shrink-0"
        >
          {action}
        </motion.div>
      )}
    </header>
  );
};

/**
 * SectionHeader Component
 *
 * A smaller header for sections within a page.
 */

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  className,
}) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <header
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4',
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <motion.h2
          initial={prefersReducedMotion ? false : { opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-lg font-semibold text-gray-800 dark:text-gray-100 leading-snug text-balance"
        >
          {title}
        </motion.h2>

        {subtitle && (
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="text-[13px] text-gray-500 dark:text-gray-500 mt-1 leading-normal"
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {action && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="flex-shrink-0"
        >
          {action}
        </motion.div>
      )}
    </header>
  );
};
