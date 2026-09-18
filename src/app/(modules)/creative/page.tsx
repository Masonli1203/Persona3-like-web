import type { Metadata } from 'next';
import { site } from '@/data/site';
import { ModuleHeading } from '@/components/module-parts';
import { CreativeGallery } from '@/components/creative-gallery';
export const metadata: Metadata = { title: `Creative — ${site.name}` };
export default function CreativePage() {
  return (
    <>
      <ModuleHeading
        number="01"
        title="CREATIVE"
        description="Images, experiments, and ideas that move."
        note="THE VISUAL SIDE"
      />
      <CreativeGallery />
    </>
  );
}
