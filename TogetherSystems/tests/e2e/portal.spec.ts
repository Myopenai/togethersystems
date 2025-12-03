/**
 * ============================================================================
 * E2E TESTS - PORTAL
 * TOGETHERSYSTEMS. INTERNATIONAL TTT
 * T,. E2E-Tests für Portal mit Playwright
 * ============================================================================
 */

import { test, expect } from '@playwright/test';

test.describe('T,. Portal E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8080/Portal/index.html');
  });

  test('sollte Portal erfolgreich laden', async ({ page }) => {
    await expect(page).toHaveTitle(/T,. TogetherSystems Portal/);
  });

  test('sollte Branding anzeigen', async ({ page }) => {
    const branding = page.locator('.branding');
    await expect(branding).toContainText('T,. TogetherSystems');
  });

  test('sollte Navigation funktionieren', async ({ page }) => {
    const navItem = page.locator('a[href="#architecture"]');
    await navItem.click();
    
    const section = page.locator('#architecture');
    await expect(section).toBeVisible();
  });

  test('sollte UTF-8 Encoding korrekt sein', async ({ page }) => {
    const content = await page.content();
    expect(content).toContain('<meta charset="utf-8">');
  });

  test('sollte Accessibility-Standards erfüllen', async ({ page }) => {
    // Prüfe auf ARIA-Labels
    const buttons = page.locator('button, a[role="button"]');
    const count = await buttons.count();
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      
      expect(ariaLabel || text).toBeTruthy();
    }
  });

  test('sollte 3D-Scene initialisieren', async ({ page }) => {
    const canvas = page.locator('#canvas3d');
    await expect(canvas).toBeVisible();
  });
});

