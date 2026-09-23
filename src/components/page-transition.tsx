'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ComponentProps,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { ClockOverlay } from './transition-clock';
import { InkCursor } from './ink-cursor';
import { CircleOverlay, type CircleGeometry, type CirclePhase } from './circle-overlay';
import { playPressFeedback, PRESS_FEEDBACK_MS } from './press-feedback';

const chapters: Record<string, string> = {
  '/': 'INDEX',
  '/creative': 'CREATIVE',
  '/projects': 'PROJECTS',
  '/about': 'ABOUT',
};
type TransitionOrigin = { x: number; y: number };
type Transition = { id: number; target: string } & (
  | { phase: 'press' | 'clock' | 'shatter' | 'error' }
  | { phase: CirclePhase; circle: CircleGeometry; duration: number }
);
type TransitionContext = {
  navigate: (href: string, origin?: TransitionOrigin, pressFeedback?: boolean) => void;
  motionOff: boolean;
  circleTarget: string | null;
  setMotionOff: Dispatch<SetStateAction<boolean>>;
};
const Context = createContext<TransitionContext | null>(null);

function pause(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException('Transition cancelled', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, ms);
    if (signal.aborted) abort();
    else signal.addEventListener('abort', abort, { once: true });
  });
}

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = useRef(pathname);
  const [transition, setTransition] = useState<Transition | null>(null);
  const [motionOff, setMotionOff] = useState(false);
  const transitioning = transition !== null;
  const running = useRef<AbortController | null>(null);
  const sequence = useRef(0);
  const prepared = useRef(0);
  const markPrepared = useCallback(() => {
    prepared.current = sequence.current;
  }, []);
  const overlay = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const circleStep = useRef<{ id: number; phase: CirclePhase; finish: () => void } | null>(null);

  useEffect(() => {
    currentPath.current = pathname;
  }, [pathname]);
  useEffect(() => () => running.current?.abort(), []);

  const begin = useCallback(
    async (target: string, history = false, origin?: TransitionOrigin, pressFeedback = false) => {
      // History can land on a case study too; it must always release an old overlay.
      if (history) {
        running.current?.abort();
        running.current = null;
        ++sequence.current;
        setTransition(null);
        return;
      }
      if (!(target in chapters)) return;
      // Lock navigation immediately, including the frame before the overlay mounts.
      if (!history && (running.current || target === currentPath.current)) return;
      running.current?.abort();
      const id = ++sequence.current;
      // Browser history and returning to INDEX remain direct.
      if (target === '/') {
        running.current = null;
        setTransition(null);
        router.push(target);
        return;
      }
      const circular = currentPath.current !== '/';
      const returningToProjects =
        target === '/projects' && currentPath.current.startsWith('/projects/');
      // Use the reserved layout width so the circle stays aligned with its button.
      const width = document.documentElement.getBoundingClientRect().width,
        height = window.innerHeight;
      const x = Math.max(0, Math.min(width, origin?.x ?? width / 2));
      const y = Math.max(0, Math.min(height, origin?.y ?? height / 2));
      const circle = {
        x,
        y,
        width,
        height,
        radius: Math.hypot(Math.max(x, width - x), Math.max(y, height - y)) + 2,
      };
      const controller = new AbortController();
      running.current = controller;
      const skip = motionOff || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      lastFocus.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      if (!skip && pressFeedback) setTransition({ id, target, phase: 'press' });
      else if (!skip && !circular) setTransition({ id, target, phase: 'clock' });
      else setTransition(null);
      let started = performance.now();
      const query = window.matchMedia('(prefers-reduced-motion: reduce)');
      let reduced = skip;
      const changed = () => {
        if (query.matches) {
          reduced = true;
          circleStep.current?.finish();
          setTransition(null);
        }
      };
      query.addEventListener('change', changed);
      // Prefer the animation event, but never let a dropped/cancelled SVG event
      // leave the visible page inert behind a transparent overlay.
      const playCircle = (phase: CirclePhase, duration = 250) =>
        new Promise<void>((resolve) => {
          if (controller.signal.aborted) {
            resolve();
            return;
          }
          let finished = false;
          const finish = () => {
            if (finished) return;
            finished = true;
            clearTimeout(deadline);
            controller.signal.removeEventListener('abort', finish);
            if (circleStep.current?.id === id && circleStep.current.phase === phase)
              circleStep.current = null;
            resolve();
          };
          const deadline = setTimeout(finish, duration + 200);
          circleStep.current = { id, phase, finish };
          controller.signal.addEventListener('abort', finish, { once: true });
          setTransition({ id, target, phase, circle, duration });
        });
      try {
        if (!reduced && pressFeedback) {
          router.prefetch(target);
          await pause(PRESS_FEEDBACK_MS, controller.signal);
          if (controller.signal.aborted) return;
          started = performance.now();
          if (!reduced && !circular) setTransition({ id, target, phase: 'clock' });
        }
        // Keep the outgoing page visible during the fade; only navigate once covered.
        if (!history) {
          if (!reduced) {
            router.prefetch(target);
            if (circular) await playCircle('circle-cover');
            else await pause(280, controller.signal);
          }
          if (controller.signal.aborted) return;
          router.push(target, { scroll: !returningToProjects });
        }
        while (
          currentPath.current !== target ||
          (!reduced && !circular && (performance.now() - started < 1120 || prepared.current !== id))
        ) {
          if (performance.now() - started > 10000) throw new Error('Route did not become ready');
          await pause(circular ? 16 : 30, controller.signal);
        }
        // Return from a case study at the handoff between the top nav and its dock.
        // Measure the incoming page so the position follows its responsive typography.
        const entryNav = returningToProjects
          ? document.querySelector<HTMLElement>('[data-chapter-entry="/projects"]')
          : null;
        const top = entryNav
          ? Math.ceil(entryNav.getBoundingClientRect().bottom + window.scrollY) + 1
          : 0;
        window.scrollTo({ top, left: 0, behavior: 'instant' });
        // Let the navigation observer reveal the dock while the page is still covered.
        if (entryNav) await pause(32, controller.signal);
        if (!reduced) {
          if (circular) {
            // Network and background-tab delays must not stretch the reveal lock.
            await playCircle('circle-reveal');
          } else {
            setTransition({ id, target, phase: 'shatter' });
            await pause(1250, controller.signal);
          }
        }
        if (controller.signal.aborted) return;
        setTransition(null);
        running.current = null;
        const focusMain = () => {
          if (sequence.current !== id) return;
          const main = document.querySelector<HTMLElement>('main');
          // A busy frame can run before React commits removal of the inert attribute.
          if (main?.closest('[inert]')) {
            requestAnimationFrame(focusMain);
            return;
          }
          main?.setAttribute('tabindex', '-1');
          main?.focus({ preventScroll: true });
        };
        requestAnimationFrame(focusMain);
      } catch (error) {
        if (controller.signal.aborted) return;
        if (error instanceof Error) setTransition({ id, target, phase: 'error' });
      } finally {
        query.removeEventListener('change', changed);
      }
    },
    [motionOff, router],
  );

  useEffect(() => {
    const historyChanged = () => {
      void begin(window.location.pathname, true);
    };
    window.addEventListener('popstate', historyChanged);
    return () => window.removeEventListener('popstate', historyChanged);
  }, [begin]);

  useEffect(() => {
    if (!transitioning) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [transitioning]);

  useEffect(() => {
    if (transition?.phase && transition.phase !== 'press')
      overlay.current?.focus({ preventScroll: true });
  }, [transition?.phase]);

  function cancel() {
    running.current?.abort();
    running.current = null;
    setTransition(null);
    requestAnimationFrame(() => lastFocus.current?.focus({ preventScroll: true }));
  }

  return (
    <Context.Provider
      value={{
        navigate: (href, origin, pressFeedback) => {
          void begin(href, false, origin, pressFeedback);
        },
        motionOff,
        circleTarget: transition?.phase.startsWith('circle-') ? transition.target : null,
        setMotionOff,
      }}
    >
      <div
        inert={!!transition}
        className="page-stage"
        data-transition={
          transition?.phase === 'press'
            ? 'press'
            : transition?.phase.startsWith('circle-')
              ? 'circle'
              : undefined
        }
      >
        {children}
      </div>
      {transition && transition.phase !== 'press' && (
        <div
          ref={overlay}
          className={`chapter-transition phase-${transition.phase}${transition.phase.startsWith('circle-') ? ' circle-transition' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-label={`Opening ${chapters[transition.target]}`}
          tabIndex={-1}
          onKeyDown={(event) => {
            if (event.key === 'Tab' && transition.phase !== 'error') event.preventDefault();
          }}
        >
          {transition.phase === 'error' ? (
            <div className="transition-recovery">
              <h2>This chapter is taking longer to open.</h2>
              <p>You can open it directly or return to the current page.</p>
              <a href={transition.target}>Open {chapters[transition.target]} ↗</a>
              <button onClick={cancel}>Return to page</button>
            </div>
          ) : transition.phase === 'circle-cover' || transition.phase === 'circle-reveal' ? (
            <CircleOverlay
              phase={transition.phase}
              circle={transition.circle}
              duration={transition.duration}
              onComplete={() => {
                if (
                  circleStep.current?.id === transition.id &&
                  circleStep.current.phase === transition.phase
                )
                  circleStep.current.finish();
              }}
            />
          ) : (
            <ClockOverlay
              key={transition.id}
              phase={transition.phase}
              chapter={chapters[transition.target]}
              onReady={markPrepared}
            />
          )}
        </div>
      )}
      <InkCursor motionOff={motionOff} />
    </Context.Provider>
  );
}

export function usePageTransition() {
  const value = useContext(Context);
  if (!value) throw new Error('Page transitions require PageTransitionProvider');
  return value;
}

type TransitionLinkProps = Omit<ComponentProps<typeof Link>, 'href' | 'onNavigate'> & {
  href: string;
  pressFeedback?: boolean;
};
export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  function TransitionLink({ href, onClick, pressFeedback = false, ...props }, ref) {
    const { navigate, motionOff } = usePageTransition();
    const origin = useRef<TransitionOrigin | undefined>(undefined);
    const accent = useRef<Animation | null>(null);
    useEffect(() => () => accent.current?.cancel(), []);
    return (
      <Link
        {...props}
        ref={ref}
        href={href}
        data-press-feedback={pressFeedback || undefined}
        onClick={(event) => {
          onClick?.(event);
          if (event.defaultPrevented) return;
          const rect = event.currentTarget.getBoundingClientRect();
          origin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          if (
            pressFeedback &&
            !motionOff &&
            !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
            event.button === 0 &&
            !event.metaKey &&
            !event.ctrlKey &&
            !event.shiftKey &&
            !event.altKey &&
            (!props.target || props.target === '_self')
          ) {
            accent.current?.cancel();
            accent.current = playPressFeedback(event.currentTarget);
          }
        }}
        onNavigate={(event) => {
          if (href in chapters) {
            event.preventDefault();
            navigate(href, origin.current, pressFeedback);
          }
        }}
      />
    );
  },
);
