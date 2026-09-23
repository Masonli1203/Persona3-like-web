'use client';

import Image from 'next/image';
import { useEffect, useId, useRef } from 'react';

type ExpandableImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  label: string;
};

export function ExpandableImage({ src, alt, width, height, label }: ExpandableImageProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<number | null>(null);
  const restoreScroll = useRef<(() => void) | null>(null);
  const backdropPress = useRef(false);
  const titleId = useId();

  useEffect(
    () => () => {
      if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
      restoreScroll.current?.();
    },
    [],
  );

  function releaseScroll() {
    restoreScroll.current?.();
    restoreScroll.current = null;
  }

  function finishClose() {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
    closeTimer.current = null;
    dialog.current?.close();
    dialog.current?.removeAttribute('data-closing');
    releaseScroll();
  }

  function closeImage() {
    const viewer = dialog.current;
    if (!viewer?.open || viewer.dataset.closing === 'true') return;
    if (
      viewer.closest('[data-motion="off"]') ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !content.current
    ) {
      finishClose();
      return;
    }
    // Start from the visible frame, including when opening is interrupted.
    const current = getComputedStyle(content.current);
    viewer.style.setProperty('--pc-close-transform', current.transform);
    viewer.style.setProperty('--pc-close-opacity', current.opacity);
    viewer.style.setProperty(
      '--pc-close-backdrop-opacity',
      getComputedStyle(viewer, '::backdrop').opacity,
    );
    viewer.dataset.closing = 'true';
    // Also release the dialog if an animation is interrupted or the tab is hidden.
    closeTimer.current = window.setTimeout(finishClose, 230);
  }

  function openImage() {
    if (!dialog.current || dialog.current.open) return;
    dialog.current.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    restoreScroll.current = () => {
      document.body.style.overflow = previousOverflow;
    };
  }

  return (
    <>
      <button
        type="button"
        className="pc-image-trigger"
        aria-label={`Enlarge ${label}`}
        aria-haspopup="dialog"
        onClick={openImage}
      >
        <Image src={src} alt={alt} width={width} height={height} unoptimized />
        <span className="pc-image-hint" aria-hidden="true">
          Enlarge +
        </span>
      </button>
      <dialog
        ref={dialog}
        className="pc-image-viewer"
        aria-labelledby={titleId}
        onPointerDown={(event) => {
          backdropPress.current = event.target === event.currentTarget;
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget && backdropPress.current) closeImage();
        }}
        onCancel={(event) => {
          event.preventDefault();
          closeImage();
        }}
        onClose={() => {
          if (!dialog.current?.open) finishClose();
        }}
      >
        <div
          ref={content}
          className="pc-image-viewer-content"
          onAnimationEnd={(event) => {
            if (event.target === event.currentTarget && event.animationName === 'pc-image-pop-out')
              finishClose();
          }}
        >
          <button
            type="button"
            className="pc-image-close"
            aria-label="Close enlarged image"
            onClick={closeImage}
          >
            Close <span aria-hidden="true">×</span>
          </button>
          <Image
            className="pc-image-enlarged"
            src={src}
            alt={alt}
            width={width}
            height={height}
            unoptimized
          />
          <p id={titleId} className="micro">
            {label}
          </p>
        </div>
      </dialog>
    </>
  );
}
