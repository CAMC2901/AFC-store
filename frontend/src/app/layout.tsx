import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AppProviders } from '@/providers/AppProviders';
import { ThemeScript } from '@/providers/ThemeProvider';
import { Shell } from '@/components/layout/Shell';
import { SITE } from '@/constants';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  keywords: ['furniture', 'sofa', 'dining', 'bedroom', 'office', 'luxury furniture', SITE.name],
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFAF8' },
    { media: '(prefers-color-scheme: dark)', color: '#0E0E10' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <ThemeScript />
      </head>
      <body>
        <AppProviders>
          <Shell>{children}</Shell>
        </AppProviders>
      </body>
    </html>
  );
}
