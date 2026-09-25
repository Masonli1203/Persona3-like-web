import type { Metadata } from 'next';
import { site } from '@/data/site';
import { getProject } from '@/features/projects/catalog';
import { SectionHeading } from '@/components/ui/section-heading';
import { InterfaceStudy } from '@/features/interface-study/interface-study';
import '../../../../features/projects/case-study.css';
const project = getProject('interface-study');
const description = 'A working preview of the portfolio navigation feedback.';
export const metadata: Metadata = {
  title: `${project.title} — ${site.name}`,
  description,
};
export default function Page() {
  return (
    <article className="project-case template-case">
      <SectionHeading number="02" title={project.title.toUpperCase()} description={description} />
      <div className="template-case-body">
        <InterfaceStudy />
      </div>
    </article>
  );
}
