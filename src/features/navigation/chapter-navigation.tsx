'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { sections } from '@/data/sections';
import { TransitionLink as Link, usePageTransition } from './page-transition';

export function ChapterNavigation() {
  const path = usePathname();
  const isCreativeCategory = path.startsWith('/creative/');
  const isCaseStudy = path.startsWith('/projects/') || isCreativeCategory;
  const returnSection = isCreativeCategory ? 'creative' : 'projects';
  const returnLabel = isCreativeCategory ? 'Back to Creative' : 'Back to Projects';
  const entries = isCaseStudy
    ? sections.filter((section) => section.id === returnSection)
    : sections;
  const { motionOff, circleTarget } = usePageTransition();
  const topNav = useRef<HTMLElement>(null);
  const dock = useRef<HTMLDivElement>(null);
  const [docked, setDocked] = useState(false);
  const [source, setSource] = useState<'top' | 'dock' | null>(null);
  const dockIsSource = circleTarget !== null && source === 'dock';

  useEffect(() => {
    const nav = topNav.current;
    if (!nav) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // A nav below the viewport is not a reason to show a second navigation.
        const pastTop = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
        if (!pastTop && dock.current?.contains(document.activeElement)) {
          const href = document.activeElement?.getAttribute('href');
          const matchingLink = Array.from(nav.querySelectorAll<HTMLAnchorElement>('a')).find(
            (link) => link.getAttribute('href') === href,
          );
          (
            matchingLink ?? document.querySelector<HTMLAnchorElement>('.module-header .wordmark')
          )?.focus({ preventScroll: true });
        }
        setDocked(pastTop);
      },
      { threshold: 0 },
    );
    observer.observe(nav);
    return () => observer.disconnect();
  }, []);

  const links = (location: 'top' | 'dock') =>
    entries.map((section) => (
      <Link
        className={`chapter-link${isCaseStudy ? ' chapter-return-link' : ''}`}
        pressFeedback
        data-circle-source={(source === location && circleTarget === `/${section.id}`) || undefined}
        key={section.id}
        href={`/${section.id}`}
        aria-label={isCaseStudy ? returnLabel : undefined}
        aria-current={
          !isCaseStudy && (path === `/${section.id}` || path.startsWith(`/${section.id}/`))
            ? 'page'
            : undefined
        }
        onClick={() => setSource(location)}
      >
        <span className="chapter-face">
          <span className="chapter-ink" aria-hidden="true">
            <i />
            <i />
          </span>
          <span className="chapter-link-number micro">
            {isCaseStudy ? 'BACK TO' : section.number}
          </span>
          <span className="chapter-link-title" data-press-label>
            {section.title}
          </span>
          <svg
            className="chapter-link-arrow"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d={isCaseStudy ? 'M19 12H5m7-7-7 7 7 7' : 'M5 19 19 5M6 5h13v13'} />
          </svg>
          <span className="chapter-current-line" aria-hidden="true" />
        </span>
      </Link>
    ));

  return (
    <>
      <div
        className={`chapter-navigation${isCaseStudy ? ' case-return-navigation' : ''}`}
        data-motion={motionOff ? 'off' : 'on'}
        data-circle-source={(circleTarget !== null && source === 'top') || undefined}
      >
        <nav
          ref={topNav}
          className="chapter-nav"
          data-chapter-entry={path}
          aria-label={isCaseStudy ? returnLabel : 'Portfolio sections'}
        >
          {links('top')}
        </nav>
      </div>
      <div
        ref={dock}
        className={`chapter-navigation chapter-dock${isCaseStudy ? ' case-return-navigation' : ''}`}
        data-visible={docked}
        data-motion={motionOff ? 'off' : 'on'}
        data-circle-source={dockIsSource || undefined}
        inert={!docked}
        aria-hidden={!docked}
      >
        <nav
          className="chapter-nav"
          aria-label={isCaseStudy ? returnLabel : 'Quick section navigation'}
        >
          {links('dock')}
          {!isCaseStudy && (
            <Link href="/" className="chapter-link chapter-home-link" pressFeedback>
              <span className="chapter-face">
                <span className="chapter-link-title" data-press-label>
                  Homepage
                </span>
              </span>
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
