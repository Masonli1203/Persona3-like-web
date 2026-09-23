'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import type { GalleryImage } from '@/data/creativeProjects';
import styles from './creative.module.css';

function PhotoThumbnail({
  image,
  label,
  select,
}: {
  image: GalleryImage;
  label: string;
  select: () => void;
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
      <button type="button" aria-label={label} onClick={select} className={styles.thumbnailButton}>
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

function FullPhoto({ image, neighbors }: { image: GalleryImage; neighbors: GalleryImage[] }) {
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

export function PhotographyGallery({
  images,
  title,
  index,
  select,
}: {
  images: GalleryImage[];
  title: string;
  index: number | null;
  select: (index: number) => void;
}) {
  function step(direction: number) {
    select(((index ?? 0) + direction + images.length) % images.length);
  }
  if (!images.length) return <p className={styles.draft}>Photographs will be added here.</p>;
  return (
    <>
      <div className={styles.photoGrid} hidden={index !== null}>
        {images.map((image, position) => (
          <figure
            key={image.src}
            data-portrait={image.height > image.width}
            data-photo-index={position}
          >
            <PhotoThumbnail
              image={image}
              label={`Enlarge ${title}, image ${position + 1}`}
              select={() => select(position)}
            />
            <figcaption className="micro">{String(position + 1).padStart(2, '0')}</figcaption>
          </figure>
        ))}
      </div>
      {index !== null && (
        <section
          className={styles.photoReader}
          aria-label={`${title} photo viewer`}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              step(-1);
            }
            if (event.key === 'ArrowRight') {
              event.preventDefault();
              step(1);
            }
          }}
        >
          <FullPhoto
            key={images[index].src}
            image={images[index]}
            neighbors={[
              images[(index - 1 + images.length) % images.length],
              images[(index + 1) % images.length],
            ]}
          />
          <div className={styles.lightboxNav}>
            <button autoFocus type="button" onClick={() => step(-1)} disabled={images.length < 2}>
              ← Previous
            </button>
            <p aria-live="polite">
              {title} / {index + 1} of {images.length}
            </p>
            <button type="button" onClick={() => step(1)} disabled={images.length < 2}>
              Next →
            </button>
          </div>
        </section>
      )}
    </>
  );
}
