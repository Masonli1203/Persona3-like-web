import type { Metadata } from 'next';
import { site } from '@/data/site';
import Image from 'next/image';
import { SectionHeading } from '@/components/ui/section-heading';
import { MediaFocus } from '@/components/ui/media-focus';
import { profile } from '@/data/profile';
import { getProject } from '@/features/projects/catalog';
import { TransitionLink } from '@/features/navigation/page-transition';

export const metadata: Metadata = {
  title: `About — ${site.name}`,
  description: profile.summary,
};

export default function AboutPage() {
  return (
    <>
      <SectionHeading
        number="03"
        title="ABOUT"
        description="AI, visual effects, and interactive experiences."
      />
      <div className="about-grid">
        <MediaFocus as="aside" className="profile-card" label={`${site.name} — personal profile`}>
          <div className="micro profile-top">
            <span>PERSONAL FILE</span>
            <span>{site.initials} / 03</span>
          </div>
          <div className="profile-portrait">
            <Image
              src={profile.portrait}
              alt={`${profile.name} profile illustration`}
              fill
              sizes="(max-width: 560px) 88vw, (max-width: 760px) 28rem, (max-width: 1100px) 34vw, (max-width: 1800px) 28vw, 32rem"
              className="profile-portrait-image"
            />
          </div>
          <div className="profile-name">
            <h2>{profile.name}</h2>
            <p>{profile.fullName}</p>
            <span className="micro">{profile.role}</span>
          </div>
          <dl className="profile-facts">
            <div>
              <dt>Based in</dt>
              <dd>{profile.location}</dd>
            </div>
            <div>
              <dt>Currently</dt>
              <dd>{site.current}</dd>
            </div>
            <div>
              <dt>Focus</dt>
              <dd>{site.focus}</dd>
            </div>
          </dl>
          {profile.email && (
            <a className="profile-email" href={`mailto:${profile.email}`}>
              {profile.email}
              <span aria-hidden="true">↗</span>
            </a>
          )}
          {profile.cv && (
            <a
              className="cv-button"
              href={profile.cv}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View ${profile.name}’s CV (PDF, opens in a new tab)`}
            >
              CV <span>VIEW PDF ↗</span>
            </a>
          )}
        </MediaFocus>

        <div className="about-story">
          <section className="about-intro" aria-labelledby="about-introduction">
            <span className="micro">01 / INTRODUCTION</span>
            <h2 id="about-introduction">
              Visual effects
              <br />
              and web development<span>.</span>
            </h2>
            {profile.introduction.map((paragraph, index) => (
              <p key={paragraph} className={index > 0 ? 'secondary-copy' : undefined}>
                {paragraph}
              </p>
            ))}
          </section>

          <section className="about-section" aria-labelledby="about-education">
            <div className="section-label">
              <h3 id="about-education">Education</h3>
              <span className="micro">02 / LEARNING</span>
            </div>
            <ul className="about-timeline">
              {profile.education.map((item) => (
                <li className="timeline-row" key={item.school}>
                  <span className="timeline-marker" aria-hidden="true" />
                  <div>
                    <div className="timeline-heading">
                      <h4>{item.school}</h4>
                      <span className="micro">{item.period}</span>
                    </div>
                    <p className="timeline-role">{item.degree}</p>
                    <p>{item.location}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="about-section" aria-labelledby="about-experience">
            <div className="section-label">
              <h3 id="about-experience">Experience</h3>
              <span className="micro">03 / PRACTICE</span>
            </div>
            <ul className="about-timeline">
              {profile.experience.map((item) => (
                <li className="timeline-row" key={item.company}>
                  <span className="timeline-marker" aria-hidden="true" />
                  <div>
                    <div className="timeline-heading">
                      <h4>{item.company}</h4>
                      <span className="micro">{item.period}</span>
                    </div>
                    <p className="timeline-role">
                      {item.role} · {item.location}
                    </p>
                    <p>{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="about-section" aria-labelledby="about-projects">
            <div className="section-label">
              <h3 id="about-projects">Selected projects</h3>
              <span className="micro">04 / BUILDING</span>
            </div>
            <ul className="about-projects">
              {profile.projects.map((entry) => {
                const project = getProject(entry.projectId);
                return (
                  <li key={project.id}>
                    <span className="micro">{entry.medium}</span>
                    <h4>{project.title}</h4>
                    <p>{entry.description}</p>
                    {project.caseStudyHref && (
                      <div className="project-actions">
                        <TransitionLink href={project.caseStudyHref}>
                          Read the case study <span aria-hidden="true">↗</span>
                        </TransitionLink>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="about-section" aria-labelledby="about-toolkit">
            <div className="section-label">
              <h3 id="about-toolkit">Tools & languages</h3>
              <span className="micro">05 / TOOLKIT</span>
            </div>
            <dl className="about-skills">
              {profile.skills.map((skill) => (
                <div key={skill.category}>
                  <dt>{skill.category}</dt>
                  <dd>{skill.tools}</dd>
                </div>
              ))}
            </dl>
            <h4 className="about-languages-heading">Languages</h4>
            <ul className="about-languages">
              {profile.languages.map((language) => (
                <li key={language.name}>
                  <span>{language.name}</span>
                  <span className="micro">{language.level}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="about-section" aria-labelledby="about-recognition">
            <div className="section-label">
              <h3 id="about-recognition">Recognition</h3>
              <span className="micro">06 / AWARDS</span>
            </div>
            <ul className="about-timeline">
              {profile.awards.map((award) => (
                <li className="timeline-row" key={award.name}>
                  <span className="timeline-marker" aria-hidden="true" />
                  <div>
                    <div className="timeline-heading">
                      <h4>{award.name}</h4>
                      <span className="micro">{award.period}</span>
                    </div>
                    <p>{award.institution}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
