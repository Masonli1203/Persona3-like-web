import type { Metadata } from 'next';
import { site } from '@/data/site';
import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { creativeCatalog } from '@/features/creative/catalog';
import { CreativeCategoryGallery } from '@/features/creative/category-gallery';
import styles from '@/features/creative/creative.module.css';

type Props = { params: Promise<{ slug: string[] }> };
export function generateStaticParams() {
  return creativeCatalog.staticParams();
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const route = creativeCatalog.resolveRoute(slug);
  const title = route?.kind === 'category' ? route.category.title : route?.work.title;
  return { title: `${title || 'Creative'} — ${site.name}` };
}
export default async function CreativeCategoryPage({ params }: Props) {
  const { slug } = await params;
  const route = creativeCatalog.resolveRoute(slug);
  if (!route) notFound();
  if (route.kind === 'work') redirect(creativeCatalog.workHref(route.work));
  const { category } = route;
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
