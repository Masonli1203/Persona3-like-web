'use client';

import { useState } from 'react';
import { creativeWorks } from '@/data/works';
import { MediaPlaceholder } from './module-parts';

const filters = ['All work', 'Moving image', 'AI studies', 'Interactive'] as const;
export function CreativeGallery() {
  const [filter, setFilter] = useState<string>('All work');
  const visible = creativeWorks.filter((work) => filter === 'All work' || work.category === filter);
  return (
    <section aria-label="Creative work gallery">
      <div className="gallery-toolbar">
        <div className="work-filters" role="group" aria-label="Filter creative work">
          {filters.map((item) => (
            <button key={item} onClick={() => setFilter(item)} aria-pressed={filter === item}>
              {item}
            </button>
          ))}
        </div>
        <span className="micro work-count" role="status">
          {String(visible.length).padStart(2, '0')} ENTRIES
        </span>
      </div>
      <p className="draft-caption">
        A collection taking shape. Titles and media are placeholders for now.
      </p>
      <div className="work-grid">
        {visible.map((work) => (
          <article className="work-card" key={work.id}>
            <MediaPlaceholder code={`STUDY / ${work.id}`} tone={work.tone} />
            <div className="work-caption">
              <div>
                <span className="micro">{work.category}</span>
                <h2>{work.title}</h2>
              </div>
              <span className="micro work-id">/{work.id}</span>
            </div>
            <details className="work-notes">
              <summary>
                Study notes<span aria-hidden="true">+</span>
              </summary>
              <div>
                <p>
                  {work.format}. This space will hold the intention, process, and credits for the
                  work.
                </p>
                <span className="micro">CONTENT TO BE ADDED</span>
              </div>
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}
