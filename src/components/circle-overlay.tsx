'use client';

import { useId } from 'react';

export type CirclePhase = 'circle-cover' | 'circle-reveal';
export type CircleGeometry = {
  x: number;
  y: number;
  radius: number;
  width: number;
  height: number;
};

export function CircleOverlay({
  phase,
  circle,
  duration,
  onStart,
  onComplete,
}: {
  phase: CirclePhase;
  circle: CircleGeometry;
  duration: number;
  onStart: () => void;
  onComplete: () => void;
}) {
  const id = `chapter-circle-${useId().replace(/:/g, '')}`;
  const covering = phase === 'circle-cover';
  return (
    <svg
      key={phase}
      className="chapter-circle-surface"
      viewBox={`0 0 ${circle.width} ${circle.height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      onAnimationStart={(event) => {
        if (event.animationName === 'chapter-circle-grow') onStart();
      }}
      onAnimationEnd={(event) => {
        if (event.animationName === 'chapter-circle-grow') onComplete();
      }}
    >
      <defs>
        {/* Keep the colors anchored to the screen in both phases, independently of the growing circle. */}
        <radialGradient id={`${id}-color`} cx="50%" cy="50%" r="70%">
          <stop offset="0" stopColor="var(--circle-center)" />
          <stop offset=".58" stopColor="var(--circle-mid)" />
          <stop offset="1" stopColor="var(--circle-edge)" />
        </radialGradient>
        <mask
          id={`${id}-mask`}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width={circle.width}
          height={circle.height}
        >
          <rect width={circle.width} height={circle.height} fill={covering ? 'black' : 'white'} />
          <circle
            className="chapter-circle-disc"
            cx={circle.x}
            cy={circle.y}
            r={circle.radius}
            style={{
              animationDuration: `${duration}ms`,
              transformOrigin: `${circle.x}px ${circle.y}px`,
            }}
            fill={covering ? 'white' : 'black'}
          />
        </mask>
      </defs>
      <rect
        width={circle.width}
        height={circle.height}
        fill={`url(#${id}-color)`}
        mask={`url(#${id}-mask)`}
      />
    </svg>
  );
}
