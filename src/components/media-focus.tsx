'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { usePageTransition } from './page-transition';

const focusQuery = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
function subscribe(notify: () => void) {
  const query = window.matchMedia(focusQuery);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
}
const getEnabled = () => window.matchMedia(focusQuery).matches;
const getServerEnabled = () => false;
type FocusTarget = { id: string; element: HTMLElement };
type FocusContext = {
  activeId: string | undefined;
  activate: (target: FocusTarget) => void;
  release: (id: string) => void;
};
const Context = createContext<FocusContext | null>(null);

export function MediaFocusProvider({ children }: { children: ReactNode }) {
  const { motionOff } = usePageTransition();
  const enabled = useSyncExternalStore(subscribe, getEnabled, getServerEnabled) && !motionOff;
  const [target, setTarget] = useState<FocusTarget | null>(null);
  const active = enabled ? target : null;
  const activate = useCallback((next: FocusTarget) => setTarget(next), []);
  const release = useCallback(
    (id: string) => setTarget((current) => (current?.id === id ? null : current)),
    [],
  );

  useEffect(() => {
    if (!active) return;
    // The corners stay fixed to the viewport; only dismiss when the card leaves it.
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) release(active.id);
    });
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') release(active.id);
    };
    observer.observe(active.element);
    window.addEventListener('keydown', escape);
    return () => {
      observer.disconnect();
      window.removeEventListener('keydown', escape);
    };
  }, [active, release]);

  return (
    <Context.Provider value={{ activeId: active?.id, activate, release }}>
      {children}
      <div
        className="media-focus-vignette"
        data-active={active ? 'true' : 'false'}
        aria-hidden="true"
      />
    </Context.Provider>
  );
}

export function MediaFocus({
  as: Tag = 'article',
  className,
  label,
  children,
  id,
  live,
}: {
  as?: 'article' | 'section' | 'aside';
  className: string;
  label: string;
  children: ReactNode;
  id?: string;
  live?: 'polite';
}) {
  const focus = useContext(Context);
  if (!focus) throw new Error('MediaFocus requires MediaFocusProvider');
  const focusId = useId();
  const { activate, release, activeId } = focus;
  useEffect(() => () => release(focusId), [focusId, release]);

  return (
    <Tag
      id={id}
      className={`${className} media-focus ${activeId === focusId ? 'is-media-focused' : ''}`}
      tabIndex={0}
      aria-label={label}
      aria-live={live}
      aria-atomic={live ? true : undefined}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') activate({ id: focusId, element: event.currentTarget });
      }}
      onPointerLeave={(event) => {
        if (
          !event.currentTarget.querySelector(':focus-visible') &&
          !event.currentTarget.matches(':focus-visible')
        )
          release(focusId);
      }}
      onFocus={(event) => {
        if (event.target.matches(':focus-visible'))
          activate({ id: focusId, element: event.currentTarget });
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) release(focusId);
      }}
    >
      {children}
    </Tag>
  );
}
