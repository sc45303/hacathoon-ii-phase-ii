"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface InlineTaskInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onSubmit"> {
  onSubmit: (value: string) => void | Promise<void>
  onCancel?: () => void
  submitLabel?: string
  cancelLabel?: string
  isLoading?: boolean
}

const InlineTaskInput = React.forwardRef<HTMLInputElement, InlineTaskInputProps>(
  (
    {
      className,
      onSubmit,
      onCancel,
      submitLabel = "Add Task",
      cancelLabel = "Cancel",
      isLoading = false,
      placeholder = "Task name",
      ...props
    },
    ref
  ) => {
    const [value, setValue] = React.useState("")
    const [isExpanded, setIsExpanded] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    React.useImperativeHandle(ref, () => inputRef.current!)

    const handleFocus = () => {
      setIsExpanded(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      if (!value.trim() || isLoading) return

      await onSubmit(value.trim())
      setValue("")
      setIsExpanded(false)
      inputRef.current?.blur()
    }

    const handleCancel = () => {
      setValue("")
      setIsExpanded(false)
      inputRef.current?.blur()
      onCancel?.()
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        handleCancel()
      }
      props.onKeyDown?.(e)
    }

    return (
      <form onSubmit={handleSubmit} className="w-full">
        <div
          className={cn(
            "flex flex-col gap-2 rounded-lg border border-input bg-background p-2 transition-all",
            isExpanded && "ring-2 ring-ring ring-offset-2",
            className
          )}
        >
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            className={cn(
              "flex h-9 w-full rounded-md bg-transparent px-2 py-1 text-sm transition-colors",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            aria-label="Task input"
            {...props}
          />

          {isExpanded && (
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="submit"
                size="sm"
                disabled={!value.trim() || isLoading}
                className="h-8"
              >
                {isLoading ? "Adding..." : submitLabel}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={isLoading}
                className="h-8"
              >
                {cancelLabel}
              </Button>
            </div>
          )}
        </div>
      </form>
    )
  }
)

InlineTaskInput.displayName = "InlineTaskInput"

export { InlineTaskInput }
