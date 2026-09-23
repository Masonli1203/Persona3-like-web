'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { sections } from '@/data/sections';
import { usePageTransition } from './page-transition';
import { CircleOverlay, type CircleGeometry, type CirclePhase } from './circle-overlay';
import { playPressFeedback, PRESS_FEEDBACK_MS } from './press-feedback';
import s from '@/app/(modules)/projects/interface-study/persona.module.css';

const section = sections[0];
const COVER_MS = 420;
const REVEAL_MS = 420;

export function PersonaPressDemo() {
  const { motionOff } = usePageTransition();
  const stage = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | null>(null);
  const pressTimer = useRef<number | null>(null);
  const fallback = useRef<number | null>(null);
  const running = useRef(false);
  const sequence = useRef(0);
  const [activated, setActivated] = useState(false);
  const [phase, setPhase] = useState<'idle' | 'press' | CirclePhase>('idle');
  const [circle, setCircle] = useState<CircleGeometry | null>(null);

  const finish = useCallback(() => {
    sequence.current++;
    running.current = false;
    animation.current?.cancel();
    if (pressTimer.current !== null) window.clearTimeout(pressTimer.current);
    pressTimer.current = null;
    if (fallback.current !== null) window.clearTimeout(fallback.current);
    fallback.current = null;
    setPhase('idle');
  }, []);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stopForPreference = () => {
      if (preference.matches) finish();
    };
    preference.addEventListener('change', stopForPreference);
    window.addEventListener('resize', finish);
    return () => {
      sequence.current = -1;
      animation.current?.cancel();
      if (pressTimer.current !== null) window.clearTimeout(pressTimer.current);
      if (fallback.current !== null) window.clearTimeout(fallback.current);
      preference.removeEventListener('change', stopForPreference);
      window.removeEventListener('resize', finish);
    };
  }, [finish]);
  useEffect(() => {
    if (!motionOff) return;
    const frame = window.requestAnimationFrame(finish);
    return () => window.cancelAnimationFrame(frame);
  }, [motionOff, finish]);

  function play(button: HTMLButtonElement) {
    if (running.current || !stage.current) return;
    setActivated(true);
    if (motionOff || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Use the stable hit area, not the tilted face, as the origin of the local wipe.
    const bounds = stage.current.getBoundingClientRect();
    const control = button.getBoundingClientRect();
    const x = control.left + control.width / 2 - bounds.left;
    const y = control.top + control.height / 2 - bounds.top;
    const radius = Math.hypot(Math.max(x, bounds.width - x), Math.max(y, bounds.height - y)) + 2;
    setCircle({ x, y, radius, width: bounds.width, height: bounds.height });
    const id = ++sequence.current;
    running.current = true;
    setPhase('press');
    animation.current = playPressFeedback(button);
    // Also release the control if the tab suspends an animation.
    fallback.current = window.setTimeout(finish, PRESS_FEEDBACK_MS + COVER_MS + REVEAL_MS + 5000);
    // The chapter navigation uses the same short press hold before its mask mounts.
    pressTimer.current = window.setTimeout(() => {
      if (sequence.current !== id) return;
      pressTimer.current = null;
      animation.current?.cancel();
      setPhase('circle-cover');
    }, PRESS_FEEDBACK_MS);
  }

  return (
    <div ref={stage} className={s.pressStage} data-demo-phase={phase}>
      <div className={`${s.stageLabel} micro`}>
        <span>INTERACTION SAMPLE</span>
        <span>TRY IT</span>
      </div>
      <button
        className={s.pressButton}
        type="button"
        aria-label="Try the Creative button and circle transition"
        aria-disabled={phase !== 'idle'}
        data-press-feedback="true"
        data-engaged={phase !== 'idle'}
        onClick={(event) => play(event.currentTarget)}
      >
        <span className={s.pressFace}>
          <span className={s.pressInk} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className={`${s.pressNumber} micro`}>{section.number}</span>
          <span className={s.pressType}>
            <span className={s.pressText} data-press-label>
              {section.title}
            </span>
            <span className={`${s.pressCaption} micro`}>{section.subtitle}</span>
          </span>
        </span>
      </button>
      <p className={`${s.pressStatus} micro`} role="status">
        {phase !== 'idle'
          ? 'PLAYING THE TRANSITION'
          : activated
            ? 'READY / TRY IT AGAIN'
            : 'HOVER TO SELECT / CLICK TO PLAY'}
      </p>
      {circle && (phase === 'circle-cover' || phase === 'circle-reveal') && (
        <div className={s.pressCircle} aria-hidden="true">
          {/* Reuse both chapter masks: an expanding cover, then an expanding clear window. */}
          <CircleOverlay
            phase={phase}
            circle={circle}
            duration={phase === 'circle-cover' ? COVER_MS : REVEAL_MS}
            onStart={() => {}}
            onComplete={() => {
              if (!running.current) return;
              if (phase === 'circle-cover') setPhase('circle-reveal');
              else finish();
            }}
          />
        </div>
      )}
    </div>
  );
}
