import * as React from "react"

/**
 * @fileOverview Provides a hook for detecting if the current device is mobile.
 *
 * @module useMobile
 *
 * @description This module exports the useIsMobile hook, which returns a boolean
 * indicating whether the current device is mobile based on the screen width.
 */

const MOBILE_BREAKPOINT = 768

/**
 * Custom hook to determine if the current screen size is considered mobile.
 *
 * @function useIsMobile
 * @returns {boolean} True if the screen width is less than the mobile breakpoint, false otherwise.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
