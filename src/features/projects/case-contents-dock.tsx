'use client';

import { useEffect, useRef, useState } from 'react';
import { TransitionLink } from '../navigation/page-transition';

type Entry = { id: string; label: string };
export function CaseContentsDock({ sourceId, entries }: { sourceId: string; entries: Entry[] }) {
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState('');
  const dock = useRef<HTMLElement>(null);
  useEffect(() => {
    const source = document.getElementById(sourceId);
    if (!source) return;
    const observer = new IntersectionObserver(([entry]) => {
      const past = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
      if (!past && dock.current?.contains(document.activeElement)) {
        const href = document.activeElement?.getAttribute('href');
        Array.from(source.querySelectorAll<HTMLAnchorElement>('a'))
          .find((link) => link.getAttribute('href') === href)
          ?.focus({ preventScroll: true });
      }
      setVisible(past);
    });
    observer.observe(source);
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const current = entries
          .filter(
            (entry) =>
              (document.getElementById(entry.id)?.getBoundingClientRect().top ?? Infinity) <=
              window.innerHeight * 0.3,
          )
          .at(-1);
        setActive(current?.id ?? '');
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [sourceId, entries]);
  return (
    <nav
      ref={dock}
      className="case-contents-dock"
      data-visible={visible}
      inert={!visible}
      aria-hidden={!visible}
      aria-label="Reading sections"
    >
      {entries.map((entry, index) => (
        <TransitionLink
          key={entry.id}
          href={'#' + entry.id}
          aria-current={active === entry.id ? 'location' : undefined}
        >
          <span className="case-dock-face">
            <span className="case-dock-number micro">{String(index + 1).padStart(2, '0')}</span>
            <span className="case-dock-title">{entry.label}</span>
          </span>
        </TransitionLink>
      ))}
    </nav>
  );
}
