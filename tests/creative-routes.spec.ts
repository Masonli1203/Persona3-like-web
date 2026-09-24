import { expect, test } from '@playwright/test';

test('all shared work entry routes open the same viewer as their category links', async ({
  page,
}) => {
  for (const [entry, category, slug, title] of [
    ['/creative/film-study', 'vfx-film', 'film-study', 'Film Study'],
    ['/creative/form-study', '3d', 'form-study', 'Form Study'],
    ['/creative/motion-study', 'ai-experiments', 'motion-study', 'Motion Study'],
    ['/creative/photography/sample-series', 'photography', 'sample-series', 'Sample Series'],
  ]) {
    await page.goto(entry);
    const href = `/creative/${category}?work=${slug}`;
    await expect(page).toHaveURL(href);
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(
      page.getByRole('dialog').getByRole('heading', { name: title, exact: true }),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Back to works' }).click();
    await expect(page).toHaveURL(`/creative/${category}`);
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('link', { name: new RegExp(title) })).toHaveAttribute('href', href);
  }
});

test('invalid work queries keep the category usable and encoded queries select the work', async ({
  page,
}) => {
  for (const query of ['work=', 'work=unknown', 'work=sample-series']) {
    await page.goto(`/creative/vfx-film?${query}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('VFX / FILM');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await page.getByRole('link', { name: /Film Study/ }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page).toHaveURL(`/creative/vfx-film?${query}`);
  }
  await page.goto('/creative/vfx-film?work=%66ilm-study');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: 'Film Study', exact: true }),
  ).toBeVisible();
});

test('unknown and incorrectly nested work paths return not found', async ({ page }) => {
  for (const path of [
    '/creative/unknown',
    '/creative/sample-series',
    '/creative/photography/film-study',
    '/creative/film-study/extra',
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: '404', exact: true })).toBeVisible();
  }
});
