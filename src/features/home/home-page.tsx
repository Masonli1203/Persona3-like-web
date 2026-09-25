'use client';

import { AnimatePresence, motion, useSpring, useTransform } from 'framer-motion';
import { site } from '@/data/site';
import Image from 'next/image';
import localFont from 'next/font/local';
import { useEffect, useState, useSyncExternalStore, type PointerEvent } from 'react';
import { sections } from '@/data/sections';

import { TransitionLink, usePageTransition } from '../navigation/page-transition';
const MotionLink = motion.create(TransitionLink);
const manifestoFont = localFont({ src: '../../assets/fonts/anton-regular.ttf', display: 'swap' });

const manifestoCopy = [
  ['ALWAYS', 'CURIOUS.'],
  ['ALWAYS IN', 'MOTION.'],
] as const;

function Manifesto({ animated }: { animated: boolean }) {
  const lines = [...manifestoCopy[0], ...manifestoCopy[1]];
  const state = 'default';
  return (
    <div
      className={`manifesto-stage ${manifestoFont.className}`}
      data-state={state}
      data-animated={animated}
    >
      <span className="sr-only">{lines.join(' ')}</span>
      <AnimatePresence initial={false} mode="sync">
        <motion.svg
          key={state}
          className="manifesto-art"
          viewBox="0 0 520 292"
          aria-hidden="true"
          focusable="false"
          initial={animated ? { opacity: 0, x: -24, clipPath: 'inset(0 100% 0 0)' } : false}
          animate={{ opacity: 1, x: 0, clipPath: 'inset(0 0% 0 0)' }}
          exit={animated ? { opacity: 0, x: 32, clipPath: 'inset(0 0 0 100%)' } : { opacity: 0 }}
          transition={{ duration: animated ? 0.28 : 0, ease: [0.16, 1, 0.3, 1] }}
        >
          <defs>
            <clipPath id={`slice-top-${state}`}>
              <rect width="520" height="75" />
            </clipPath>
            <clipPath id={`slice-bottom-${state}`}>
              <rect y="79" width="520" height="61" />
            </clipPath>
          </defs>
          {lines.map((line, index) => {
            const sliced = index % 2 === 1;
            const length = line === 'ALWAYS' ? 330 : line === 'ALWAYS IN' ? 415 : 420;
            const text = (
              <text x="38" y="127" textLength={length} lengthAdjust="spacingAndGlyphs">
                {line}
              </text>
            );
            return (
              <svg
                key={`${line}-${index}`}
                x="0"
                y={(index * 292) / lines.length}
                width="520"
                height={292 / lines.length}
                viewBox="0 0 520 140"
                preserveAspectRatio="none"
                overflow="visible"
                className={`manifesto-row ${sliced ? 'is-sliced' : ''}`}
                style={{ animationDelay: `${index * 35}ms` }}
              >
                {sliced ? (
                  <>
                    <g clipPath={`url(#slice-top-${state})`}>
                      <g className="slice-upper">{text}</g>
                    </g>
                    <g clipPath={`url(#slice-bottom-${state})`}>
                      <g className="slice-lower">{text}</g>
                    </g>
                    <g className="slice-ticks">
                      <path d={`M0 64h23 M24 76h22 M${length + 47} 88h26 M${length + 82} 102h22`} />
                    </g>
                  </>
                ) : (
                  text
                )}
              </svg>
            );
          })}
        </motion.svg>
      </AnimatePresence>
    </div>
  );
}

function subscribeReducedMotion(notify: () => void) {
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
}
const getReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const spring = { stiffness: 520, damping: 32, mass: 0.45 };
const buttonSpring = { stiffness: 240, damping: 30, mass: 0.9 };

function SectionLink({
  section,
  selected,
  enabled,
}: {
  section: (typeof sections)[number];
  selected: boolean;
  enabled: boolean;
}) {
  const x = useSpring(0, buttonSpring);
  const y = useSpring(0, buttonSpring);
  function move(event: PointerEvent<HTMLAnchorElement>) {
    if (!enabled || event.pointerType !== 'mouse') return;
    const rect = event.currentTarget.parentElement!.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.045);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.065);
  }
  useEffect(() => {
    if (!enabled) {
      x.jump(0);
      y.jump(0);
    }
  }, [enabled, x, y]);
  return (
    <MotionLink
      href={`/${section.id}`}
      pressFeedback
      style={{ x, y }}
      className={`section-link ${selected ? 'selected' : ''}`}
      onPointerMove={move}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
      aria-controls="section-preview"
    >
      <span className="ink-speed-lines" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="section-number">{section.number}</span>
      <span className="section-type">
        <span className="section-title" data-press-label>
          {section.title}
        </span>
        <span className="section-subtitle">{section.subtitle}</span>
      </span>
      <span className="section-arrow" aria-hidden="true">
        ↗
      </span>
    </MotionLink>
  );
}

