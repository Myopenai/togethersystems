import { chromium, expect, test } from '@playwright/test';

test('Home loads and portal button is visible', async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:9323/';
  await page.goto(baseURL, { waitUntil: 'networkidle' });
  await expect(page.getByRole('link', { name: 'Portal öffnen' })).toBeVisible();
  await browser.close();
});