import { expect, test } from '@playwright/test';

test('a viewing session adds one history entry and browser Forward reopens the series overview', async ({
  page,
}) => {
  await page.goto('/creative/photography');
  const work = page.getByRole('link', { name: /Sample Series/ });
  await work.click();
  await expect(page).toHaveURL('/creative/photography?work=sample-series');
  await page.getByRole('button', { name: 'Enlarge Sample Series, image 1' }).click();
  await page.getByRole('button', { name: 'Next', exact: false }).click();
  await expect(page.getByText('Sample Series / 2 of 2')).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL('/creative/photography');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(work).toBeFocused();
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');

  await page.goForward();
  await expect(page).toHaveURL('/creative/photography?work=sample-series');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enlarge Sample Series, image 1' })).toBeVisible();
  await expect(page.getByText('Sample Series / 2 of 2')).toHaveCount(0);

  await page.getByRole('button', { name: 'Back to works' }).click();
  await expect(page).toHaveURL('/creative/photography');
  await expect(work).toBeFocused();
});

test('series position survives photo viewing, reopening, and client navigation but resets on reload', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 600 });
  await page.goto('/creative/photography');
  const work = page.getByRole('link', { name: /Sample Series/ });
  const viewer = page.getByRole('dialog');
  const secondPhoto = page.getByRole('button', { name: 'Enlarge Sample Series, image 2' });
  await work.click();
  await secondPhoto.scrollIntoViewIfNeeded();
  await expect.poll(() => viewer.evaluate((element) => element.scrollTop)).toBeGreaterThan(0);
  const seriesScroll = await viewer.evaluate((element) => element.scrollTop);
  await secondPhoto.click();
  await expect(page.getByText('Sample Series / 2 of 2')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(secondPhoto).toBeFocused();
  await expect
    .poll(async () =>
      Math.abs((await viewer.evaluate((element) => element.scrollTop)) - seriesScroll),
    )
    .toBeLessThan(2);

  await page.keyboard.press('Escape');
  await expect(viewer).toHaveCount(0);
  await expect(work).toBeFocused();
  await work.click();
  await expect(secondPhoto).toBeVisible();
  await expect(page.getByText('Sample Series / 2 of 2')).toHaveCount(0);
  await expect
    .poll(async () =>
      Math.abs((await viewer.evaluate((element) => element.scrollTop)) - seriesScroll),
    )
    .toBeLessThan(2);
  await page.keyboard.press('Escape');
  await expect(viewer).toHaveCount(0);

  await page
    .getByRole('link', { name: /^Back to Creative$/i })
    .first()
    .click();
  await page.getByRole('link', { name: /VFX \/ FILM/ }).click();
  await page.getByRole('link', { name: /Film Study/ }).click();
  await expect(page.getByText('Film coming soon.')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(viewer).toHaveCount(0);
  await page
    .getByRole('link', { name: /^Back to Creative$/i })
    .first()
    .click();
  await page.getByRole('link', { name: /PHOTOGRAPHY/ }).click();
  await work.click();
  await expect
    .poll(async () =>
      Math.abs((await viewer.evaluate((element) => element.scrollTop)) - seriesScroll),
    )
    .toBeLessThan(2);

  await page.reload();
  await expect(viewer).toBeVisible();
  await expect(page.getByRole('button', { name: 'Enlarge Sample Series, image 1' })).toBeVisible();
  await expect.poll(() => viewer.evaluate((element) => element.scrollTop)).toBe(0);
});

test('shared work links close locally while browser Back keeps the external entry', async ({
  page,
  baseURL,
}) => {
  const externalEntry = 'https://example.test/shared-work';
  await page.route(externalEntry, (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: `<a href="${baseURL}/creative/photography/sample-series">Open shared series</a>`,
    }),
  );
  await page.goto(externalEntry);
  await page.getByRole('link', { name: 'Open shared series' }).click();
  await expect(page).toHaveURL('/creative/photography?work=sample-series');
  await page.getByRole('button', { name: 'Enlarge Sample Series, image 1' }).click();
  await page.goBack();
  await expect(page).toHaveURL(externalEntry);

  await page.getByRole('link', { name: 'Open shared series' }).click();
  await page.getByRole('button', { name: 'Back to works' }).click();
  await expect(page).toHaveURL('/creative/photography');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  await page.goBack();
  await expect(page).toHaveURL(externalEntry);
});
