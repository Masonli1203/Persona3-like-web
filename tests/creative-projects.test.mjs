import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import {
  creativeCategories,
  creativeProjects,
  creativePath,
  findCreativeProject,
} from '../src/data/creativeProjects.ts';

test('creative routes are unique, categorized, and round-trip to the same work', () => {
  assert.equal(new Set(creativeProjects.map(creativePath)).size, creativeProjects.length);
  for (const project of creativeProjects) {
    assert.ok(creativeCategories.some((category) => category.id === project.category));
    assert.equal(
      findCreativeProject(creativePath(project).slice('/creative/'.length).split('/')),
      project,
    );
  }
  assert.equal(findCreativeProject(['sample-series']), undefined);
  assert.equal(findCreativeProject(['photography', 'film-study']), undefined);
  assert.equal(findCreativeProject(['unknown']), undefined);
});

test('all bundled creative references resolve to local neutral assets', async () => {
  const sources = creativeCategories.map((category) => category.cover);
  for (const project of creativeProjects) {
    assert.ok(!project.muxPlaybackId);
    if (project.coverImage) sources.push(project.coverImage);
    for (const image of project.gallery ?? []) {
      assert.ok(image.width > 0 && image.height > 0 && image.alt);
      sources.push(image.src, image.thumbnail);
    }
  }
  for (const source of sources) await access(new URL(`../public${source}`, import.meta.url));
});
