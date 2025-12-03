import { test, expect } from '@playwright/test';

const URL = '/business-admin.html';

test.describe('Business-Admin – echte Vouchers & Buchungen (Smoke)', () => {
  test('Seite lädt und zeigt beide Übersichten', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});

    await expect(page.getByRole('heading', { name: /Business-Admin/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Meine gebuchten Termine/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Meine Vouchers/i }).first()).toBeVisible();
  });

  test('Tabellen für Holder- und Issuer-Daten existieren', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});

    const tables = page.locator('table');
    await expect(tables).toHaveCount(2);

    const holderInfo = page.locator('#holderInfo');
    const issuerInfo = page.locator('#issuerInfo');
    await expect(holderInfo.first()).toBeVisible();
    await expect(issuerInfo.first()).toBeVisible();
  });
});



