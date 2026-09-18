import type { Metadata } from 'next';
import { site } from '@/data/site';
import './globals.css';
import './transitions.css';
import { PageTransitionProvider } from '@/components/page-transition';
export const metadata: Metadata = {
  title: `${site.name} — ${site.role}`,
  description: site.description,
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <PageTransitionProvider>{children}</PageTransitionProvider>
      </body>
    </html>
  );
}
