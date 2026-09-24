import { projects, type Project, type ProjectId } from '../../data/projects.ts';

// References use stable identities; presentation order, numbers, and URLs may change separately.
export function getProject(id: ProjectId): Project {
  const project = projects.find((project) => project.id === id);
  if (!project) throw new Error(`Unknown project reference: ${id}`);
  return project;
}
