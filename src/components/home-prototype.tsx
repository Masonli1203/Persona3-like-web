'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useState, useSyncExternalStore, type PointerEvent } from 'react';
import { sections } from '@/data/sections';
import { site } from '@/data/site';

import { TransitionLink, usePageTransition } from './page-transition';
const MotionLink = motion.create(TransitionLink);

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
        <span className="section-title">{section.title}</span>
        <span className="section-subtitle">{section.subtitle}</span>
      </span>
      <span className="section-arrow" aria-hidden="true">
        ↗
      </span>
    </MotionLink>
  );
}

export function HomePrototype() {
  const [previewIndex, setPreviewIndex] = useState(0);
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
  const section = sections[previewIndex];

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
        Skip to exploration
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
        <a href="#main" className="wordmark" aria-label={site.name + ' home'}>
          {site.initials}
          <span>↗</span>
        </a>
        <span className="edition">
          PERSONAL PORTFOLIO <span>/</span> VOL. 01
        </span>
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
            BETWEEN ART & TECHNOLOGY
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
            <span className="vertical-label">{site.label.toUpperCase()}</span>
          </motion.div>
          <div className="intro">
            <span className="intro-mark" aria-hidden="true">
              ↳
            </span>
            <div>
              <h2>{site.role}</h2>
              <p>{site.disciplines.join(' · ')}</p>
            </div>
          </div>
          <motion.div style={{ x: reverseX, y: reverseY }} className="media-frame">
            <div className="media-top">
              <span>{section.tag}</span>
              <span aria-hidden="true">↗</span>
            </div>
            <div className="media-center">
              <span className="frame-cross" aria-hidden="true">
                +
              </span>
              <span>
                MEDIA
                <br />
                <strong>COMING SOON</strong>
              </span>
              <span className="frame-cross" aria-hidden="true">
                +
              </span>
            </div>
            <div className="media-bottom">
              <span>{section.medium}</span>
              <span>16:9</span>
            </div>
          </motion.div>
        </section>

        <section className="explore" aria-label="Explore portfolio">
          <div className="explore-heading">
            <span>SELECT YOUR DIRECTION</span>
            <span aria-hidden="true">↓</span>
          </div>
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
                    setPreviewIndex(index);
                  }
                }}
                onFocus={() => {
                  setFocused(index);
                  setPreviewIndex(index);
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
            <div className="preview-meta">
              <span>0{previewIndex + 1} / EXPLORE</span>
              <span>HOMEPAGE PREVIEW</span>
            </div>
            <h2>{section.headline}</h2>
            <p>{section.description}</p>
            <span className="preview-note">Select a chapter to explore.</span>
          </div>
        </section>
      </div>
      <footer className="footer flex items-center justify-between">
        <span>
          © {site.copyrightYear} {site.name.toUpperCase()}
        </span>
        <span className="footer-manifesto">ALWAYS CURIOUS. ALWAYS IN MOTION.</span>
        <span className="footer-index">
          INDEX <span>001 — 003</span>
        </span>
      </footer>
    </main>
  );
}
