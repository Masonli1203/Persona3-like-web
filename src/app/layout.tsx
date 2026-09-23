import type { Metadata } from 'next';
import { site } from '@/data/site';
import localFont from 'next/font/local';
import './globals.css';
import './transitions.css';
import { PageTransitionProvider } from '@/components/page-transition';

const plexMono = localFont({
  src: [
    { path: './fonts/ibm-plex-mono-latin-500.woff2', weight: '500', style: 'normal' },
    { path: './fonts/ibm-plex-mono-latin-600.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--font-plex-mono',
  display: 'swap',
  fallback: ['Courier New', 'monospace'],
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: `${site.name} — ${site.role}`,
  description: site.description,
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={plexMono.variable} data-scroll-behavior="smooth">
      <body>
        <PageTransitionProvider>{children}</PageTransitionProvider>
      </body>
    </html>
  );
}
