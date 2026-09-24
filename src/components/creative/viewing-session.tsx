'use client';

import {
  createContext,
  useContext,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  creativeCatalog,
  type CreativeCategory,
  type CreativeProject,
} from '@/data/creativeProjects';
import { MuxVideoPlayer } from '@/components/media/MuxVideoPlayer';
import { FullPhoto, PhotoThumbnail } from './photo-media';
import styles from './creative.module.css';

// Memory lasts for this loaded page, including client-side route changes.
const seriesPositions = new Map<string, number>();
const ViewingContext = createContext<{
  category: CreativeCategory;
  open: (slug: string, trigger: HTMLAnchorElement) => void;
} | null>(null);

export function CreativeViewingSession({
  category,
  children,
}: {
  category: CreativeCategory;
  children: (viewing: boolean) => ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = creativeCatalog.findWork(category, searchParams.get('work'));

  function open(slug: string, trigger: HTMLAnchorElement) {
    trigger.focus({ preventScroll: true });
    window.history.pushState(
      { creativeViewer: slug },
      '',
      creativeCatalog.workHref({ category, slug }),
    );
  }

  function close() {
    if (window.history.state?.creativeViewer === selected?.slug) window.history.back();
    else window.history.replaceState(null, '', pathname);
  }

  return (
    <ViewingContext.Provider value={{ category, open }}>
      {children(!!selected)}
      {selected && (
        <WorkViewer key={`${category}/${selected.slug}`} project={selected} close={close} />
      )}
    </ViewingContext.Provider>
  );
}

export function CreativeWorkLink({
  slug,
  onOpen,
  onClick,
  ...props
}: Omit<ComponentProps<'a'>, 'href'> & { slug: string; onOpen: () => void }) {
  const session = useContext(ViewingContext);
  if (!session) throw new Error('CreativeWorkLink requires CreativeViewingSession');
  return (
    <a
      {...props}
      href={creativeCatalog.workHref({ category: session.category, slug })}
      aria-haspopup="dialog"
      onClick={(event) => {
        onClick?.(event);
        if (
          event.defaultPrevented ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0 ||
          (props.target && props.target !== '_self')
        )
          return;
        event.preventDefault();
        onOpen();
        session.open(slug, event.currentTarget);
      }}
    />
  );
}

function WorkViewer({ project, close }: { project: CreativeProject; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const thumbnails = useRef<(HTMLButtonElement | null)[]>([]);
  const backdropPress = useRef(false);
  const heading = useId();
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);
  const memoryKey = `${project.category}/${project.slug}`;
  const position = useRef(seriesPositions.get(memoryKey) ?? 0);
  const returnPhoto = useRef<number | null>(null);
  const restoring = useRef(true);
  const images = project.mediaType === 'gallery' ? project.gallery : [];

  function back() {
    if (photoIndex !== null) {
      returnPhoto.current = photoIndex;
      setPhotoIndex(null);
    } else {
      position.current = dialog.current?.scrollTop ?? position.current;
      close();
    }
  }

  function selectPhoto(index: number) {
    if (photoIndex === null) position.current = dialog.current?.scrollTop ?? position.current;
    setPhotoIndex(index);
  }

  function step(direction: number) {
    selectPhoto(((photoIndex ?? 0) + direction + images.length) % images.length);
  }

  useLayoutEffect(() => {
    const viewer = dialog.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    viewer?.showModal();
    document.body.style.setProperty('overflow', 'hidden');
    return () => {
      seriesPositions.set(memoryKey, position.current);
      viewer?.close();
      document.body.style.setProperty('overflow', overflow);
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    };
  }, [memoryKey]);

  useLayoutEffect(() => {
    const viewer = dialog.current;
    if (!viewer || project.mediaType !== 'gallery') return;
    restoring.current = true;
    const targetScroll = photoIndex === null ? position.current : 0;
    let settledFrame = 0;
    const frame = requestAnimationFrame(() => {
      viewer.scrollTop = targetScroll;
      if (photoIndex === null && returnPhoto.current !== null) {
        thumbnails.current[returnPhoto.current]?.focus({ preventScroll: true });
        returnPhoto.current = null;
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
          position.current = event.currentTarget.scrollTop;
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
            !images.length ? (
              <p className={styles.draft}>Photographs will be added here.</p>
            ) : (
              <>
                <div className={styles.photoGrid} hidden={photoIndex !== null}>
                  {images.map((image, index) => (
                    <figure key={image.src} data-portrait={image.height > image.width}>
                      <PhotoThumbnail
                        image={image}
                        label={`Enlarge ${project.title}, image ${index + 1}`}
                        select={() => selectPhoto(index)}
                        buttonRef={(element) => {
                          thumbnails.current[index] = element;
                        }}
                      />
                      <figcaption className="micro">
                        {String(index + 1).padStart(2, '0')}
                      </figcaption>
                    </figure>
                  ))}
                </div>
                {photoIndex !== null && (
                  <section
                    className={styles.photoReader}
                    aria-label={`${project.title} photo viewer`}
                    onKeyDown={(event) => {
                      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                        event.preventDefault();
                        step(event.key === 'ArrowLeft' ? -1 : 1);
                      }
                    }}
                  >
                    <FullPhoto
                      key={images[photoIndex].src}
                      image={images[photoIndex]}
                      neighbors={[
                        images[(photoIndex - 1 + images.length) % images.length],
                        images[(photoIndex + 1) % images.length],
                      ]}
                    />
                    <div className={styles.lightboxNav}>
                      <button
                        autoFocus
                        type="button"
                        onClick={() => step(-1)}
                        disabled={images.length < 2}
                      >
                        ← Previous
                      </button>
                      <p aria-live="polite">
                        {project.title} / {photoIndex + 1} of {images.length}
                      </p>
                      <button type="button" onClick={() => step(1)} disabled={images.length < 2}>
                        Next →
                      </button>
                    </div>
                  </section>
                )}
              </>
            )
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
