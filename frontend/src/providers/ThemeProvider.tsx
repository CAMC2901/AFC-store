'use client';

import { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

/** Resolve initial theme from localStorage, then OS preference. */
function resolveTheme(): 'light' | 'dark' {
  const stored = (() => {
    try {
      return window.localStorage.getItem('afc:theme');
    } catch {
      return null;
    }
  })();

  if (stored === 'light' || stored === 'dark') return stored;
  if (
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  ) {
    return 'dark';
  }
  return 'light';
}

/**
 * Applied before React hydrates to avoid a flash of the wrong theme.
 * Must remain dependency-free and inline-able.
 */
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var t=localStorage.getItem('afc:theme');if(t==='dark'||(t!=='light'&&matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`,
      }}
    />
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);
  const [mounted, setMounted] = useState(false);

  // On mount: adopt resolved theme (once) so OS preference is respected.
  useEffect(() => {
    const resolved = resolveTheme();
    useThemeStore.getState().setTheme(resolved);
    setMounted(true);
  }, []);

  // Keep <html> class in sync and persist changes.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    try {
      window.localStorage.setItem('afc:theme', theme);
    } catch {
      /* ignore storage errors */
    }
  }, [theme]);

  if (!mounted) return <>{children}</>;
  return <>{children}</>;
}
