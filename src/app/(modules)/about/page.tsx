import type { Metadata } from 'next';
import { site } from '@/data/site';
import { ModuleHeading } from '@/components/module-parts';
export const metadata: Metadata = { title: `About — ${site.name}` };
export default function AboutPage() {
  return (
    <>
      <ModuleHeading
        number="03"
        title="ABOUT"
        description="The person behind the pixels."
        note="THE HUMAN SIDE"
      />
      <div className="about-grid">
        <aside className="profile-card">
          <div className="micro profile-top">
            <span>PERSONAL FILE</span>
            <span>{site.initials} / 03</span>
          </div>
          <div className="profile-portrait" role="img" aria-label="Portrait placeholder">
            <span aria-hidden="true">{site.initials}</span>
            <span className="micro">PORTRAIT COMING SOON</span>
          </div>
          <div className="profile-name">
            <h2>{site.name}</h2>
            <p>{site.label}</p>
            <span className="micro">{site.role.toUpperCase()}</span>
          </div>
          <dl className="profile-facts">
            <div>
              <dt>Focus</dt>
              <dd>{site.focus}</dd>
            </div>
            <div>
              <dt>Medium</dt>
              <dd>{site.medium}</dd>
            </div>
          </dl>
          <button className="cv-button" disabled>
            CV <span>COMING SOON</span>
          </button>
        </aside>
        <div className="about-story">
          <section className="about-intro">
            <span className="micro">01 / INTRODUCTION</span>
            <h2>
              Curiosity is
              <br />
              the constant<span>.</span>
            </h2>
            <p>{site.introduction}</p>
            <p className="secondary-copy">{site.secondaryIntroduction}</p>
          </section>
          <section className="about-section">
            <div className="section-label">
              <h3>Background</h3>
              <span className="micro">02 / JOURNEY</span>
            </div>
            <div className="timeline-row">
              <span className="timeline-marker" aria-hidden="true" />
              <div>
                <h4>Education</h4>
                <p>Education details will be added here.</p>
              </div>
              <span className="micro">TO BE ADDED</span>
            </div>
            <div className="timeline-row">
              <span className="timeline-marker" aria-hidden="true" />
              <div>
                <h4>Experience</h4>
                <p>Roles, collaborations, and milestones will be added here.</p>
              </div>
              <span className="micro">TO BE ADDED</span>
            </div>
          </section>
          <section className="about-section">
            <div className="section-label">
              <h3>Fields of interest</h3>
              <span className="micro">03 / TOOLKIT</span>
            </div>
            <div className="interest-list">
              {site.interests.map((interest) => (
                <span key={interest}>{interest}</span>
              ))}
            </div>
            <p className="draft-caption">
              Specific tools and skills will be added with the full profile.
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
