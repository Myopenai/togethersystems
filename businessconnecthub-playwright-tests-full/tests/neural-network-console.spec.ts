// Test für Neural Network Console
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:9323';

test.describe('Neural Network Console', () => {
  test('Neural Network Console lädt', async ({ page }) => {
    await page.goto(`${BASE_URL}/neural-network-console.html`);
    await page.waitForTimeout(2000);
    
    await expect(page).toHaveTitle(/Neural Network Console/);
  });

  test('AI-Operationen sind verfügbar', async ({ page }) => {
    await page.goto(`${BASE_URL}/neural-network-console.html`);
    await page.waitForTimeout(2000);
    
    const operations = page.locator('select, [data-operation]');
    await expect(operations.first()).toBeVisible();
  });

  test('Eingabefelder sind vorhanden', async ({ page }) => {
    await page.goto(`${BASE_URL}/neural-network-console.html`);
    await page.waitForTimeout(2000);
    
    const textareas = page.locator('textarea');
    await expect(textareas.first()).toBeVisible();
  });

  test('Ergebnis-Anzeige ist vorhanden', async ({ page }) => {
    await page.goto(`${BASE_URL}/neural-network-console.html`);
    await page.waitForTimeout(2000);
    
    const resultDiv = page.locator('.result, [id*="result"]');
    await expect(resultDiv.first()).toBeVisible();
  });
});


