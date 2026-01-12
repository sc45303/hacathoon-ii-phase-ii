/**
 * Theme initialization script
 * This script runs before React hydration to prevent flash of unstyled content (FOUC)
 * It should be inlined in the HTML head as a blocking script
 */

(function initTheme() {
  const THEME_STORAGE_KEY = 'todo-app-theme';

  function getStoredTheme() {
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

  function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function resolveTheme(theme) {
    if (theme === 'system') {
      return getSystemTheme();
    }
    return theme;
  }

  function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }

  // Initialize theme immediately
  const storedTheme = getStoredTheme();
  const resolvedTheme = resolveTheme(storedTheme);
  applyTheme(resolvedTheme);
})();
