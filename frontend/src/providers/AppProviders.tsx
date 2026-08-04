'use client';

import { type ReactNode } from 'react';
import { QueryProvider } from './QueryProvider';
import { ToastProvider } from './ToastProvider';
import { ThemeProvider } from './ThemeProvider';
import { I18nProvider } from '@/i18n';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <QueryProvider>
          <ToastProvider />
          {children}
        </QueryProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
