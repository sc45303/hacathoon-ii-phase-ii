"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { useReducedMotion } from "@/hooks/useReducedMotion"

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, icon: Icon, title, description, action, ...props }, ref) => {
    const prefersReducedMotion = useReducedMotion()

    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.1,
        },
      },
    }

    const itemVariants = {
      hidden: { opacity: 0, y: 10 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.3,
          ease: 'easeOut' as const,
        },
      },
    }

    const iconVariants = {
      hidden: { opacity: 0, scale: 0.8 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: {
          duration: 0.4,
          ease: 'easeOut' as const,
        },
      },
    }

    // Extract potentially conflicting props
    const { onAnimationStart, onAnimationEnd, ...safeProps } = props as any;

    return (
      <motion.div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center py-12 px-4 text-center",
          className
        )}
        role="status"
        aria-live="polite"
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
        variants={prefersReducedMotion ? undefined : containerVariants}
        {...safeProps}
      >
        {Icon && (
          <motion.div
            className="mb-6 rounded-full bg-gray-100 dark:bg-gray-800 p-4"
            variants={prefersReducedMotion ? undefined : iconVariants}
          >
            <Icon
              className="h-8 w-8 text-gray-400 dark:text-gray-600"
              aria-hidden="true"
            />
          </motion.div>
        )}
        <motion.h3
          className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2 text-balance"
          variants={prefersReducedMotion ? undefined : itemVariants}
        >
          {title}
        </motion.h3>
        {description && (
          <motion.p
            className="text-sm font-normal text-gray-500 dark:text-gray-500 max-w-md leading-relaxed mb-6 text-pretty"
            variants={prefersReducedMotion ? undefined : itemVariants}
          >
            {description}
          </motion.p>
        )}
        {action && (
          <motion.div
            className="mt-2"
            variants={prefersReducedMotion ? undefined : itemVariants}
          >
            {action}
          </motion.div>
        )}
      </motion.div>
    )
  }
)

EmptyState.displayName = "EmptyState"

export { EmptyState }
