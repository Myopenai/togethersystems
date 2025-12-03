import { test, expect } from '@playwright/test';

const URL = '/legal-hub.html';

test.describe('Legal-Hub – Verträge & Verknüpfungen (Smoke)', () => {
  test('Legal-Hub-Header & Brand-Bar sichtbar', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});

    await expect(page.getByRole('heading', { name: /Legal/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Portal/i }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /Manifest/i }).first()).toBeVisible();
  });

  test('Vertrags-Upload-Formular und Tabelle existieren', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});

    const fileInput = page.locator('#contractFile');
    await expect(fileInput).toHaveCount(1);

    const voucherInput = page.locator('#contractVoucherId');
    const roomInput = page.locator('#contractRoomId');
    await expect(voucherInput).toHaveCount(1);
    await expect(roomInput).toHaveCount(1);

    const tableBody = page.locator('#contractLinkTableBody');
    await expect(tableBody).toHaveCount(1);
  });
});



