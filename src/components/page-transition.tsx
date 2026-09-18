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

const chapters: Record<string, string> = {
  '/': 'INDEX',
  '/creative': 'CREATIVE',
  '/projects': 'PROJECTS',
  '/about': 'ABOUT',
};
type TransitionOrigin = { x: number; y: number };
type Transition = { id: number; target: string } & (
  | { phase: 'clock' | 'shatter' | 'error' }
  | { phase: CirclePhase; circle: CircleGeometry; duration: number }
);
type TransitionContext = {
  navigate: (href: string, origin?: TransitionOrigin) => void;
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
  const circleStarted = useRef(0);
  const circleStep = useRef<{ id: number; phase: CirclePhase; finish: () => void } | null>(null);

  useEffect(() => {
    currentPath.current = pathname;
  }, [pathname]);
  useEffect(() => () => running.current?.abort(), []);

  const begin = useCallback(
    async (target: string, history = false, origin?: TransitionOrigin) => {
      if (!(target in chapters)) return;
      // Lock navigation immediately, including the frame before the overlay mounts.
      if (!history && (running.current || target === currentPath.current)) return;
      running.current?.abort();
      const id = ++sequence.current;
      // Browser history and returning to INDEX remain direct.
      if (history || target === '/') {
        running.current = null;
        setTransition(null);
        if (!history) router.push(target);
        return;
      }
      const circular = currentPath.current !== '/';
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
      if (!skip && !circular) setTransition({ id, target, phase: 'clock' });
      else setTransition(null);
      const started = performance.now();
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
      // Advance on the actual animation end, so a slow frame cannot expose a route swap.
      const playCircle = (phase: CirclePhase, duration = 250) =>
        new Promise<void>((resolve) => {
          if (controller.signal.aborted) {
            resolve();
            return;
          }
          const finish = () => {
            controller.signal.removeEventListener('abort', finish);
            if (circleStep.current?.id === id && circleStep.current.phase === phase)
              circleStep.current = null;
            resolve();
          };
          circleStep.current = { id, phase, finish };
          controller.signal.addEventListener('abort', finish, { once: true });
          if (phase === 'circle-cover') circleStarted.current = performance.now();
          setTransition({ id, target, phase, circle, duration });
        });
      try {
        // Keep the outgoing page visible during the fade; only navigate once covered.
        if (!history) {
          if (!reduced) {
            router.prefetch(target);
            if (circular) await playCircle('circle-cover');
            else await pause(280, controller.signal);
          }
          if (controller.signal.aborted) return;
          router.push(target);
        }
        while (
          currentPath.current !== target ||
          (!reduced && !circular && (performance.now() - started < 1120 || prepared.current !== id))
        ) {
          if (performance.now() - started > 10000) throw new Error('Route did not become ready');
          await pause(circular ? 16 : 30, controller.signal);
        }
        if (!reduced) {
          if (circular) {
            // Match the visible cover phase, including its route-ready hold, on the way out.
            const duration = Math.max(250, Math.round(performance.now() - circleStarted.current));
            await playCircle('circle-reveal', duration);
          } else {
            setTransition({ id, target, phase: 'shatter' });
            await pause(1250, controller.signal);
          }
        }
        if (controller.signal.aborted) return;
        setTransition(null);
        running.current = null;
        requestAnimationFrame(() => {
          if (sequence.current !== id) return;
          const main = document.querySelector<HTMLElement>('main');
          main?.setAttribute('tabindex', '-1');
          main?.focus({ preventScroll: true });
        });
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
    overlay.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previous;
    };
  }, [transitioning]);

  function cancel() {
    running.current?.abort();
    running.current = null;
    setTransition(null);
    requestAnimationFrame(() => lastFocus.current?.focus({ preventScroll: true }));
  }

  return (
    <Context.Provider
      value={{
        navigate: (href, origin) => {
          void begin(href, false, origin);
        },
        motionOff,
        circleTarget: transition?.phase.startsWith('circle-') ? transition.target : null,
        setMotionOff,
      }}
    >
      <div
        inert={!!transition}
        className="page-stage"
        data-transition={transition?.phase.startsWith('circle-') ? 'circle' : undefined}
      >
        {children}
      </div>
      {transition && (
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
              onStart={() => {
                if (circleStep.current?.id !== transition.id) return;
                if (transition.phase === 'circle-cover') circleStarted.current = performance.now();
                else {
                  const duration = Math.max(
                    250,
                    Math.round(performance.now() - circleStarted.current),
                  );
                  setTransition((current) =>
                    current?.id === transition.id && current.phase === 'circle-reveal'
                      ? { ...current, duration }
                      : current,
                  );
                }
              }}
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
};
export const TransitionLink = forwardRef<HTMLAnchorElement, TransitionLinkProps>(
  function TransitionLink({ href, onClick, ...props }, ref) {
    const { navigate } = usePageTransition();
    const origin = useRef<TransitionOrigin | undefined>(undefined);
    return (
      <Link
        {...props}
        ref={ref}
        href={href}
        onClick={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          origin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
          onClick?.(event);
        }}
        onNavigate={(event) => {
          if (href in chapters) {
            event.preventDefault();
            navigate(href, origin.current);
          }
        }}
      />
    );
  },
);
