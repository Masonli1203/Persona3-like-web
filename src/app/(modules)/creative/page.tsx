import type { Metadata } from 'next';
import { site } from '@/data/site';
import { SectionHeading } from '@/components/ui/section-heading';
import { CategoryMenu } from '@/features/creative/category-menu';
export const metadata: Metadata = { title: `Creative — ${site.name}` };
export default function CreativePage() {
  return (
    <>
      <SectionHeading
        number="01"
        title="CREATIVE"
        description="Film, 3D, AI experiments, and photography."
      />
      <CategoryMenu />
    </>
  );
}
