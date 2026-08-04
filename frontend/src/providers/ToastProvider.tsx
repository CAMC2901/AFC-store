'use client';

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#111111',
          color: '#FAFAF8',
          borderRadius: '12px',
          fontSize: '14px',
        },
        success: {
          iconTheme: { primary: '#D4AF37', secondary: '#111111' },
        },
        error: {
          style: { background: '#7F1D1D' },
        },
      }}
    />
  );
}