export function HomePage() {
  const [{ index: previewIndex, direction }, setPreview] = useState({ index: 0, direction: 1 });
  const selectPreview = (index: number) =>
    setPreview((previous) =>
      previous.index === index ? previous : { index, direction: index > previous.index ? 1 : -1 },
    );
  const { motionOff, setMotionOff } = usePageTransition();
  const [finePointer, setFinePointer] = useState(false);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const reduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => true);
  const enabled = finePointer && !reduced && !motionOff;
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);
  // Share one spring-driven pointer signal; title rotation is stronger than translation.
  const titleX = useTransform(x, (value) => value * 0.3);
  const titleY = useTransform(y, (value) => value * 0.3);
  const rotateY = useTransform(x, [-21, 21], [-14, 14]);
  const rotateX = useTransform(y, [-15, 15], [9, -9]);
  const rotateZ = useTransform(x, [-21, 21], [-2.5, 2.5]);
  const reverseX = useTransform(x, (value) => value * -0.5);
  const reverseY = useTransform(y, (value) => value * -0.5);
  const backdropX = useTransform(x, [-21, 21], [8, -8]);
  const backdropY = useTransform(y, [-15, 15], [5, -5]);
  const emphasized = enabled ? (hovered ?? (focused === previewIndex ? focused : null)) : null;
  // Content still responds to focus/hover when motion is disabled.

  useEffect(() => {
    const query = window.matchMedia('(hover: hover) and (pointer: fine)');
    const update = () => setFinePointer(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!enabled) {
      x.jump(0);
      y.jump(0);
    }
  }, [enabled, x, y]);

  function move(event: PointerEvent<HTMLElement>) {
    if (!enabled || event.pointerType !== 'mouse') return;
    x.set((event.clientX / window.innerWidth - 0.5) * 42);
    y.set((event.clientY / window.innerHeight - 0.5) * 30);
  }

  return (
    <main
      id="main"
      className={`portfolio ${enabled ? 'pointer-enhanced' : ''}`}
      onPointerMove={move}
      onPointerLeave={() => {
        setHovered(null);
        x.set(0);
        y.set(0);
      }}
    >
      <a href="#section-navigation" className="skip-link">
        Skip to navigation
      </a>
      <div className="index-backdrop" aria-hidden="true">
        <motion.div className="index-artwork-plane" style={{ x: backdropX, y: backdropY }}>
          <Image
            src={site.heroArtwork}
            alt=""
            fill
            preload
            unoptimized
            sizes="100vw"
            className="index-artwork"
          />
        </motion.div>
      </div>
      <div className="blue-field" aria-hidden="true" />
      <div className="diagonal-line" aria-hidden="true" />
      <header className="masthead flex items-center justify-between">
        <a href="#main" className="wordmark" aria-label={`${site.name} home`}>
          {site.initials}
          <span>↗</span>
        </a>
        <button
          className="motion-toggle"
          onClick={() => setMotionOff((v) => !v)}
          aria-pressed={!motionOff && !reduced}
          disabled={!!reduced}
        >
          <span className={!motionOff && !reduced ? 'status-dot' : 'status-dot off'} />
          MOTION {motionOff || reduced ? 'OFF' : 'ON'}
        </button>
      </header>

      <div className="hero-grid">
        <section className="identity" aria-labelledby="name">
          <div className="eyebrow">
            <span className="tiny-cross" aria-hidden="true">
              +
            </span>{' '}
            {site.label}
          </div>
          <motion.div
            style={{
              x: titleX,
              y: titleY,
              rotateX,
              rotateY,
              rotateZ,
              transformPerspective: 1400,
              transformOrigin: '50% 65%',
            }}
            className="name-wrap"
          >
            <h1 id="name">
              {site.nameLines[0]}{' '}
              <span>
                {site.nameLines[1]}
                <span className="name-period">.</span>
              </span>
            </h1>
          </motion.div>
          <div className="intro">
            <div>
              <h2>{site.role}</h2>
              <p>{site.disciplines.join(' · ')}</p>
            </div>
          </div>
          <motion.div style={{ x: reverseX, y: reverseY }} className="media-frame manifesto-frame">
            <Manifesto animated={!reduced && !motionOff} />
          </motion.div>
        </section>

        <section className="explore" aria-label="Explore portfolio">
          <nav
            id="section-navigation"
            className={`section-menu ${emphasized !== null ? 'has-emphasis' : ''}`}
            aria-label="Homepage section previews"
            onPointerLeave={() => setHovered(null)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setFocused(null);
            }}
          >
            {sections.map((item, index) => (
              <div
                key={item.id}
                className={`section-slot ${emphasized === index ? 'is-emphasized' : ''}`}
                onPointerEnter={(event) => {
                  if (event.pointerType === 'mouse') {
                    setHovered(index);
                    selectPreview(index);
                  }
                }}
                onFocus={() => {
                  setFocused(index);
                  selectPreview(index);
                }}
              >
                <SectionLink section={item} selected={previewIndex === index} enabled={enabled} />
              </div>
            ))}
          </nav>
          <div
            id="section-preview"
            className="section-preview"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="sr-only">
              {sections[previewIndex].headline} {sections[previewIndex].description}
            </span>
            <div className="section-preview-copy" aria-hidden="true">
              {sections.map((item) => (
                <div key={item.id} className="section-preview-measure" aria-hidden="true">
                  <h2>{item.headline}</h2>
                  <p>{item.description}</p>
                </div>
              ))}
              <AnimatePresence initial={false} custom={direction} mode="sync">
                <motion.div
                  key={previewIndex}
                  className="section-preview-slide"
                  custom={direction}
                  variants={{
                    enter: (d: number) => ({ x: d * 80, opacity: 0 }),
                    center: { x: 0, opacity: 1 },
                    exit: (d: number) => ({ x: -d * 80, opacity: 0 }),
                  }}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    duration: reduced || motionOff ? 0 : 0.3,
                    ease: [0.22, 0.68, 0.2, 1],
                  }}
                >
                  <h2>{sections[previewIndex].headline}</h2>
                  <p>{sections[previewIndex].description}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </section>
      </div>
      <footer className="footer flex items-center justify-between">
        <span>
          © {site.copyrightYear} {site.name}
        </span>
        <span className="footer-manifesto">{site.location}</span>
      </footer>
    </main>
  );
}
