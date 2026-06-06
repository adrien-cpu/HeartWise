import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * @fileOverview Provides utility functions for class name manipulation.
 *
 * @module utils
 *
 * @description This module exports the cn function, which combines class names using clsx and tailwind-merge.
 */

/**
 * Combines class names using clsx and tailwind-merge.
 *
 * @function cn
 * @param {...ClassValue[]} inputs - A list of class names to combine.
 * @returns {string} A string containing the combined class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
