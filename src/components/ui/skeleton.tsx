import { cn } from "@/lib/utils"

/**
 * @fileOverview Provides a UI component for creating skeleton placeholders.
 *
 * @module Skeleton
 *
 * @description This module exports the Skeleton component, which is a styled div
 * that can be used as a placeholder while content is loading.
 */

/**
 * Skeleton component.
 *
 * @component
 * @description A styled div that can be used as a placeholder while content is loading.
 * @returns {JSX.Element} The rendered Skeleton component.
 */
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
