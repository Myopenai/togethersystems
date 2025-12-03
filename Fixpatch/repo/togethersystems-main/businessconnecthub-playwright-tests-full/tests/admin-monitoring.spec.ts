import { test, expect } from '@playwright/test';

const URL = '/admin-monitoring.html';

test.describe('Admin-Monitoring – Events & Telemetrie (Smoke)', () => {
  test('Seite lädt und zeigt Ereignis-Stream', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});

    await expect(page.getByRole('heading', { name: /Monitoring/i }).first()).toBeVisible();
    await expect(page.getByText(/Ereignis-Stream/i).first()).toBeVisible();

    const table = page.locator('table').first();
    await expect(table).toBeVisible();
  });

  test('Kurzstatistik-Badges sind vorhanden', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});

    await expect(page.getByText(/Gesamt:/i).first()).toBeVisible();
    await expect(page.getByText(/Voucher:/i).first()).toBeVisible();
    await expect(page.getByText(/Hypotheken:/i).first()).toBeVisible();
    await expect(page.getByText(/Transfers:/i).first()).toBeVisible();
  });
});



