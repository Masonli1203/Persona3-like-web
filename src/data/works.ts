type Project = {
  id: string;
  number: string;
  title: string;
  category: string;
  description: string;
  note: string;
  tags: readonly string[];
  label: string;
  status?: string;
  noteHeading?: string;
  repositoryUrl?: string;
  siteHref?: string;
  liveUrl?: string;
  caseStudyHref?: string;
  image?: { src: string; alt: string; width: number; height: number };
};

const projectRecords = [
  {
    id: 'sample-project',
    number: '01',
    title: 'Example Project',
    category: 'Case study template',
    description: 'An editable case study with overview, process, and outcome sections.',
    note: 'Replace the sample narrative with the decisions and evidence behind your own project.',
    tags: ['Overview', 'Process', 'Outcome'],
    label: 'EXAMPLE PROJECT',
    status: 'SAMPLE CONTENT',
    caseStudyHref: '/projects/sample-project',
    image: {
      src: '/images/sample-film.svg',
      alt: 'Abstract case study placeholder',
      width: 1200,
      height: 800,
    },
  },
  {
    id: 'interface-study',
    number: '02',
    title: 'Interface Study',
    category: 'Interaction demo',
    description: 'Try the chapter transition and press feedback in an isolated demo.',
    note: 'The same interaction components power the portfolio navigation.',
    tags: ['Motion', 'Interaction'],
    label: 'INTERFACE DEMO',
    caseStudyHref: '/projects/interface-study',
  },
  {
    id: 'space-configurator',
    number: '03',
    title: 'Space Configurator',
    category: 'Procedural 3D demo',
    description: 'Adjust dimensions, finishes, and accessories in a working browser model.',
    note: 'This bundled concept uses demonstration estimates. It is not a product for sale or a client case study.',
    tags: ['Three.js', 'Procedural geometry'],
    label: 'INTERACTIVE DEMO',
    caseStudyHref: '/projects/space-configurator',
    image: {
      src: '/resources/projects/parametric-spaces/alcove.svg',
      alt: 'Procedural garden room demonstration',
      width: 1200,
      height: 900,
    },
  },
  {
    id: 'next-project',
    number: '04',
    title: 'Your Next Project',
    category: 'Project placeholder',
    description: 'Add another project here.',
    note: 'Describe the idea, your role, and its current state.',
    tags: ['Exploration'],
    label: 'ADD YOUR MEDIA',
  },
] as const satisfies readonly Project[];

export type ProjectId = (typeof projectRecords)[number]['id'];
export const projects: readonly Project[] = projectRecords;

// References use stable identities; presentation order, numbers, and URLs may change separately.
export function getProject(id: ProjectId): Project {
  const project = projects.find((project) => project.id === id);
  if (!project) throw new Error(`Unknown project reference: ${id}`);
  return project;
}
