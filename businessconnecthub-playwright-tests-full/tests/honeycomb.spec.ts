import { test, expect } from '@playwright/test';

const URL = '/honeycomb.html';

test.describe('Wabenräume – Honeycomb (Smoke)', () => {
  test('Wabenübersicht & aktuelle Auswahl sind sichtbar', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});

    await expect(page.getByRole('heading', { name: /Wabenräume/i }).first()).toBeVisible();
    await expect(page.locator('#honeycomb')).toBeVisible();
    await expect(page.locator('#currentCell')).toBeVisible();
  });

  test('Klick auf eine Wabe aktualisiert Seitenpanel', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});

    const firstCell = page.locator('.cell').first();
    await expect(firstCell).toBeVisible();
    const before = await page.locator('#currentCell').innerText();

    await firstCell.click();
    await page.waitForTimeout(500);

    const after = await page.locator('#currentCell').innerText();
    expect(after).not.toEqual(before);
  });
});



