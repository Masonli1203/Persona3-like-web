import test from 'node:test';
import assert from 'node:assert/strict';
import { access } from 'node:fs/promises';
import { creativeCatalog, createCreativeCatalog } from '../src/features/creative/catalog.ts';

const creativeCategories = creativeCatalog.categories;
const creativeProjects = creativeCategories.flatMap((category) =>
  creativeCatalog.worksInCategory(category.id),
);

test('the catalog preserves every public category and work entry route', () => {
  assert.deepEqual(creativeCatalog.staticParams(), [
    { slug: ['vfx-film'] },
    { slug: ['3d'] },
    { slug: ['ai-experiments'] },
    { slug: ['photography'] },
    { slug: ['film-study'] },
    { slug: ['form-study'] },
    { slug: ['motion-study'] },
    { slug: ['photography', 'sample-series'] },
  ]);
  for (const category of creativeCategories) {
    assert.equal(creativeCatalog.categoryPath(category.id), `/creative/${category.id}`);
    assert.deepEqual(creativeCatalog.resolveRoute([category.id]), { kind: 'category', category });
  }
  for (const project of creativeProjects) {
    const path = creativeCatalog.workPath(project).slice('/creative/'.length).split('/');
    assert.deepEqual(creativeCatalog.resolveRoute(path), { kind: 'work', work: project });
    const viewer = new URL(creativeCatalog.workHref(project), 'https://example.test');
    assert.equal(viewer.pathname, creativeCatalog.categoryPath(project.category));
    assert.equal(
      creativeCatalog.findWork(project.category, viewer.searchParams.get('work')),
      project,
    );
  }
});

test('unknown paths and missing, unknown, or cross-category work queries never select a work', () => {
  for (const path of [
    [],
    ['sample-series'],
    ['photography', 'film-study'],
    ['unknown'],
    ['film-study', 'extra'],
    ['photography/sample-series'],
  ]) {
    assert.equal(creativeCatalog.resolveRoute(path), undefined);
  }
  for (const slug of [null, '', 'unknown', 'film-study']) {
    assert.equal(creativeCatalog.findWork('photography', slug), undefined);
  }
});

const film = creativeCatalog.findWork('vfx-film', 'film-study');
const series = creativeCatalog.findWork('photography', 'sample-series');

test('catalog construction rejects duplicate identities and conflicts across all route kinds', () => {
  assert.throws(
    () => createCreativeCatalog(creativeCategories, [film, { ...film }]),
    /Duplicate creative work/,
  );
  assert.throws(
    () => createCreativeCatalog(creativeCategories, [film, { ...film, category: '3d' }]),
    /Conflicting creative route/,
  );
  for (const category of creativeCategories) {
    assert.throws(
      () => createCreativeCatalog(creativeCategories, [{ ...film, slug: category.id }]),
      /Conflicting creative route/,
    );
  }
  assert.throws(
    () => createCreativeCatalog([...creativeCategories, creativeCategories[0]], []),
    /Conflicting creative route/,
  );
  assert.throws(
    () => createCreativeCatalog(creativeCategories, [{ ...film, category: 'unknown' }]),
    /Unknown creative category/,
  );
});

test('photography may share a slug with a film because its entry route is namespaced', () => {
  const photo = { ...series, slug: film.slug };
  const catalog = createCreativeCatalog(creativeCategories, [film, photo]);
  assert.equal(catalog.findWork('vfx-film', film.slug), film);
  assert.equal(catalog.findWork('photography', film.slug), photo);
  assert.equal(catalog.resolveRoute(['film-study']).work, film);
  assert.equal(catalog.resolveRoute(['photography', 'film-study']).work, photo);
  assert.deepEqual(catalog.worksInCategory('3d'), []);
});

test('work links encode punctuation and Unicode once and preserve identity when parsed', () => {
  for (const slug of ['study & edit?#', '影像 01', 'literal%20+value']) {
    const work = { ...film, slug };
    const catalog = createCreativeCatalog(creativeCategories, [work]);
    const entry = new URL(catalog.workPath(work), 'https://example.test');
    assert.equal(entry.search, '');
    assert.equal(entry.hash, '');
    const params = entry.pathname.slice('/creative/'.length).split('/').map(decodeURIComponent);
    assert.equal(catalog.resolveRoute(params).work, work);
    assert.deepEqual(catalog.staticParams().at(-1), { slug: [slug] });
    const viewer = new URL(catalog.workHref(work), 'https://example.test');
    assert.deepEqual([...viewer.searchParams], [['work', slug]]);
    assert.equal(catalog.findWork('vfx-film', viewer.searchParams.get('work')), work);
  }
});

test('slugs must be nonempty single path segments without traversal or control characters', () => {
  for (const slug of ['', ' ', '.', '..', 'one/two', 'one\\two', 'line\nbreak', 'nul\u0000']) {
    assert.throws(
      () => createCreativeCatalog(creativeCategories, [{ ...film, slug }]),
      /Invalid creative route segment/,
    );
  }
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
