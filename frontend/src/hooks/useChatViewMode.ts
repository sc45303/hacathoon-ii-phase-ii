'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ViewMode } from '@/providers/ChatProvider';

/**
 * Custom hook for media query matching
 */
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    media.addEventListener('change', listener);

    // Cleanup
    return () => {
      media.removeEventListener('change', listener);
    };
  }, [query]);

  return matches;
}

/**
 * Hook to determine the appropriate chat view mode based on:
 * - Current route (dashboard vs content pages)
 * - Screen size (mobile, tablet, desktop)
 *
 * View mode logic:
 * - Mobile (<768px): Always fullscreen
 * - Tablet (768-1024px): slide-over for dashboard, modal for content pages
 * - Desktop (>1024px): sidebar for dashboard, modal for content pages
 */
export function useChatViewMode(): ViewMode {
  const pathname = usePathname();

  // Media queries
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  // Check if current route should use sidebar mode (dashboard or landing page)
  const isDashboard = pathname?.startsWith('/dashboard') ?? false;
  const isLandingPage = pathname === '/';
  const useSidebarMode = isDashboard || isLandingPage;

  // Determine view mode
  if (isMobile) {
    return 'fullscreen';
  }

  if (isTablet) {
    return useSidebarMode ? 'slide-over' : 'modal';
  }

  if (isDesktop) {
    return useSidebarMode ? 'sidebar' : 'modal';
  }

  // Default fallback
  return 'modal';
}
