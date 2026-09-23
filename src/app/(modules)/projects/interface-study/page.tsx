import type { Metadata } from 'next';
import { site } from '@/data/site';
import { ModuleHeading } from '@/components/module-parts';
import { PersonaPressDemo } from '@/components/persona-press-demo';
import '../case-study.css';
export const metadata: Metadata = {
  title: `Interface Study — ${site.name}`,
  description: 'A working preview of the portfolio navigation feedback.',
};
export default function Page() {
  return (
    <article className="project-case template-case">
      <ModuleHeading
        number="02"
        title="INTERFACE STUDY"
        description="A working preview of the portfolio navigation feedback."
      />
      <div className="template-case-body">
        <PersonaPressDemo />
      </div>
    </article>
  );
}
