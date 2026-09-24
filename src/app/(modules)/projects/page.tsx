import type { Metadata } from 'next';
import { site } from '@/data/site';
import { SectionHeading } from '@/components/ui/section-heading';
import { ProjectIndex } from '@/features/projects/project-index';
export const metadata: Metadata = { title: `Projects — ${site.name}` };
export default function ProjectsPage() {
  return (
    <>
      <SectionHeading
        number="02"
        title="PROJECTS"
        description="Web tools and interactive projects, with notes on how I built them."
      />
      <ProjectIndex />
    </>
  );
}
