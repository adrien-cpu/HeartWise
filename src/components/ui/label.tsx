
"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * @fileOverview Provides a UI component for creating labels.
 *
 * @module Label
 *
 * @description This module exports the Label component and the labelVariants function,
 * which are used to create styled labels.
 */

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, htmlFor, id, ...props }, ref) => ( // Accept htmlFor and id props
  <LabelPrimitive.Root
    ref={ref}
    htmlFor={htmlFor} // Pass htmlFor to the underlying primitive
    id={id} // Pass id if provided (for aria-labelledby)
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
