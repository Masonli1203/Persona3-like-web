import type { Metadata } from 'next';
import { site } from '@/data/site';
import { getProject } from '@/data/works';
import { ModuleHeading } from '@/components/module-parts';
import { PersonaPressDemo } from '@/components/persona-press-demo';
import '../case-study.css';
const project = getProject('interface-study');
const description = 'A working preview of the portfolio navigation feedback.';
export const metadata: Metadata = {
  title: `${project.title} — ${site.name}`,
  description,
};
export default function Page() {
  return (
    <article className="project-case template-case">
      <ModuleHeading number="02" title={project.title.toUpperCase()} description={description} />
      <div className="template-case-body">
        <PersonaPressDemo />
      </div>
    </article>
  );
}
