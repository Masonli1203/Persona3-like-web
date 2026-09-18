'use client';

import { useState } from 'react';
import { projects } from '@/data/works';
import { MediaPlaceholder } from './module-parts';

export function ProjectIndex() {
  const [selected, setSelected] = useState(0);
  const project = projects[selected];
  return (
    <div className="project-browser">
      <section className="project-list" aria-label="Project index">
        <div className="list-label micro">
          <span>PROJECT INDEX</span>
          <span>04 ENTRIES</span>
        </div>
        {projects.map((item, index) => (
          <button
            key={item.id}
            className="project-row"
            aria-pressed={selected === index}
            aria-controls="project-detail"
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse') setSelected(index);
            }}
            onFocus={() => setSelected(index)}
            onClick={() => setSelected(index)}
          >
            <span className="micro">{item.id}</span>
            <span className="project-row-text">
              <strong>{item.title}</strong>
              <span>{item.category}</span>
            </span>
            <span aria-hidden="true">↗</span>
          </button>
        ))}
        <p className="draft-caption">
          Select a project to explore its preview.
          <br />
          Full case studies are coming later.
        </p>
      </section>
      <section id="project-detail" className="project-detail" aria-live="polite" aria-atomic="true">
        <MediaPlaceholder code={`PROJECT / ${project.id}`} tone="blue" label={project.label} />
        <div className="project-copy">
          <div className="list-label micro">
            <span>{project.category}</span>
            <span>CONTENT IN PROGRESS</span>
          </div>
          <h2>{project.title}</h2>
          <p>{project.description}</p>
          <div className="project-tags">
            {project.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <div className="project-content-note">
            <span className="micro">THE STORY / COMING SOON</span>
            <p>{project.note}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
