import type { Metadata } from 'next';
import { site } from '@/data/site';
import { getProject } from '@/data/works';
import { ModuleHeading } from '@/components/module-parts';
import { ExpandableImage } from '@/components/expandable-image';
import { CaseContentsDock } from '@/components/case-contents-dock';
import '../case-study.css';
const project = getProject('sample-project');
const description = 'A case study structure ready for your own content.';
export const metadata: Metadata = {
  title: `${project.title} — ${site.name}`,
  description,
};
export default function Page() {
  return (
    <article className="project-case template-case">
      <ModuleHeading number="02" title={project.title.toUpperCase()} description={description} />
      <nav id="case-contents" className="template-case-contents" aria-label="Case study sections">
        <a href="#overview">Overview</a>
        <a href="#process">Process</a>
        <a href="#outcome">Outcome</a>
      </nav>
      <CaseContentsDock
        sourceId="case-contents"
        entries={[
          { id: 'overview', label: 'Overview' },
          { id: 'process', label: 'Process' },
          { id: 'outcome', label: 'Outcome' },
        ]}
      />
      <div className="template-case-body">
        <section id="overview">
          <h2>Overview</h2>
          <p>
            Explain what the project does, who it is for, and what you contributed. This is sample
            content, not a completed client project.
          </p>
        </section>
        <section id="process">
          <h2>Process</h2>
          <p>
            Describe a specific problem, the options you considered, and why you chose an approach.
          </p>
          <ExpandableImage
            src="/images/sample-film.svg"
            label="Sample project illustration"
            alt="Abstract illustration for a sample case study"
            width={1200}
            height={800}
          />
        </section>
        <section id="outcome">
          <h2>Outcome</h2>
          <p>
            Show what works today. Distinguish tested results from plans and include limitations.
          </p>
        </section>
      </div>
    </article>
  );
}
