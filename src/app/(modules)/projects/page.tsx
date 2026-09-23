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
        description="Web tools and interactive projects, with notes on how I built them."
      />
      <ProjectIndex />
    </>
  );
}
