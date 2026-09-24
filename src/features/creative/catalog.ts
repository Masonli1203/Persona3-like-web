import {
  creativeCategories,
  creativeProjects,
  type CreativeCategory,
  type CreativeProject,
} from '../../data/creative.ts';

type Category = {
  id: CreativeCategory;
  number: string;
  title: string;
  cover: string;
};
type WorkIdentity = Pick<CreativeProject, 'category' | 'slug'>;
type CreativeRoute =
  { kind: 'category'; category: Category } | { kind: 'work'; work: CreativeProject };

function categoryPath(category: CreativeCategory) {
  return `/creative/${encodeURIComponent(category)}`;
}

function workSegments(work: WorkIdentity) {
  return work.category === 'photography' ? ['photography', work.slug] : [work.slug];
}

function workPath(work: WorkIdentity) {
  return `/creative/${workSegments(work).map(encodeURIComponent).join('/')}`;
}

function workHref(work: WorkIdentity) {
  return `${categoryPath(work.category)}?work=${encodeURIComponent(work.slug)}`;
}

function validateSegment(value: string) {
  if (!value.trim() || value === '.' || value === '..' || /[/\\\u0000-\u001f\u007f]/u.test(value)) {
    throw new Error(`Invalid creative route segment: ${JSON.stringify(value)}`);
  }
}

// Build once from editable content. Invalid identities fail before any route can shadow another.
export function createCreativeCatalog(
  categories: readonly Category[],
  works: readonly CreativeProject[],
) {
  const byCategory = new Map<CreativeCategory, CreativeProject[]>();
  const byIdentity = new Map<string, CreativeProject>();
  const routes = new Map<string, CreativeRoute>();
  const segments: string[][] = [];
  const identityKey = (category: CreativeCategory, slug: string) =>
    JSON.stringify([category, slug]);

  function addRoute(path: string[], route: CreativeRoute) {
    const key = JSON.stringify(path);
    if (routes.has(key)) {
      throw new Error(
        `Conflicting creative route: /creative/${path.map(encodeURIComponent).join('/')}`,
      );
    }
    routes.set(key, route);
    segments.push(path);
  }

  for (const category of categories) {
    validateSegment(category.id);
    addRoute([category.id], { kind: 'category', category });
    byCategory.set(category.id, []);
  }
  for (const work of works) {
    validateSegment(work.slug);
    const categoryWorks = byCategory.get(work.category);
    if (!categoryWorks) throw new Error(`Unknown creative category: ${work.category}`);
    const key = identityKey(work.category, work.slug);
    if (byIdentity.has(key)) {
      throw new Error(`Duplicate creative work: ${work.category}/${work.slug}`);
    }
    addRoute(workSegments(work), { kind: 'work', work });
    byIdentity.set(key, work);
    categoryWorks.push(work);
  }

  return {
    categories,
    categoryPath,
    workPath,
    workHref,
    worksInCategory(category: CreativeCategory): readonly CreativeProject[] {
      return byCategory.get(category) ?? [];
    },
    findWork(category: CreativeCategory, slug: string | null) {
      return slug === null ? undefined : byIdentity.get(identityKey(category, slug));
    },
    // Next.js params are already decoded; decoding again would corrupt literal percent signs.
    resolveRoute(path: readonly string[]): CreativeRoute | undefined {
      return routes.get(JSON.stringify(path));
    },
    staticParams() {
      return segments.map((slug) => ({ slug: [...slug] }));
    },
  };
}

export const creativeCatalog = createCreativeCatalog(creativeCategories, creativeProjects);
