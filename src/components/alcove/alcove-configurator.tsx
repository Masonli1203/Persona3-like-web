'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import {
  DEFAULT_CONFIG,
  DIMENSIONS,
  FINISHES,
  formatLength,
  formatPrice,
  layoutFor,
  normalizeConfig,
  quoteFor,
  type AlcoveConfig,
} from '@/lib/alcove-config';
import type { SceneController, View } from './alcove-scene';
import s from './alcove.module.css';

const presets = [
  { label: 'Compact', width: 2.4, depth: 2, height: 2.3 },
  { label: 'Studio', width: 3.2, depth: 2.6, height: 2.5 },
  { label: 'Gathering', width: 4.4, depth: 3.2, height: 2.7 },
];

export function AlcoveConfigurator() {
  const [config, setConfig] = useState<AlcoveConfig>(DEFAULT_CONFIG);
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [status, setStatus] = useState<'preview' | 'loading' | 'ready' | 'error'>('preview');
  const [attempt, setAttempt] = useState(0);
  const [view, setView] = useState<View>('perspective');
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<SceneController | null>(null);
  const currentConfig = useRef(config);
  const quote = quoteFor(config);
  const layout = layoutFor(config);

  useEffect(() => {
    currentConfig.current = config;
    controller.current?.update(config);
  }, [config]);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let cancelled = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setStatus('loading');
        import('./alcove-scene')
          .then(({ createAlcoveScene }) => {
            if (cancelled) return;
            const fail = () => {
              controller.current?.dispose();
              controller.current = null;
              if (!cancelled) setStatus('error');
            };
            try {
              controller.current = createAlcoveScene(element, currentConfig.current, fail);
              setStatus('ready');
            } catch {
              fail();
            }
          })
          .catch(() => {
            if (!cancelled) setStatus('error');
          });
      },
      { rootMargin: '160px' },
    );
    observer.observe(element);
    return () => {
      cancelled = true;
      observer.disconnect();
      controller.current?.dispose();
      controller.current = null;
    };
  }, [attempt]);

  const change = (patch: Partial<AlcoveConfig>) =>
    setConfig((previous) => normalizeConfig({ ...previous, ...patch }));
  const changeView = (next: View) => {
    setView(next);
    controller.current?.view(next);
  };
  const ready = status === 'ready';

  return (
    <section
      id="live-demo"
      className={s.configurator}
      aria-label="Alcove interactive product configurator"
    >
      <div className={s.demoHeader}>
        <div>
          <span className="micro">ORIGINAL CONCEPT / 001</span>
          <h2>
            ALCOVE<span> / 01</span>
          </h2>
        </div>
        <span className={`${s.liveBadge} micro`}>
          <i data-ready={ready} />
          {ready ? 'LIVE 3D' : status === 'loading' ? 'LOADING 3D' : 'MODEL PREVIEW'}
        </span>
      </div>
      <div className={s.workspace}>
        <div className={s.visual}>
          <div className={s.stage} data-light={config.light}>
            <div className={s.stageLabel}>
              <span className="micro">
                ADJUSTABLE
                <br />
                GARDEN ROOM
              </span>
              <span className="micro">
                {String(layout.roofCount).padStart(2, '0')} CANOPY BLADES
              </span>
            </div>
            {!ready && (
              <div className={s.preview}>
                <Image
                  src="/resources/projects/parametric-spaces/alcove.svg"
                  alt="Original Alcove pavilion with a timber canopy, slim metal frame, built-in bench, table, and planter."
                  width={1200}
                  height={900}
                  unoptimized
                  priority
                />
                <div className={s.loadNote} role="status">
                  {status === 'error' ? (
                    <>
                      <p>
                        3D is unavailable in this browser. The image shows the default design;
                        dimensions and estimates still work.
                      </p>
                      <button type="button" onClick={() => setAttempt((value) => value + 1)}>
                        Retry 3D
                      </button>
                    </>
                  ) : (
                    <p>
                      {status === 'loading'
                        ? 'Loading the 3D model…'
                        : 'A live model loads as you reach this section.'}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className={s.canvasHost} ref={host} data-testid="alcove-canvas" />
            <span className={`${s.orbitHint} micro`}>
              {ready
                ? 'DRAG TO ORBIT · SCROLL THE PAGE TO EXPLORE'
                : 'ORIGINAL PORTFOLIO DEMONSTRATION'}
            </span>
          </div>
          <div className={s.toolbar}>
            <div className={s.views} role="group" aria-label="Model view">
              {(['perspective', 'front', 'plan'] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={view === item}
                  disabled={!ready}
                  onClick={() => changeView(item)}
                >
                  {item === 'perspective' ? 'Perspective' : item === 'front' ? 'Front' : 'Top'}
                </button>
              ))}
            </div>
            <div className={s.cameraButtons} role="group" aria-label="Camera controls">
              <button
                type="button"
                disabled={!ready}
                aria-label="Rotate model left"
                onClick={() => controller.current?.rotate(-1)}
              >
                ↶
              </button>
              <button
                type="button"
                disabled={!ready}
                aria-label="Rotate model right"
                onClick={() => controller.current?.rotate(1)}
              >
                ↷
              </button>
              <button
                type="button"
                disabled={!ready}
                aria-label="Zoom out"
                onClick={() => controller.current?.zoom(1)}
              >
                −
              </button>
              <button
                type="button"
                disabled={!ready}
                aria-label="Zoom in"
                onClick={() => controller.current?.zoom(-1)}
              >
                +
              </button>
            </div>
          </div>
          <dl className={s.dimensions} aria-label="Current model dimensions">
            {(Object.keys(DIMENSIONS) as (keyof typeof DIMENSIONS)[]).map((key) => (
              <div key={key}>
                <dt>{DIMENSIONS[key].label}</dt>
                <dd>{formatLength(config[key], units)}</dd>
              </div>
            ))}
            <div>
              <dt>Floor area</dt>
              <dd>{(config.width * config.depth).toFixed(2)} m²</dd>
            </div>
          </dl>
          <p className={s.designNote}>
            An original garden-room concept, designed for this portfolio. The table stays the same
            size as the space around it changes.
          </p>
        </div>
        <div className={s.controls}>
          <div className={s.controlHeader}>
            <h3>Configure Alcove.</h3>
            <button
              type="button"
              className={s.reset}
              onClick={() => {
                setConfig(DEFAULT_CONFIG);
                changeView('perspective');
              }}
            >
              Reset ↺
            </button>
          </div>
          <fieldset className={s.fieldset}>
            <legend>01 / Start with a size</legend>
            <div className={s.presets}>
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  aria-pressed={
                    Math.abs(config.width - preset.width) < 0.01 &&
                    Math.abs(config.depth - preset.depth) < 0.01 &&
                    Math.abs(config.height - preset.height) < 0.01
                  }
                  onClick={() => change(preset)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <div className={s.unitRow}>
              <span>Fine-tune dimensions</span>
              <div role="group" aria-label="Display units">
                <button
                  type="button"
                  aria-pressed={units === 'metric'}
                  onClick={() => setUnits('metric')}
                >
                  m
                </button>
                <button
                  type="button"
                  aria-pressed={units === 'imperial'}
                  onClick={() => setUnits('imperial')}
                >
                  ft / in
                </button>
              </div>
            </div>
            {(Object.keys(DIMENSIONS) as (keyof typeof DIMENSIONS)[]).map((key) => (
              <div className={s.slider} key={key}>
                <label htmlFor={`alcove-${key}`}>
                  {DIMENSIONS[key].label}
                  <output htmlFor={`alcove-${key}`}>{formatLength(config[key], units)}</output>
                </label>
                <input
                  id={`alcove-${key}`}
                  type="range"
                  min={DIMENSIONS[key].min}
                  max={DIMENSIONS[key].max}
                  step={DIMENSIONS[key].step}
                  value={config[key]}
                  aria-valuetext={formatLength(config[key], units)}
                  onChange={(event) => change({ [key]: Number(event.target.value) })}
                />
                <div className={s.rangeLimits}>
                  <span>{formatLength(DIMENSIONS[key].min, units)}</span>
                  <span>{formatLength(DIMENSIONS[key].max, units)}</span>
                </div>
              </div>
            ))}
          </fieldset>
          <fieldset className={s.fieldset}>
            <legend>02 / Canopy and finish</legend>
            <div className={s.slider}>
              <label htmlFor="alcove-angle">
                Canopy opening<output htmlFor="alcove-angle">{config.angle}°</output>
              </label>
              <input
                id="alcove-angle"
                type="range"
                min="0"
                max="65"
                step="1"
                value={config.angle}
                aria-valuetext={`${config.angle} degrees`}
                onChange={(event) => change({ angle: Number(event.target.value) })}
              />
            </div>
            <div className={s.finishRow}>
              <span>Frame finish</span>
              <div role="group" aria-label="Frame finish">
                {(Object.keys(FINISHES) as (keyof typeof FINISHES)[]).map((finish) => (
                  <button
                    key={finish}
                    type="button"
                    className={s.swatch}
                    aria-label={FINISHES[finish].label}
                    title={FINISHES[finish].label}
                    aria-pressed={config.finish === finish}
                    style={{ '--swatch': FINISHES[finish].color } as React.CSSProperties}
                    onClick={() => change({ finish })}
                  >
                    <span />
                  </button>
                ))}
              </div>
            </div>
            <p className={s.finishName}>
              {FINISHES[config.finish].label} frame · warm timber · linen seating
            </p>
          </fieldset>
          <fieldset className={s.fieldset}>
            <legend>03 / Optional accessories</legend>
            <label className={s.option}>
              <input
                type="checkbox"
                checked={config.heater}
                onChange={(event) => change({ heater: event.target.checked })}
              />
              <span>
                <strong>Heater</strong>
                <small>Suspended radiant panel</small>
              </span>
              <span>+{formatPrice(280)}</span>
            </label>
            <label className={s.option}>
              <input
                type="checkbox"
                checked={config.light}
                onChange={(event) => change({ light: event.target.checked })}
              />
              <span>
                <strong>Light</strong>
                <small>Warm linear canopy light</small>
              </span>
              <span>+{formatPrice(160)}</span>
            </label>
          </fieldset>
          <div className={s.quote}>
            <div className={s.quoteHeading}>
              <span>YOUR DEMO ESTIMATE</span>
              <span>USD</span>
            </div>
            <output className={s.total} aria-live="polite" aria-label="Demo price">
              {formatPrice(quote.total)}
            </output>
            <details>
              <summary>
                See the breakdown <span aria-hidden="true">+</span>
              </summary>
              <dl>
                {quote.items
                  .filter((item) => item.amount > 0)
                  .map((item) => (
                    <div key={item.label}>
                      <dt>{item.label}</dt>
                      <dd>{formatPrice(item.amount)}</dd>
                    </div>
                  ))}
              </dl>
            </details>
            <p>
              Illustrative pricing only. Dimensions and accessories update this estimate; this
              concept is not offered for sale.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
