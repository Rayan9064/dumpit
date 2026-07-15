'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  /** The currently active rendered theme (always 'light' or 'dark') */
  resolvedTheme: 'light' | 'dark';
  /** The user's saved preference, including 'system' */
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  /** Legacy: kept for backwards compatibility with components that used toggleTheme */
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(resolved: 'light' | 'dark') {
  document.documentElement.classList.toggle('dark', resolved === 'dark');
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // On mount: read saved preference, apply it
  useEffect(() => {
    const saved = (localStorage.getItem('theme-mode') as ThemeMode) || 'system';
    const resolved = saved === 'system' ? getSystemTheme() : saved;
    setThemeModeState(saved);
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  // Listen for system preference changes when in 'system' mode
  useEffect(() => {
    if (themeMode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const resolved = e.matches ? 'dark' : 'light';
      setResolvedTheme(resolved);
      applyTheme(resolved);
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    const resolved = mode === 'system' ? getSystemTheme() : mode;
    setThemeModeState(mode);
    setResolvedTheme(resolved);
    localStorage.setItem('theme-mode', mode);
    applyTheme(resolved);
  };

  // Legacy compat: toggle between light and dark (skips system)
  const toggleTheme = () => {
    setThemeMode(resolvedTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ resolvedTheme, themeMode, setThemeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
