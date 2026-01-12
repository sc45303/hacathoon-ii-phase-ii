"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Eye, EyeOff } from "lucide-react"

export interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  success?: boolean
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
}

const FloatingInput = React.forwardRef<HTMLInputElement, FloatingInputProps>(
  ({ className, label, error, success, icon, iconPosition = "left", type, id, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)
    const [showPassword, setShowPassword] = React.useState(false)
    const inputId = id || React.useId()
    const isPassword = type === "password"
    const inputType = isPassword && showPassword ? "text" : type

    // Exclude React's native animation event handlers that conflict with Framer Motion
    const { onAnimationStart, onAnimationEnd, onAnimationIteration, ...safeProps } = props as any

    // Check for reduced motion preference
    const prefersReducedMotion = typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

    const handleFocus = () => setIsFocused(true)

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      setHasValue(e.target.value.length > 0)
      props.onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(e.target.value.length > 0)
      props.onChange?.(e)
    }

    React.useEffect(() => {
      if (props.value || props.defaultValue) {
        setHasValue(true)
      }
    }, [props.value, props.defaultValue])

    const isLabelFloating = isFocused || hasValue

    return (
      <div className="relative w-full">
        <motion.div
          className="relative"
          initial={false}
          animate={isFocused ? "focused" : "unfocused"}
        >
          {icon && iconPosition === "left" && (
            <motion.div
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              animate={{
                color: isFocused
                  ? error
                    ? "rgb(239 68 68)"
                    : success
                    ? "rgb(34 197 94)"
                    : "rgb(79 70 229)"
                  : "rgb(156 163 175)",
                scale: isFocused ? 1.05 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}

          <motion.input
            id={inputId}
            ref={ref}
            type={inputType}
            className={cn(
              "peer flex h-14 w-full rounded-xl border-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm px-4 pt-5 pb-1 text-sm transition-all duration-200",
              "file:border-0 file:bg-transparent file:text-sm file:font-medium",
              "placeholder:text-transparent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "shadow-sm hover:shadow-md focus:shadow-lg",
              icon && iconPosition === "left" && "pl-10",
              isPassword && "pr-10",
              error && "border-error dark:border-error focus-visible:ring-error",
              success && "border-success dark:border-success focus-visible:ring-success",
              !error && !success && "border-gray-300/50 dark:border-gray-700/50 focus-visible:ring-indigo-500",
              isFocused && !error && !success && "border-indigo-500 dark:border-indigo-500 bg-white/80 dark:bg-gray-900/80",
              className
            )}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={error ? `${inputId}-error` : undefined}
            whileFocus={prefersReducedMotion ? undefined : {
              scale: 1.01,
              transition: { duration: 0.2 }
            }}
            animate={error && !prefersReducedMotion ? {
              x: [0, -4, 4, -4, 4, 0],
              transition: { duration: 0.4 }
            } : undefined}
            {...safeProps}
          />

          <motion.label
            htmlFor={inputId}
            className={cn(
              "absolute left-4 text-gray-500 dark:text-gray-400 pointer-events-none",
              icon && iconPosition === "left" && "left-10",
              error && "text-error dark:text-error",
              success && "text-success dark:text-success"
            )}
            animate={{
              top: isLabelFloating ? "0.375rem" : "50%",
              y: isLabelFloating ? 0 : "-50%",
              fontSize: isLabelFloating ? "0.75rem" : "0.875rem",
              fontWeight: isLabelFloating ? 600 : 400,
              color: isFocused
                ? error
                  ? "rgb(239 68 68)"
                  : success
                  ? "rgb(34 197 94)"
                  : "rgb(79 70 229)"
                : "rgb(107 114 128)",
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {label}
          </motion.label>

          {isPassword && (
            <motion.button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-primary rounded p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
              whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              transition={{ duration: 0.15 }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {showPassword ? (
                  <motion.div
                    key="eye-off"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <EyeOff className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="eye"
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Eye className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          )}

          {icon && iconPosition === "right" && !isPassword && (
            <motion.div
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
              animate={{
                color: isFocused
                  ? error
                    ? "rgb(239 68 68)"
                    : success
                    ? "rgb(34 197 94)"
                    : "rgb(79 70 229)"
                  : "rgb(156 163 175)",
                scale: isFocused ? 1.05 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {icon}
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              id={`${inputId}-error`}
              className="mt-2 text-xs text-error dark:text-error flex items-start gap-1"
              role="alert"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.svg
                className="w-4 h-4 mt-0.5 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.3, type: "spring" }}
              >
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </motion.svg>
              <span>{error}</span>
            </motion.p>
          )}
        </AnimatePresence>

        {/* Success checkmark animation */}
        <AnimatePresence>
          {success && !error && (
            <motion.div
              className="absolute right-3 top-1/2 -translate-y-1/2"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.3, type: "spring" }}
            >
              <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

FloatingInput.displayName = "FloatingInput"

export { FloatingInput }
