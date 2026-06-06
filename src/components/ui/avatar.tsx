
"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

/**
 * @fileOverview Provides UI components for creating avatars using Radix UI.
 *
 * @module Avatar
 *
 * @description This module exports the Avatar, AvatarImage, and AvatarFallback components,
 * which are styled wrappers around Radix UI primitives for creating accessible and customizable avatars.
 */

/**
 * Avatar component.
 * The root component for an avatar.
 * @component
 * @param {React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>} props - Props for the Avatar component.
 * @returns {JSX.Element} The rendered Avatar component.
 */
const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = AvatarPrimitive.Root.displayName

/**
 * AvatarImage component.
 * The image element within an avatar. It includes error handling for image loading.
 * @component
 * @param {React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>} props - Props for the AvatarImage component.
 * @returns {JSX.Element} The rendered AvatarImage component.
 */
const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    className={cn("aspect-square h-full w-full", className)}
    {...props}
  />
))
AvatarImage.displayName = AvatarPrimitive.Image.displayName

/**
 * AvatarFallback component.
 * The fallback element displayed when the avatar image fails to load or is not provided.
 * Typically contains initials or a default icon.
 * @component
 * @param {React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>} props - Props for the AvatarFallback component.
 * @returns {JSX.Element} The rendered AvatarFallback component.
 */
const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-muted",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
