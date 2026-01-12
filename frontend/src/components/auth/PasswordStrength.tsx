"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  calculatePasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
} from "./FormValidation"

interface PasswordStrengthProps {
  password: string
  className?: string
}

export function PasswordStrength({ password, className }: PasswordStrengthProps) {
  const strength = calculatePasswordStrength(password)
  const label = getPasswordStrengthLabel(strength)
  const colorClass = getPasswordStrengthColor(strength)

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  // Don't show indicator if password is empty
  if (!password) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn("space-y-2", className)}
    >
      {/* Strength bars */}
      <div className="flex gap-2">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className={cn(
              "h-1 flex-1 rounded-full overflow-hidden",
              index <= strength ? "" : "bg-gray-200 dark:bg-gray-700"
            )}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            style={{ originX: 0 }}
          >
            <AnimatePresence mode="wait">
              {index <= strength && (
                <motion.div
                  key={`bar-${strength}`}
                  className={cn("h-full w-full", colorClass)}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  exit={{ scaleX: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  style={{ originX: 0 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Strength label */}
      <motion.div
        className="flex items-center justify-between text-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <span className="text-gray-600 dark:text-gray-400">Password strength:</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={label}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.2 }}
            className={cn(
              "font-medium",
              strength === 0 && "text-red-600 dark:text-red-400",
              strength === 1 && "text-yellow-600 dark:text-yellow-400",
              strength === 2 && "text-green-600 dark:text-green-400"
            )}
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      {/* Requirements checklist */}
      <motion.div
        className="space-y-1 text-xs text-gray-600 dark:text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <PasswordRequirement
          met={password.length >= 8}
          text="At least 8 characters"
          delay={0}
        />
        <PasswordRequirement
          met={/[A-Z]/.test(password)}
          text="One uppercase letter"
          delay={0.05}
        />
        <PasswordRequirement
          met={/[a-z]/.test(password)}
          text="One lowercase letter"
          delay={0.1}
        />
        <PasswordRequirement
          met={/\d/.test(password)}
          text="One number"
          delay={0.15}
        />
      </motion.div>
    </motion.div>
  )
}

interface PasswordRequirementProps {
  met: boolean
  text: string
  delay?: number
}

function PasswordRequirement({ met, text, delay = 0 }: PasswordRequirementProps) {
  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

  return (
    <motion.div
      className="flex items-center gap-2"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay }}
    >
      <AnimatePresence mode="wait">
        {met ? (
          <motion.svg
            key="check"
            className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </motion.svg>
        ) : (
          <motion.svg
            key="cross"
            className="w-4 h-4 text-gray-400 dark:text-gray-600 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.3, type: "spring", stiffness: 200 }}
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </motion.svg>
        )}
      </AnimatePresence>
      <motion.span
        className={cn(met && "text-green-600 dark:text-green-400 font-medium")}
        animate={met && !prefersReducedMotion ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        {text}
      </motion.span>
    </motion.div>
  )
}
