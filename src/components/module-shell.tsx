'use client';

import { TransitionLink as Link, usePageTransition } from './page-transition';
import { site } from '@/data/site';
import { usePathname } from 'next/navigation';
import { MediaFocusProvider } from './media-focus';
import { ChapterNavigation } from './chapter-navigation';

export function ModuleShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isCaseStudy = path.startsWith('/projects/');
  const isCreativeCategory = path.startsWith('/creative/');
  const returnHref = isCreativeCategory ? '/creative' : isCaseStudy ? '/projects' : '/';
  const returnTitle = isCreativeCategory ? 'CREATIVE' : 'PROJECTS';
  const { motionOff } = usePageTransition();
  return (
    <MediaFocusProvider key={path}>
      <div
        className="module-shell"
        data-case-study={isCaseStudy || isCreativeCategory || undefined}
        data-motion={motionOff ? 'off' : 'on'}
      >
        <a className="skip-link" href="#module-content">
          Skip to content
        </a>
        <header className="module-header">
          <Link href="/" className="wordmark" aria-label={`${site.name} home`}>
            {site.initials}
            {!isCaseStudy && !isCreativeCategory && <span>↗</span>}
          </Link>
          <Link href={returnHref} className="index-link">
            {isCaseStudy || isCreativeCategory ? `← BACK TO ${returnTitle}` : '← BACK TO HOMEPAGE'}
          </Link>
        </header>
        <div className="module-layout">
          <ChapterNavigation />
          <main id="module-content" className="module-content" key={path}>
            {children}
          </main>
        </div>
        <footer className="module-footer">
          <span className="micro">
            © {site.copyrightYear} {site.name} <span className="footer-slash">/</span>{' '}
            {site.location}
          </span>
        </footer>
      </div>
    </MediaFocusProvider>
  );
}
