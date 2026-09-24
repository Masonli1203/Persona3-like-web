import { expect, test } from '@playwright/test';
import { getProject, projects } from '../src/data/works';
import { profile } from '../src/data/profile';
import { site } from '../src/data/site';

test('project list links and detail headings share the project title and destination', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const project of projects) {
    if (!project.caseStudyHref) continue;
    await page.goto('/projects');
    const link = page.getByRole('link', {
      name: `${project.title} — read the case study`,
      exact: true,
    });
    await expect(link.locator('.micro')).toHaveText(project.number);
    await expect(link).toHaveAttribute('href', project.caseStudyHref);
    await link.focus();
    const preview = page.locator('.project-preview-panel[data-active="true"]');
    await expect(preview.getByRole('heading')).toHaveText(project.title);
    await expect(preview.locator('.project-preview-link')).toHaveAttribute(
      'href',
      project.caseStudyHref,
    );
    await link.click();
    await expect(page).toHaveURL(project.caseStudyHref);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      `${project.title.toUpperCase()}.`,
    );
    await expect(page).toHaveTitle(`${project.title} — ${site.name}`);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    await expect(page.locator('.module-heading > p')).toHaveText(description!);
    expect(description).not.toBe(project.description);
  }
  expect(errors).toEqual([]);
});

test('About resolves selected project titles and links while retaining its own summary', async ({
  page,
}) => {
  for (const entry of profile.projects) {
    const project = getProject(entry.projectId);
    await page.goto('/about');
    const item = page
      .locator('.about-projects > li')
      .filter({ has: page.getByRole('heading', { name: project.title, exact: true }) });
    await expect(item.locator('.micro')).toHaveText(entry.medium);
    await expect(item.locator('p')).toHaveText(entry.description);
    if (project.caseStudyHref) {
      const link = item.getByRole('link', { name: /Read the case study/ });
      await expect(link).toHaveAttribute('href', project.caseStudyHref);
      await link.click();
      await expect(page).toHaveURL(project.caseStudyHref);
      await expect(page).toHaveTitle(`${project.title} — ${site.name}`);
    } else {
      await expect(item.getByRole('link')).toHaveCount(0);
    }
  }
});

test('an unlinked project remains a selectable preview with its display number', async ({
  page,
}) => {
  const project = getProject('next-project');
  await page.goto('/projects');
  const row = page.getByRole('button', { name: new RegExp(project.title) });
  await row.click();
  await expect(page).toHaveURL('/projects');
  await expect(row).toHaveAttribute('aria-pressed', 'true');
  await expect(row.locator('.micro')).toHaveText(project.number);
  const preview = page.locator('.project-preview-panel[data-active="true"]');
  await expect(preview.getByRole('heading')).toHaveText(project.title);
  await expect(preview.getByRole('img')).toHaveAccessibleName(
    `PROJECT / ${project.number}: ${project.label.toLowerCase()}`,
  );
  await expect(preview.getByRole('link')).toHaveCount(0);
});
