import { expect, test } from '@playwright/test';

test('all routes load directly with generic identity and no horizontal overflow', async ({
  page,
}) => {
  for (const [route, title] of [
    ['/', 'YOUR'],
    ['/creative', 'CREATIVE'],
    ['/projects', 'PROJECTS'],
    ['/about', 'ABOUT'],
  ]) {
    await page.goto(route);
    await expect(page.locator('h1')).toContainText(title);
    await expect(page.getByRole('link', { name: 'Your Name home' })).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflow).toBe(false);
  }
});

test('work filters, study notes, and project selection respond to interaction', async ({
  page,
}) => {
  await page.goto('/creative');
  await page.getByRole('button', { name: 'Moving image', exact: true }).click();
  await expect(page.locator('.work-card')).toHaveCount(2);
  await expect(page.locator('.work-count')).toHaveText('02 ENTRIES');
  const notes = page.locator('.work-notes').first();
  await notes.locator('summary').click();
  await expect(notes).toHaveAttribute('open', '');
  await expect(notes.locator('p')).toBeVisible();

  await page.goto('/projects');
  await page.locator('.project-row').nth(1).focus();
  await expect(page.locator('#project-detail h2')).toHaveText('Project / 02');
  await expect(page.locator('.project-row').nth(1)).toHaveAttribute('aria-pressed', 'true');
});

test('the styled cursor survives clock and circle transitions without remounting', async ({
  page,
}) => {
  await page.goto('/');
  await page.mouse.move(120, 160);
  const cursor = page.locator('.ink-cursor');
  await expect(cursor).toHaveCSS('opacity', '1');
  await expect(page.locator('body')).toHaveCSS('cursor', 'none');
  await cursor.evaluate((element) => {
    element.setAttribute('data-test-persist', 'yes');
  });

  await page.locator('#section-navigation a[href="/creative"]').click();
  await expect(page.locator('.chapter-transition')).toBeVisible();
  await expect(cursor).toHaveAttribute('data-test-persist', 'yes');
  await page.waitForURL('**/creative');
  await expect(page.locator('.chapter-transition')).toHaveCount(0);
  await expect(cursor).toHaveAttribute('data-test-persist', 'yes');

  for (const route of ['projects', 'about']) {
    await page.locator(`.chapter-link[href="/${route}"]`).click();
    await expect(page.locator('.circle-transition')).toBeVisible();
    await expect(cursor).toHaveAttribute('data-test-persist', 'yes');
    await page.waitForURL(`**/${route}`);
    await expect(page.locator('.chapter-transition')).toHaveCount(0);
    await expect(cursor).toHaveCSS('opacity', '1');
    await expect(page.locator('.ink-cursor')).toHaveCount(1);
    await expect(page.locator('body')).toHaveCSS('cursor', 'none');
  }
  await page.locator('.index-link').click();
  await page.waitForURL('/');
  await expect(cursor).toHaveAttribute('data-test-persist', 'yes');
});

test('reduced motion retains direct navigation and the native pointer', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.mouse.move(120, 160);
  await expect(page.locator('.cursor-layer')).toHaveCount(0);
  await expect(page.locator('.motion-toggle')).toBeDisabled();
  await page.locator('#section-navigation a[href="/creative"]').click();
  await page.waitForURL('**/creative');
  await expect(page.locator('.chapter-transition')).toHaveCount(0);
  await expect(page.locator('#module-content')).toBeFocused();
  await page.goBack();
  await expect(page.locator('h1')).toContainText('YOUR');
});

test.describe('touch layout', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  test('routes remain readable and do not render a mouse cursor', async ({ page }) => {
    for (const route of ['/', '/creative', '/projects', '/about']) {
      await page.goto(route);
      await expect(page.locator('h1')).toBeVisible();
      await expect(page.locator('.cursor-layer')).toHaveCount(0);
      const layout = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > window.innerWidth,
        bodySize: parseFloat(
          getComputedStyle(document.querySelector('.intro p, .module-heading > p')!).fontSize,
        ),
      }));
      expect(layout.overflow).toBe(false);
      expect(layout.bodySize).toBeGreaterThanOrEqual(16);
    }
  });
});
