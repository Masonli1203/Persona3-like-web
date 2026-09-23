'use client';
import { useRef, useState } from 'react';
import { creativeCategories, categoryPath } from '@/data/creativeProjects';
import { TransitionLink as Link, usePageTransition } from './page-transition';
import Image from 'next/image';
import styles from './creative/category-menu.module.css';

export function CreativeGallery() {
  const [selected, setSelected] = useState<string>(creativeCategories[0].id);
  const { motionOff, setMotionOff } = usePageTransition();
  const category = creativeCategories.find((item) => item.id === selected)!;
  const stage = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={stage}
      className={styles.stage}
      data-motion={motionOff ? 'off' : 'on'}
      onPointerMove={(event) => {
        if (
          motionOff ||
          event.pointerType !== 'mouse' ||
          !window.matchMedia(
            '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
          ).matches
        )
          return;
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty(
          '--pointer-x',
          `${((event.clientX - rect.left) / rect.width - 0.5) * 14}px`,
        );
        event.currentTarget.style.setProperty(
          '--pointer-y',
          `${((event.clientY - rect.top) / rect.height - 0.5) * 10}px`,
        );
      }}
      onPointerLeave={() => {
        stage.current?.style.setProperty('--pointer-x', '0px');
        stage.current?.style.setProperty('--pointer-y', '0px');
      }}
    >
      <div className={styles.sweep} aria-hidden="true" />
      <nav className={styles.menu} aria-label="Creative categories">
        {creativeCategories.map((item) => (
          <Link
            key={item.id}
            href={categoryPath(item.id)}
            className={styles.entry}
            data-selected={selected === item.id}
            onPointerEnter={() => setSelected(item.id)}
            onFocus={() => setSelected(item.id)}
          >
            <span className={styles.float}>
              <span className={styles.face}>
                <span className={styles.number}>{item.number}</span>
                <span className={styles.title}>{item.title}</span>
                <span className={styles.arrow} aria-hidden="true">
                  ↗
                </span>
              </span>
            </span>
          </Link>
        ))}
      </nav>
      <div className={styles.preview} data-category={category.id} aria-hidden="true">
        <div className={styles.previewFrame}>
          <div key={category.id} className={styles.previewImage}>
            <Image src={category.cover} alt="" fill quality={90} sizes="1280px" />
          </div>
        </div>
        <span className={styles.previewNumber}>{category.number}</span>
        <span className={styles.previewCaption}>{category.title}</span>
      </div>
      <button
        type="button"
        className={styles.motionControl}
        aria-pressed={!motionOff}
        onClick={() => setMotionOff((value) => !value)}
      >
        {motionOff ? 'Motion off' : 'Motion on'}
        <span aria-hidden="true">{motionOff ? '▷' : 'Ⅱ'}</span>
      </button>
    </div>
  );
}
