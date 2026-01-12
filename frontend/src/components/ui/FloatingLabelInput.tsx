"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface FloatingLabelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const FloatingLabelInput = React.forwardRef<
  HTMLInputElement,
  FloatingLabelInputProps
>(({ className, label, error, id, ...props }, ref) => {
  const [isFocused, setIsFocused] = React.useState(false)
  const [hasValue, setHasValue] = React.useState(false)
  const inputId = id || React.useId()

  const handleFocus = () => setIsFocused(true)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false)
    setHasValue(e.target.value.length > 0)
    props.onBlur?.(e)
  }

  React.useEffect(() => {
    if (props.value || props.defaultValue) {
      setHasValue(true)
    }
  }, [props.value, props.defaultValue])

  const isLabelFloating = isFocused || hasValue

  return (
    <div className="relative w-full">
      <input
        id={inputId}
        ref={ref}
        className={cn(
          "peer flex h-12 w-full rounded-md border border-input bg-background px-3 pt-4 pb-1 text-sm transition-colors",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-transparent",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      />
      <label
        htmlFor={inputId}
        className={cn(
          "absolute left-3 text-muted-foreground transition-all duration-200 pointer-events-none",
          isLabelFloating
            ? "top-1 text-xs font-medium"
            : "top-1/2 -translate-y-1/2 text-sm",
          isFocused && "text-foreground",
          error && "text-destructive"
        )}
      >
        {label}
      </label>
      {error && (
        <p
          id={`${inputId}-error`}
          className="mt-1.5 text-xs text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
})

FloatingLabelInput.displayName = "FloatingLabelInput"

export { FloatingLabelInput }
