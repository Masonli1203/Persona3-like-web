import type { Metadata } from 'next';
import { site } from '@/data/site';
import { ModuleHeading } from '@/components/module-parts';
import { ProjectIndex } from '@/components/project-index';
export const metadata: Metadata = { title: `Projects — ${site.name}` };
export default function ProjectsPage() {
  return (
    <>
      <ModuleHeading
        number="02"
        title="PROJECTS"
        description="Independent ideas. Thought through, made real."
        note="THE BUILT SIDE"
      />
      <ProjectIndex />
    </>
  );
}
