'use client';

import { TransitionLink as Link, usePageTransition } from './page-transition';
import { usePathname } from 'next/navigation';
import { sections } from '@/data/sections';
import { site } from '@/data/site';

export function ModuleShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { motionOff, circleTarget } = usePageTransition();
  const index = sections.findIndex((section) => path === `/${section.id}`);
  const next = sections[(index + 1) % sections.length];
  return (
    <div className="module-shell">
      <a className="skip-link" href="#module-content">
        Skip to content
      </a>
      <header className="module-header">
        <Link href="/" className="wordmark" aria-label={site.name + ' home'}>
          {site.initials}
          <span>↗</span>
        </Link>
        <span className="micro module-edition">{site.name.toUpperCase()} / PERSONAL INDEX</span>
        <Link href="/" className="index-link">
          ← BACK TO INDEX
        </Link>
      </header>
      <div className="module-layout">
        <div className="chapter-navigation" data-motion={motionOff ? 'off' : 'on'}>
          <div className="chapter-nav-label micro">
            <span>CHAPTER SELECT</span>
            <span aria-hidden="true" className="chapter-nav-rule" />
            <span>01 — 03</span>
          </div>
          <nav className="chapter-nav" aria-label="Portfolio sections">
            {sections.map((section) => (
              <Link
                className="chapter-link"
                data-circle-source={circleTarget === `/${section.id}` || undefined}
                key={section.id}
                href={`/${section.id}`}
                aria-current={path === `/${section.id}` ? 'page' : undefined}
              >
                <span className="chapter-face">
                  <span className="chapter-ink" aria-hidden="true">
                    <i />
                    <i />
                  </span>
                  <span className="chapter-link-number micro">{section.number}</span>
                  <span className="chapter-link-title">{section.title}</span>
                  <svg
                    className="chapter-link-arrow"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M5 19 19 5M6 5h13v13" />
                  </svg>
                  <span className="chapter-current-line" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </nav>
        </div>
        <main id="module-content" className="module-content" key={path}>
          {children}
        </main>
      </div>
      <footer className="module-footer">
        <span className="micro">
          © {site.copyrightYear} {site.name.toUpperCase()} <span className="footer-slash">/</span>{' '}
          ALWAYS CURIOUS.
        </span>
        <Link href={`/${next.id}`} className="next-chapter">
          <span className="micro">NEXT CHAPTER / {next.number}</span>
          {next.title}
          <span aria-hidden="true">↗</span>
        </Link>
      </footer>
    </div>
  );
}
