'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { creativeCatalog, type CreativeCategory } from '@/data/creativeProjects';
import { usePageTransition } from '@/components/page-transition';
import { CreativeVisual } from './creative-visual';
import { CreativeViewingSession, CreativeWorkLink } from './viewing-session';
import styles from './creative.module.css';

function PreviewClip({ src, stop }: { src: string; stop: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    void video.play().catch(stop);
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) stop();
    });
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, [stop]);
  return (
    <video
      ref={ref}
      className={styles.previewClip}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      onError={stop}
    />
  );
}

export function CreativeCategoryGallery({ category }: { category: CreativeCategory }) {
  const works = creativeCatalog.worksInCategory(category);
  const [preview, setPreview] = useState<string | null>(null);
  const stop = useCallback(() => setPreview(null), []);
  const { motionOff } = usePageTransition();
  useEffect(() => {
    const query = window.matchMedia(
      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
    );
    document.addEventListener('visibilitychange', stop);
    query.addEventListener('change', stop);
    return () => {
      document.removeEventListener('visibilitychange', stop);
      query.removeEventListener('change', stop);
    };
  }, [stop]);
  return (
    <CreativeViewingSession category={category}>
      {(viewing) => (
        <div className={styles.projectList}>
          {works.map((project) => (
            <article key={project.slug} className={styles.project}>
              <CreativeWorkLink
                slug={project.slug}
                onOpen={stop}
                className={styles.projectLink}
                onPointerEnter={() => {
                  if (
                    !motionOff &&
                    window.matchMedia(
                      '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
                    ).matches
                  )
                    setPreview(project.slug);
                }}
                onPointerLeave={stop}
                onBlur={stop}
              >
                <div className={styles.projectMedia}>
                  <CreativeVisual
                    title={project.title}
                    category={project.category}
                    coverImage={project.coverImage}
                  />
                  {!viewing &&
                    !motionOff &&
                    preview === project.slug &&
                    project.mediaType === 'mux-video' &&
                    project.previewVideo && <PreviewClip src={project.previewVideo} stop={stop} />}
                  <span className={styles.openHint}>
                    {project.mediaType === 'gallery' ? 'View series' : 'Click to view details'}
                  </span>
                </div>
                <div className={styles.caption}>
                  <h2>{project.title}</h2>
                  <span className="micro">
                    {project.mediaType === 'gallery'
                      ? `${project.gallery.length} photographs`
                      : project.subtitle}
                  </span>
                </div>
              </CreativeWorkLink>
            </article>
          ))}
        </div>
      )}
    </CreativeViewingSession>
  );
}
