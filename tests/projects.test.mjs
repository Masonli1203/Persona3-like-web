import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { projects } from '../src/data/projects.ts';

test('project identities and linked detail routes are unambiguous and resolve to real pages', async () => {
  assert.equal(new Set(projects.map((project) => project.id)).size, projects.length);
  const linkedProjects = projects.filter((project) => project.caseStudyHref);
  assert.equal(
    new Set(linkedProjects.map((project) => project.caseStudyHref)).size,
    linkedProjects.length,
  );
  for (const project of projects) {
    assert.match(project.id, /^[a-z][a-z0-9-]*$/);
    assert.match(project.number, /^\d{2}$/);
    assert.ok(project.title.trim());
  }
  for (const project of linkedProjects) {
    assert.match(project.caseStudyHref, /^\/projects\/[a-z0-9-]+$/);
    await access(new URL(`../src/app/(modules)${project.caseStudyHref}/page.tsx`, import.meta.url));
  }
});
