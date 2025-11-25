// Test für Production Dashboard
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:9323';

test.describe('Production Dashboard', () => {
  test('Production Dashboard Seite lädt', async ({ page }) => {
    await page.goto(`${BASE_URL}/production-dashboard.html`);
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveTitle(/Production Dashboard/);
  });

  test('Global KPIs sind sichtbar', async ({ page }) => {
    await page.goto(`${BASE_URL}/production-dashboard.html`);
    await page.waitForTimeout(2000);
    
    const kpis = page.locator('.kpi');
    await expect(kpis.first()).toBeVisible();
  });

  test('Production Progress Sektion ist vorhanden', async ({ page }) => {
    await page.goto(`${BASE_URL}/production-dashboard.html`);
    await page.waitForTimeout(2000);
    
    const progressSection = page.locator('text=Production Progress');
    await expect(progressSection).toBeVisible();
  });

  test('Error Behavior Sektion ist vorhanden', async ({ page }) => {
    await page.goto(`${BASE_URL}/production-dashboard.html`);
    await page.waitForTimeout(2000);
    
    const errorSection = page.locator('text=Error Behavior');
    await expect(errorSection).toBeVisible();
  });

  test('Backup Status ist sichtbar', async ({ page }) => {
    await page.goto(`${BASE_URL}/production-dashboard.html`);
    await page.waitForTimeout(2000);
    
    const backupSection = page.locator('text=Backup Status');
    await expect(backupSection).toBeVisible();
  });
});


