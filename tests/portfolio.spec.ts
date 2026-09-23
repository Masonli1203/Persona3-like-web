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

test('creative categories, media dialogs, and project selection respond to interaction', async ({
  page,
}) => {
  await page.goto('/creative');
  await page.getByRole('link', { name: /VFX \/ FILM/ }).click();
  await page.waitForURL('**/creative/vfx-film');
  await page.getByRole('link', { name: /Film Study/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByText('Film coming soon.')).toBeVisible();
  await page.getByRole('button', { name: 'Back to works' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.goto('/projects');
  await page.locator('.project-row').nth(1).focus();
  await expect(page.locator('[data-active="true"] h2')).toHaveText('Interface Study');
  await expect(page.locator('.project-row').nth(1)).toHaveAttribute('data-selected', 'true');
  await page.locator('.project-row').nth(1).click();
  await page.waitForURL('**/projects/interface-study');
});

test('the styled cursor survives clock and circle transitions without remounting', async ({
  page,
}) => {
  await page.goto('/');
  const cursor = page.locator('.ink-cursor');
  await expect(cursor).toBeAttached();
  await page.mouse.move(120, 160);
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
    await page.locator(`.chapter-link[href="/${route}"]`).first().click();
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

test('photo deep links support next, back to series, and closing without a prior entry', async ({
  page,
}) => {
  await page.goto('/creative/photography/sample-series');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Enlarge Sample Series, image 1' }).click();
  await expect(page.getByText('Sample Series / 1 of 2')).toBeVisible();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.getByText('Sample Series / 2 of 2')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Enlarge Sample Series, image 2' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveURL(/\/creative\/photography$/);
});

test('case study and configurator work, with no missing assets or client errors', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  await page.goto('/projects/sample-project');
  await page.getByRole('button', { name: /Sample project illustration/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.goto('/projects/space-configurator');
  await page.getByRole('button', { name: 'Compact', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Compact', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.getByText('4.80 m²', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset' }).click();
  await expect(page.getByText('8.32 m²', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('default profile does not publish contact links', async ({ page }) => {
  await page.goto('/about');
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(page.locator('a[href$=".pdf"]')).toHaveCount(0);
  await expect(page).toHaveTitle('About — Your Name');
});
