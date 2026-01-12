"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { fadeInUp, scaleIn, staggerContainer, staggerItem } from "@/lib/animations"

interface AuthCardProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  icon?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export function AuthCard({
  children,
  title,
  subtitle,
  icon,
  footer,
  className,
}: AuthCardProps) {
  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={prefersReducedMotion ? {} : fadeInUp}
      className={cn(
        "w-full max-w-md mx-auto",
        className
      )}
    >
      <motion.div
        className="backdrop-blur-xl bg-white/70 dark:bg-white/10 rounded-2xl shadow-2xl border border-white/20 p-8 md:p-12 space-y-8"
        whileHover={prefersReducedMotion ? {} : {
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)",
          transition: { duration: 0.2 }
        }}
      >
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center space-y-4"
        >
          {icon && (
            <motion.div
              variants={prefersReducedMotion ? {} : scaleIn}
              whileHover={prefersReducedMotion ? {} : {
                scale: 1.05,
                rotate: [0, -5, 5, 0],
                transition: { duration: 0.3 }
              }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl mb-2 shadow-xl"
            >
              {icon}
            </motion.div>
          )}

          <motion.div variants={staggerItem} className="space-y-2">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {subtitle}
              </p>
            )}
          </motion.div>
        </motion.div>

        {/* Content */}
        <div className="space-y-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="pt-6 border-t border-white/20 dark:border-white/10"
          >
            {footer}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

interface AuthCardFooterProps {
  children: React.ReactNode
  className?: string
}

export function AuthCardFooter({ children, className }: AuthCardFooterProps) {
  return (
    <div className={cn("text-center text-sm text-gray-600 dark:text-gray-400", className)}>
      {children}
    </div>
  )
}
