"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Theme,
  getStoredTheme,
  setStoredTheme,
  resolveTheme,
  applyTheme,
  watchSystemTheme,
} from "@/lib/theme";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
}

/**
 * ThemeProvider component that manages the application theme
 * Supports light, dark, and system preference modes
 */
export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const storedTheme = getStoredTheme();
    setThemeState(storedTheme);

    const resolved = resolveTheme(storedTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);

    setMounted(true);
  }, []);

  // Watch for system theme changes when theme is set to 'system'
  useEffect(() => {
    if (theme !== "system") return;

    const unsubscribe = watchSystemTheme((systemTheme) => {
      setResolvedTheme(systemTheme);
      applyTheme(systemTheme);
    });

    return unsubscribe;
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setStoredTheme(newTheme);

    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  };

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
  };

  // Prevent flash of unstyled content by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Hook to access the theme context
 * Must be used within a ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
