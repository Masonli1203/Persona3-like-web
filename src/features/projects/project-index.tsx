'use client';

import { useState } from 'react';
import Image from 'next/image';
import { projects } from '@/data/projects';
import { MediaPlaceholder } from '../../components/ui/media-placeholder';
import { MediaFocus } from '../../components/ui/media-focus';
import { TransitionLink } from '../navigation/page-transition';

export function ProjectIndex() {
  const [selected, setSelected] = useState(0);
  const project = projects[selected];
  return (
    <div className="project-browser">
      <section className="project-list" aria-label="Project index">
        <div className="list-label micro">
          <span>PROJECT INDEX</span>
          <span>{String(projects.length).padStart(2, '0')} ENTRIES</span>
        </div>
        {projects.map((item, index) => {
          const content = (
            <>
              <span className="micro">{item.number}</span>
              <span className="project-row-text">
                <strong>{item.title}</strong>
                <span>{item.category}</span>
              </span>
              <span aria-hidden="true">↗</span>
            </>
          );
          const interaction = {
            onPointerEnter: (event: React.PointerEvent<HTMLElement>) => {
              if (event.pointerType === 'mouse') setSelected(index);
            },
            onFocus: () => setSelected(index),
          };
          return item.caseStudyHref ? (
            <TransitionLink
              key={item.id}
              className="project-row"
              href={item.caseStudyHref}
              data-selected={selected === index}
              aria-label={`${item.title} — read the case study`}
              {...interaction}
            >
              {content}
            </TransitionLink>
          ) : (
            <button
              key={item.id}
              type="button"
              className="project-row"
              data-selected={selected === index}
              aria-pressed={selected === index}
              aria-controls="project-detail"
              {...interaction}
              onClick={() => setSelected(index)}
            >
              {content}
            </button>
          );
        })}
        <p className="draft-caption">
          Hover or focus to explore a preview.
          <br />
          Click a case study entry or its image to read the story.
        </p>
      </section>
      <MediaFocus
        as="section"
        id="project-detail"
        className="project-detail"
        label={`${project.title} — project preview`}
        live="polite"
      >
        {projects.map((item, index) => (
          <div
            key={item.id}
            className="project-preview-panel"
            data-active={selected === index}
            aria-hidden={selected !== index}
            inert={selected !== index}
          >
            <ProjectPreview project={item} />
          </div>
        ))}
      </MediaFocus>
    </div>
  );
}

function ProjectPreview({ project }: { project: (typeof projects)[number] }) {
  const preview = project.image ? (
    <Image
      src={project.image.src}
      alt={project.image.alt}
      width={project.image.width}
      height={project.image.height}
      sizes="(max-width: 1100px) 91vw, (max-width: 1600px) 50vw, 44rem"
      unoptimized={project.image.src.endsWith('.png')}
      className="project-preview-image"
    />
  ) : (
    <MediaPlaceholder code={`PROJECT / ${project.number}`} tone="blue" label={project.label} />
  );
  return (
    <>
      {project.caseStudyHref ? (
        <TransitionLink
          key={project.id}
          href={project.caseStudyHref}
          className="project-preview-link"
          aria-label={`Read the ${project.title} case study`}
        >
          {preview}
          <span className="project-preview-overlay" aria-hidden="true">
            <span className="project-preview-prompt">
              Read the case <span>↗</span>
            </span>
          </span>
        </TransitionLink>
      ) : (
        preview
      )}
      <div className="project-copy">
        <div className="list-label micro">
          <span>{project.category}</span>
          <span>{project.status ?? 'CONTENT IN PROGRESS'}</span>
        </div>
        <h2>{project.title}</h2>
        <p>{project.description}</p>
        <div className="project-tags">
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <div className="project-content-note">
          <span className="micro">{project.noteHeading ?? 'THE STORY / COMING SOON'}</span>
          <p>{project.note}</p>
        </div>
        {(project.repositoryUrl ||
          project.siteHref ||
          project.liveUrl ||
          project.caseStudyHref) && (
          <div className="project-actions">
            {project.caseStudyHref && (
              <TransitionLink href={project.caseStudyHref}>
                Read the case study <span aria-hidden="true">↗</span>
              </TransitionLink>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${project.title} live website (opens in a new tab)`}
              >
                Open {project.title} <span aria-hidden="true">↗</span>
              </a>
            )}
            {project.repositoryUrl && (
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View open-source template on GitHub (opens in a new tab)"
              >
                Template on GitHub <span aria-hidden="true">↗</span>
              </a>
            )}
            {project.siteHref && (
              <TransitionLink href={project.siteHref}>
                Explore this website <span aria-hidden="true">↗</span>
              </TransitionLink>
            )}
          </div>
        )}
      </div>
    </>
  );
}
