// Test für Gleichgewichts-Börse
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:9323';

test.describe('Gleichgewichts-Börse', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/manifest-portal.html`);
    await page.waitForTimeout(2000);
  });

  test('⚖️ Börse-Tab ist sichtbar', async ({ page }) => {
    const boerseTab = page.locator('#navBalancedExchange');
    await expect(boerseTab).toBeVisible();
    await expect(boerseTab).toContainText('Börse');
  });

  test('Gleichgewichts-Börse-Panel öffnet sich', async ({ page }) => {
    await page.click('#navBalancedExchange');
    await page.waitForTimeout(500);
    
    const panel = page.locator('#balanced-exchange-panel');
    await expect(panel).toBeVisible();
  });

  test('Instrumente laden funktioniert', async ({ page }) => {
    await page.click('#navBalancedExchange');
    await page.waitForTimeout(500);
    
    const loadBtn = page.locator('#btnLoadInstruments');
    await expect(loadBtn).toBeVisible();
    
    await loadBtn.click();
    await page.waitForTimeout(1000);
    
    const instrumentsList = page.locator('#instrumentsList');
    await expect(instrumentsList).toBeVisible();
  });

  test('Real-Bilanz-Waage ist sichtbar', async ({ page }) => {
    await page.click('#navBalancedExchange');
    await page.waitForTimeout(500);
    
    const waage = page.locator('#balanceWaage');
    await expect(waage).toBeVisible();
  });

  test('Erklärung des Systems ist sichtbar', async ({ page }) => {
    await page.click('#navBalancedExchange');
    await page.waitForTimeout(500);
    
    const explanation = page.locator('text=Wie funktioniert die Gleichgewichts-Börse');
    await expect(explanation).toBeVisible();
  });
});


