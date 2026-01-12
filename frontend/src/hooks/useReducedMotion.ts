'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user prefers reduced motion
 * Respects the prefers-reduced-motion media query for accessibility
 *
 * @returns {boolean} True if user prefers reduced motion, false otherwise
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check if window is available (client-side only)
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
    // Fallback for older browsers
    else {
      // @ts-ignore - addListener is deprecated but needed for older browsers
      mediaQuery.addListener(listener);
      // @ts-ignore
      return () => mediaQuery.removeListener(listener);
    }
  }, []);

  return prefersReducedMotion;
}

/**
 * Helper function to get animation duration based on reduced motion preference
 *
 * @param normalDuration - Duration in seconds for normal motion
 * @param prefersReducedMotion - Whether user prefers reduced motion
 * @returns Duration in seconds (0.01 for reduced motion, normal otherwise)
 */
export function getAnimationDuration(
  normalDuration: number,
  prefersReducedMotion: boolean
): number {
  return prefersReducedMotion ? 0.01 : normalDuration;
}

/**
 * Helper function to get animation variants based on reduced motion preference
 *
 * @param normalVariant - Normal animation variant
 * @param reducedVariant - Reduced motion variant (optional, defaults to instant)
 * @param prefersReducedMotion - Whether user prefers reduced motion
 * @returns Appropriate variant based on preference
 */
export function getAnimationVariant<T>(
  normalVariant: T,
  reducedVariant: T | null,
  prefersReducedMotion: boolean
): T {
  if (prefersReducedMotion && reducedVariant !== null) {
    return reducedVariant;
  }
  return normalVariant;
}
