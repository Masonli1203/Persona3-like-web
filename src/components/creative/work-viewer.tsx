'use client';
import { useId, useLayoutEffect, useRef, useState } from 'react';
import type { CreativeProject } from '@/data/creativeProjects';
import { MuxVideoPlayer } from '@/components/media/MuxVideoPlayer';
import { PhotographyGallery } from './photography-gallery';
import styles from './creative.module.css';

const galleryPositions = new Map<string, { scroll: number; index: number | null }>();

export function WorkViewer({ project, close }: { project: CreativeProject; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const backdropPress = useRef(false);
  const heading = useId();
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const position = useRef(galleryPositions.get(project.slug) ?? { scroll: 0, index: null });
  const returning = useRef(false);
  const restoring = useRef(true);
  function back() {
    if (photoIndex !== null) {
      returning.current = true;
      setPhotoIndex(null);
    } else {
      position.current.scroll = dialog.current?.scrollTop ?? position.current.scroll;
      close();
    }
  }
  function selectPhoto(index: number) {
    if (photoIndex === null)
      position.current.scroll = dialog.current?.scrollTop ?? position.current.scroll;
    position.current.index = index;
    setPhotoIndex(index);
  }
  useLayoutEffect(() => {
    const viewer = dialog.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    const savedPosition = position.current;
    viewer?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      galleryPositions.set(project.slug, { ...savedPosition });
      viewer?.close();
      document.body.style.overflow = overflow;
      trigger?.focus({ preventScroll: true });
    };
  }, [project.slug]);
  useLayoutEffect(() => {
    const viewer = dialog.current;
    if (!viewer || project.mediaType !== 'gallery') return;
    restoring.current = true;
    const targetScroll = photoIndex === null ? position.current.scroll : 0;
    let settledFrame = 0;
    const frame = requestAnimationFrame(() => {
      viewer.scrollTop = targetScroll;
      if (photoIndex === null && returning.current && position.current.index !== null) {
        viewer
          .querySelector<HTMLButtonElement>(`[data-photo-index="${position.current.index}"] button`)
          ?.focus({ preventScroll: true });
        returning.current = false;
      }
      settledFrame = requestAnimationFrame(() => {
        restoring.current = false;
      });
    });
    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(settledFrame);
    };
  }, [photoIndex, project.mediaType]);
  return (
    <dialog
      ref={dialog}
      className={styles.workDialog}
      data-gallery={project.mediaType === 'gallery'}
      aria-labelledby={heading}
      onScroll={(event) => {
        if (photoIndex === null && !restoring.current)
          position.current.scroll = event.currentTarget.scrollTop;
      }}
      onCancel={(event) => {
        if (event.target === event.currentTarget) {
          event.preventDefault();
          back();
        }
      }}
      onPointerDown={(event) => {
        backdropPress.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget && backdropPress.current) back();
      }}
    >
      <article className={styles.workSheet}>
        <header className={styles.viewerHeader}>
          <button type="button" autoFocus onClick={back}>
            {photoIndex === null ? '← Back to works' : '← Back to series'}
          </button>
          <span className="micro">{project.title}</span>
        </header>
        <div className={styles.viewerBody}>
          <h2 id={heading}>{project.title}</h2>
          {project.mediaType === 'gallery' ? (
            <PhotographyGallery
              images={project.gallery}
              title={project.title}
              index={photoIndex}
              select={selectPhoto}
            />
          ) : project.muxPlaybackId ? (
            <MuxVideoPlayer
              playbackId={project.muxPlaybackId}
              title={project.title}
              poster={project.coverImage}
              category={project.category}
            />
          ) : project.videoSrc ? (
            <video
              className={styles.localVideo}
              src={project.videoSrc}
              poster={project.coverImage}
              controls
              playsInline
              preload="metadata"
              aria-label={`${project.title} video`}
            />
          ) : (
            <p>Film coming soon.</p>
          )}
          {project.description && <p className={styles.detailCopy}>{project.description}</p>}
          {project.tools?.length ? <p className="micro">{project.tools.join(' / ')}</p> : null}
        </div>
      </article>
    </dialog>
  );
}
