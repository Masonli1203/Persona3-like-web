import Image from 'next/image';
import type { CreativeCategory } from '@/data/creative';
import styles from './creative.module.css';
export function CreativeVisual({
  title,
  category,
  coverImage,
}: {
  title: string;
  category: CreativeCategory;
  coverImage?: string;
}) {
  return (
    <div className={styles.visual} data-category={category}>
      {coverImage ? (
        <Image src={coverImage} alt={`${title} cover`} fill sizes="(max-width: 800px) 90vw, 65vw" />
      ) : (
        <>
          <div className={styles.geometry} aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <span className={`micro ${styles.placeholder}`}>Visual placeholder</span>
          <span className={styles.visualTitle} aria-hidden="true">
            {title}
          </span>
        </>
      )}
    </div>
  );
}
