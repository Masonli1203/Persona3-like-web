import type { Metadata } from 'next';
import { site } from '@/data/site';
import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import {
  creativeCategories,
  creativeProjects,
  creativePath,
  categoryPath,
  findCreativeProject,
} from '@/data/creativeProjects';
import { CreativeCategoryGallery } from '@/components/creative/category-gallery';
import styles from '@/components/creative/creative.module.css';

type Props = { params: Promise<{ slug: string[] }> };
export function generateStaticParams() {
  return [
    ...creativeCategories.map((category) => ({ slug: [category.id] })),
    ...creativeProjects.map((project) => ({
      slug: creativePath(project).replace('/creative/', '').split('/'),
    })),
  ];
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category =
    slug.length === 1 && creativeCategories.find((category) => category.id === slug[0]);
  const project = findCreativeProject(slug);
  return { title: `${category ? category.title : project?.title || 'Creative'} — ${site.name}` };
}
export default async function CreativeCategoryPage({ params }: Props) {
  const { slug } = await params;
  const category =
    slug.length === 1 && creativeCategories.find((category) => category.id === slug[0]);
  if (!category) {
    const project = findCreativeProject(slug);
    if (project) redirect(`${categoryPath(project.category)}?work=${project.slug}`);
    notFound();
  }
  return (
    <section className={styles.categoryPage}>
      <header className={styles.categoryHeading}>
        <span className="micro">{category.number} / CREATIVE</span>
        <h1>{category.title}</h1>
      </header>
      <Suspense fallback={<p>Loading works…</p>}>
        <CreativeCategoryGallery category={category.id} />
      </Suspense>
    </section>
  );
}
