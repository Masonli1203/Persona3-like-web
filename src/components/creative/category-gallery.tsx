'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { creativeProjects, type CreativeCategory } from '@/data/creativeProjects';
import { usePageTransition } from '@/components/page-transition';
import { CreativeVisual } from './creative-visual';
import { WorkViewer } from './work-viewer';
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const works = creativeProjects.filter((project) => project.category === category);
  const selected = works.find((project) => project.slug === searchParams.get('work'));
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
  function close() {
    if (window.history.state?.creativeViewer === selected?.slug) window.history.back();
    else window.history.replaceState(null, '', pathname);
  }
  return (
    <>
      <div className={styles.projectList}>
        {works.map((project) => (
          <article key={project.slug} className={styles.project}>
            <a
              href={`${pathname}?work=${project.slug}`}
              className={styles.projectLink}
              aria-haspopup="dialog"
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
              onClick={(event) => {
                if (
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey ||
                  event.button !== 0
                )
                  return;
                event.preventDefault();
                stop();
                event.currentTarget.focus({ preventScroll: true });
                window.history.pushState(
                  { creativeViewer: project.slug },
                  '',
                  `${pathname}?work=${project.slug}`,
                );
              }}
            >
              <div className={styles.projectMedia}>
                <CreativeVisual
                  title={project.title}
                  category={project.category}
                  coverImage={project.coverImage}
                />
                {!selected &&
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
            </a>
          </article>
        ))}
      </div>
      {selected && <WorkViewer key={selected.slug} project={selected} close={close} />}
    </>
  );
}
