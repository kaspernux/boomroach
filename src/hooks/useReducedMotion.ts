import { useState, useEffect } from 'react'

export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

// Utility function to get motion config based on user preference
export function getMotionConfig(prefersReducedMotion: boolean) {
  return {
    animate: prefersReducedMotion ? false : true,
    transition: prefersReducedMotion ? { duration: 0 } : undefined,
    initial: prefersReducedMotion ? false : undefined,
  }
}
