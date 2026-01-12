/**
 * Theme utility functions for managing light/dark mode
 */

export type Theme = 'light' | 'dark' | 'system';

const THEME_STORAGE_KEY = 'todo-app-theme';

/**
 * Get the current theme from localStorage
 */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';

  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch (error) {
    console.error('Error reading theme from localStorage:', error);
  }

  return 'system';
}

/**
 * Store the theme preference in localStorage
 */
export function setStoredTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    console.error('Error storing theme in localStorage:', error);
  }
}

/**
 * Get the system's preferred color scheme
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Resolve the actual theme to apply based on the theme preference
 */
export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

/**
 * Apply the theme to the document
 */
export function applyTheme(theme: 'light' | 'dark'): void {
  if (typeof window === 'undefined') return;

  const root = document.documentElement;

  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * Initialize theme on page load (to prevent flash of wrong theme)
 * This should be called as early as possible, ideally in a blocking script
 */
export function initializeTheme(): void {
  const storedTheme = getStoredTheme();
  const resolvedTheme = resolveTheme(storedTheme);
  applyTheme(resolvedTheme);
}

/**
 * Listen for system theme changes
 */
export function watchSystemTheme(callback: (theme: 'light' | 'dark') => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handler = (e: MediaQueryListEvent) => {
    callback(e.matches ? 'dark' : 'light');
  };

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }

  // Fallback for older browsers
  mediaQuery.addListener(handler);
  return () => mediaQuery.removeListener(handler);
}
