'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type Ref } from 'react';
import type { GalleryImage } from '@/data/creative';
import styles from './creative.module.css';

export function PhotoThumbnail({
  image,
  label,
  select,
  buttonRef,
}: {
  image: GalleryImage;
  label: string;
  select: () => void;
  buttonRef: Ref<HTMLButtonElement>;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { root: element.closest('dialog'), rootMargin: '500px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={frame}
      className={styles.thumbnailFrame}
      style={{ aspectRatio: `${image.width}/${image.height}` }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        onClick={select}
        className={styles.thumbnailButton}
      >
        {near && (
          <Image
            key={attempt}
            src={image.thumbnail + (attempt ? `?retry=${attempt}` : '')}
            alt={image.alt}
            fill
            unoptimized
            loading="eager"
            onLoad={() => setStatus('ready')}
            onError={() => setStatus('error')}
          />
        )}
        {status === 'loading' && <span className={styles.photoLoading}>Loading photo…</span>}
        {status === 'ready' && (
          <span className={styles.photoHint} aria-hidden="true">
            Enlarge +
          </span>
        )}
      </button>
      {status === 'error' && (
        <div className={styles.photoError}>
          <span>Photo could not load.</span>
          <button
            type="button"
            onClick={() => {
              setStatus('loading');
              setAttempt((value) => value + 1);
            }}
          >
            Retry thumbnail
          </button>
        </div>
      )}
    </div>
  );
}

export function FullPhoto({
  image,
  neighbors,
}: {
  image: GalleryImage;
  neighbors: GalleryImage[];
}) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  // Wait for the selected photo before spending bandwidth on adjacent photos.
  const previous = neighbors[0]?.src;
  const next = neighbors[1]?.src;
  useEffect(() => {
    if (status !== 'ready') return;
    const preloads = [...new Set([previous, next])]
      .filter((src): src is string => !!src && src !== image.src)
      .map((src) => {
        const preload = new window.Image();
        preload.decoding = 'async';
        preload.src = src;
        return preload;
      });
    return () => {
      preloads.forEach((preload) => {
        preload.onload = null;
        preload.onerror = null;
      });
    };
  }, [status, previous, next, image.src]);
  return (
    <div className={styles.fullPhoto} aria-busy={status === 'loading'}>
      <Image
        src={image.thumbnail}
        alt=""
        fill
        unoptimized
        loading="eager"
        className={styles.photoUnderlay}
      />
      <Image
        key={attempt}
        src={image.src + (attempt ? `?retry=${attempt}` : '')}
        alt={image.alt}
        fill
        unoptimized
        loading="eager"
        className={styles.photoFull}
        style={{ opacity: status === 'ready' ? 1 : 0 }}
        onLoad={() => setStatus('ready')}
        onError={() => setStatus('error')}
      />
      {status !== 'ready' && (
        <div className={styles.photoStatus} role="status">
          {status === 'loading' ? (
            'Loading full photo…'
          ) : (
            <>
              <span>Full photo could not load.</span>
              <button
                type="button"
                onClick={() => {
                  setStatus('loading');
                  setAttempt((value) => value + 1);
                }}
              >
                Retry full photo
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
