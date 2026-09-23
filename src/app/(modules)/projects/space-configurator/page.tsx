import type { Metadata } from 'next';
import { site } from '@/data/site';
import { ModuleHeading } from '@/components/module-parts';
import { AlcoveConfigurator } from '@/components/alcove/alcove-configurator';
import '../case-study.css';
export const metadata: Metadata = {
  title: `Space Configurator — ${site.name}`,
  description:
    'A procedural 3D demonstration with editable dimensions, materials, and accessories.',
};
export default function Page() {
  return (
    <article className="project-case template-case">
      <ModuleHeading
        number="02"
        title="SPACE CONFIGURATOR"
        description="A procedural 3D demonstration with editable dimensions, materials, and accessories."
      />
      <div className="template-case-body">
        <p>
          All estimates are illustrative. This is a bundled concept, not a client commission or a
          product for sale.
        </p>
        <AlcoveConfigurator />
      </div>
    </article>
  );
}
