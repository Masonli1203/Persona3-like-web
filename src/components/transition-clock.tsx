'use client';

import { useEffect, useId, useMemo, useRef, useSyncExternalStore, type CSSProperties } from 'react';
import { makeGlassShards } from './glass-geometry';
import { site } from '@/data/site';
import { boundShard, prepareGlassSprites } from './glass-sprites';

function subscribeViewport(notify: () => void) {
  window.addEventListener('resize', notify);
  return () => window.removeEventListener('resize', notify);
}
const getViewport = () => `${window.innerWidth}:${window.innerHeight}`;

function ClockFace({ spinning, labelSize }: { spinning: boolean; labelSize: number }) {
  return (
    <>
      <circle
        cx="200"
        cy="200"
        r="198"
        fill="none"
        stroke="var(--glass-muted)"
        strokeOpacity=".18"
      />
      <circle cx="200" cy="200" r="178" fill="var(--glass-dial)" stroke="var(--glass-muted)" />
      <circle cx="200" cy="200" r="167" fill="none" stroke="var(--glass-light)" strokeWidth="1.4" />
      <circle
        cx="200"
        cy="200"
        r="139"
        fill="none"
        stroke="var(--glass-muted)"
        strokeOpacity=".35"
      />
      {Array.from({ length: 60 }, (_, i) => (
        <line
          key={i}
          x1="200"
          y1="38"
          x2="200"
          y2={i % 5 === 0 ? 51 : 44}
          stroke={i % 5 === 0 ? 'var(--glass-light)' : 'var(--glass-muted)'}
          strokeWidth={i % 5 === 0 ? 2 : 1}
          transform={`rotate(${i * 6} 200 200)`}
        />
      ))}
      <g fill="var(--glass-light)" fontFamily="Georgia, serif" fontSize="21" textAnchor="middle">
        <text x="200" y="83">
          XII
        </text>
        <text x="326" y="207">
          III
        </text>
        <text x="200" y="330">
          VI
        </text>
        <text x="76" y="207">
          IX
        </text>
      </g>
      <text
        x="200"
        y="266"
        fill="var(--glass-muted)"
        fontFamily="monospace"
        fontSize={labelSize}
        textAnchor="middle"
        letterSpacing="3"
      >
        BETWEEN CHAPTERS
      </text>
      <g
        className={spinning ? 'clock-hand-sweep' : undefined}
        style={{ transformOrigin: '200px 200px' }}
      >
        <path d="M200 66 204 187 200 215 196 187Z" fill="var(--glass-light)" />
        <path d="m200 100 6 90-6 15-6-15Z" fill="var(--glass-accent)" />
      </g>
      <circle cx="200" cy="200" r="5" fill="var(--glass-light)" />
    </>
  );
}

export function ClockOverlay({
  phase,
  chapter,
  onReady,
}: {
  phase: 'clock' | 'shatter';
  chapter: string;
  onReady: () => void;
}) {
  const id = useId().replace(/:/g, '');
  const [width, height] = useSyncExternalStore(subscribeViewport, getViewport, () => '1440:900')
    .split(':')
    .map(Number);
  const shards = useMemo(() => makeGlassShards(width, height).map(boundShard), [width, height]);
  const svg = useRef<SVGSVGElement>(null);
  const layers = useRef<HTMLDivElement>(null);
  const canvases = useRef<(HTMLCanvasElement | null)[]>([]);
  const breaking = phase === 'shatter';
  const dialSize = Math.min(Math.min(width, height) * (width <= 600 ? 0.82 : 0.62), 520);
  const textSize = Math.max(13, Math.min(width * 0.009, 24));

  useEffect(() => {
    const controller = new AbortController();
    const layer = layers.current;
    if (!svg.current || !layer) return;
    layer.dataset.ready = 'false';
    void prepareGlassSprites(
      svg.current,
      canvases.current.filter((c): c is HTMLCanvasElement => !!c),
      shards,
      width,
      height,
      controller.signal,
    )
      .then(() => {
        if (!controller.signal.aborted) layer.dataset.ready = 'true';
      })
      .catch(() => {
        /* A short fade remains available if this browser cannot rasterize SVG. */
      })
      .finally(() => {
        if (!controller.signal.aborted) onReady();
      });
    return () => controller.abort();
  }, [width, height, shards, onReady]);

  return (
    <div className="glass-layers" ref={layers}>
      <svg
        ref={svg}
        className="glass-viewport"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`${id}-backdrop`} cx="50%" cy="45%" r="75%">
            <stop offset="0" stopColor="var(--glass-glow)" />
            <stop offset=".55" stopColor="var(--glass-dark)" />
            <stop offset="1" stopColor="var(--glass-black)" />
          </radialGradient>
          {/* Every shard samples this same complete surface: background, clock, and labels. */}
          <g id={`${id}-surface`} className="glass-surface">
            <rect width={width} height={height} fill={`url(#${id}-backdrop)`} />
            <g
              transform={`translate(${(width - dialSize) / 2} ${(height - dialSize) / 2}) scale(${dialSize / 400})`}
            >
              <ClockFace
                spinning={!breaking}
                labelSize={(Math.max(12, textSize * 0.8) * 400) / dialSize}
              />
            </g>
            <g
              fontFamily="monospace"
              fontSize={textSize}
              letterSpacing="2"
              fill="var(--glass-muted)"
            >
              <text x={width * 0.08} y={height * 0.09}>
                {site.initials} / {width <= 600 ? 'TRANSITION' : 'CHAPTER TRANSITION'}
              </text>
              <text
                x={width * 0.92}
                y={height * 0.09}
                textAnchor="end"
                fill="var(--glass-light)"
                fontSize={textSize * 1.45}
              >
                00:00
              </text>
            </g>
            <text
              x={width / 2}
              y={height * 0.87}
              textAnchor="middle"
              fontFamily="monospace"
              fontSize={textSize * 1.05}
              letterSpacing="2"
              fill="var(--glass-muted)"
            >
              ENTERING{' '}
              <tspan
                fontFamily="Arial, sans-serif"
                fontWeight="700"
                fontSize={textSize * 1.5}
                fill="var(--glass-light)"
              >
                {chapter} ↗
              </tspan>
            </text>
          </g>
        </defs>
        <use href={`#${id}-surface`} className="glass-intact" />
      </svg>
      <div className="glass-shards" aria-hidden="true">
        {shards.map((shard, i) => (
          <canvas
            key={i}
            ref={(el) => {
              canvases.current[i] = el;
            }}
            className="glass-shard"
            style={
              {
                left: shard.left,
                top: shard.top,
                width: shard.width,
                height: shard.height,
                transformOrigin: `${shard.centerX - shard.left}px ${shard.centerY - shard.top}px`,
                '--drift-x': `${shard.driftX}px`,
                '--drift-y': `${shard.driftY}px`,
                '--drift-spin': `${shard.spin * 0.02}deg`,
                '--flight-x': `${shard.x}px`,
                '--flight-y': `${shard.y}px`,
                '--flight-spin': `${shard.spin}deg`,
                '--delay': `${160 + shard.delay * 1000}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <span className="sr-only" role="status">
        Opening {chapter.toLowerCase()}.
      </span>
    </div>
  );
}
