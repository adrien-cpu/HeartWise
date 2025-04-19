use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

/**
 * @fileOverview Provides a component for displaying toast notifications.
 *
 * @module Toaster
 *
 * @description This module exports the Toaster component, which uses the useToast hook
 * to display toast notifications.
 */

/**
 * Toaster component.
 *
 * @component
 * @description A component that displays toast notifications.
 * @returns {JSX.Element} The rendered Toaster component.
 */
export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
