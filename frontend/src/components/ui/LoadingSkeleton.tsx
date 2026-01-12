"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface LoadingSkeletonProps
  extends React.HTMLAttributes<HTMLDivElement> {
  count?: number
  variant?: "task" | "card" | "text" | "circle"
}

const LoadingSkeleton = React.forwardRef<HTMLDivElement, LoadingSkeletonProps>(
  ({ className, count = 1, variant = "task", ...props }, ref) => {
    const items = Array.from({ length: count }, (_, i) => i)

    const renderSkeleton = () => {
      switch (variant) {
        case "task":
          return (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
              <div className="h-5 w-5 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </div>
          )
        case "card":
          return (
            <div className="p-6 rounded-lg border border-border bg-card space-y-4">
              <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse w-full" />
                <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
                <div className="h-4 bg-muted rounded animate-pulse w-4/6" />
              </div>
            </div>
          )
        case "text":
          return (
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse w-full" />
              <div className="h-4 bg-muted rounded animate-pulse w-5/6" />
            </div>
          )
        case "circle":
          return (
            <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
          )
        default:
          return null
      }
    }

    return (
      <div
        ref={ref}
        className={cn("space-y-3", className)}
        role="status"
        aria-label="Loading"
        aria-live="polite"
        {...props}
      >
        {items.map((i) => (
          <div key={i}>{renderSkeleton()}</div>
        ))}
        <span className="sr-only">Loading...</span>
      </div>
    )
  }
)

LoadingSkeleton.displayName = "LoadingSkeleton"

export { LoadingSkeleton }
