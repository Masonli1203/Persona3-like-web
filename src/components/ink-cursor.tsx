'use client';

import { animate, motion, useMotionValue, useSpring, type MotionValue } from 'framer-motion';
import { useEffect, useState, useSyncExternalStore } from 'react';

const cursorMedia =
  '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';
function subscribeCursorMedia(notify: () => void) {
  const query = window.matchMedia(cursorMedia);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
}
const getCursorMedia = () => window.matchMedia(cursorMedia).matches;
const getServerCursorMedia = () => false;

// Mounted once beside the route stage, so navigation preserves pointer and trail state.
export function InkCursor({ motionOff }: { motionOff: boolean }) {
  const supported = useSyncExternalStore(
    subscribeCursorMedia,
    getCursorMedia,
    getServerCursorMedia,
  );
  return supported && !motionOff ? <CursorLayer /> : null;
}

function TrailStroke({
  x,
  y,
  opacity,
  index,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  opacity: MotionValue<number>;
  index: number;
}) {
  const trailingX = useSpring(x, {
    stiffness: 600 - index * 80,
    damping: 30,
    mass: 0.35 + index * 0.12,
  });
  const trailingY = useSpring(y, {
    stiffness: 600 - index * 80,
    damping: 30,
    mass: 0.35 + index * 0.12,
  });
  return (
    <motion.div className="cursor-trail" style={{ x: trailingX, y: trailingY, opacity }}>
      <span
        style={{
          opacity: 0.7 - index * 0.11,
          transform: `scale(${1 - index * 0.14}) rotate(-25deg)`,
        }}
      />
    </motion.div>
  );
}

function CursorLayer() {
  // The pointer itself has no spring: only the decorative ink strokes lag behind.
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const visibility = useMotionValue(0);
  const trailOpacity = useMotionValue(0);
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    let idle: ReturnType<typeof setTimeout> | undefined;
    let fade: ReturnType<typeof animate> | undefined;
    let visible = false;
    function hide() {
      visible = false;
      visibility.set(0);
      trailOpacity.set(0);
      clearTimeout(idle);
      fade?.stop();
      document.documentElement.classList.remove('ink-cursor-ready');
    }
    function updateInteractive(target: EventTarget | null) {
      const control =
        target instanceof Element
          ? target.closest('a[href], button, summary, input, select, textarea, [role="button"]')
          : null;
      setInteractive(!!control && !control.matches(':disabled, [aria-disabled="true"]'));
    }
    function over(event: globalThis.PointerEvent) {
      if (visible && event.pointerType === 'mouse') updateInteractive(event.target);
    }
    function scroll() {
      if (visible) updateInteractive(document.elementFromPoint(x.get(), y.get()));
    }
    function move(event: globalThis.PointerEvent) {
      if (event.pointerType !== 'mouse') {
        hide();
        return;
      }
      x.set(event.clientX);
      y.set(event.clientY);
      visibility.set(1);
      updateInteractive(event.target);
      clearTimeout(idle);
      fade?.stop();
      // Skip a streak from the old position when entering or restoring focus.
      trailOpacity.set(visible ? 1 : 0);
      visible = true;
      document.documentElement.classList.add('ink-cursor-ready');
      idle = setTimeout(() => {
        fade = animate(trailOpacity, 0, { duration: 0.18 });
      }, 70);
    }
    function hideOnKeyboard(event: KeyboardEvent) {
      if (event.key === 'Tab') hide();
    }
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over, { passive: true });
    window.addEventListener('scroll', scroll, { passive: true, capture: true });
    document.documentElement.addEventListener('pointerleave', hide);
    window.addEventListener('blur', hide);
    window.addEventListener('keydown', hideOnKeyboard);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
      window.removeEventListener('scroll', scroll, true);
      document.documentElement.removeEventListener('pointerleave', hide);
      window.removeEventListener('blur', hide);
      window.removeEventListener('keydown', hideOnKeyboard);
      hide();
    };
  }, [x, y, visibility, trailOpacity]);

  return (
    <div className="cursor-layer" aria-hidden="true">
      {[4, 3, 2, 1, 0].map((index) => (
        <TrailStroke key={index} index={index} x={x} y={y} opacity={trailOpacity} />
      ))}
      <motion.div
        className={`ink-cursor ${interactive ? 'is-interactive' : ''}`}
        style={{ x, y, opacity: visibility }}
      >
        <svg width="30" height="38" viewBox="0 0 30 38">
          <path
            d="M2 2 25 19 16 21 12 33 2 2Z"
            fill="currentColor"
            stroke="#090b11"
            strokeWidth="3"
            strokeLinejoin="miter"
          />
          <path d="m7 9 11 10-6 1" fill="none" stroke="#164bfa" strokeWidth="2" />
        </svg>
      </motion.div>
    </div>
  );
}
