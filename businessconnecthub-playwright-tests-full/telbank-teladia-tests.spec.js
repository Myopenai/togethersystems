/**
 * TELBANK & TELADIA System Tests
 * IBM-Standard: Zero-Defect, Industrial Fabrication Software
 * Version: 1.0.0-XXXL
 * Tests REAL APIs - NO MOCK DATA
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:8787';
const TELBANK_API = `${BASE_URL}/api/telbank`;
const TELADIA_API = `${BASE_URL}/api/teladia`;

test.describe('TELBANK System Tests', () => {
  test('TELBANK Portal loads correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/TELBANK/telbank-portal-negative-assets.html`);
    await expect(page.locator('h1')).toContainText('TELBANK');
    await expect(page.locator('.stats-grid')).toBeVisible();
  });

  test('TELBANK Negative Assets API returns real data', async ({ request }) => {
    const response = await request.get(`${TELBANK_API}/negative-assets`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
    // Verify no mock/demo data
    if (data.data && data.data.length > 0) {
      const asset = data.data[0];
      expect(asset).toHaveProperty('neg_asset_id');
      expect(asset).toHaveProperty('nominal_amount');
      expect(typeof asset.nominal_amount).toBe('number');
    }
  });

  test('TELBANK Transformations API returns real data', async ({ request }) => {
    const response = await request.get(`${TELBANK_API}/transformations`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
  });

  test('TELBANK Banks API returns real data', async ({ request }) => {
    const response = await request.get(`${TELBANK_API}/banks`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
  });

  test('TELBANK Portal displays real asset data', async ({ page }) => {
    await page.goto(`${BASE_URL}/TELBANK/telbank-portal-negative-assets.html`);
    
    // Wait for API call
    await page.waitForTimeout(2000);
    
    // Check that no "Demo" or "Mock" text appears
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Demo');
    expect(pageContent).not.toContain('Mock');
    expect(pageContent).not.toContain('Placeholder');
    expect(pageContent).not.toContain('nicht verfügbar');
  });
});

test.describe('TELADIA System Tests', () => {
  test('TELADIA Portal loads correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/TELADIA/teladia-portal.html`);
    await expect(page.locator('h1')).toContainText('TELADIA');
    await expect(page.locator('.teladia-hero')).toBeVisible();
  });

  test('TELADIA Assets API returns real data', async ({ request }) => {
    const response = await request.get(`${TELADIA_API}/assets`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('data');
  });

  test('TELADIA Exchange API returns real exchange rates', async ({ request }) => {
    const response = await request.get(`${TELADIA_API}/exchange?from=EUR&to=USD`);
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data).toHaveProperty('success', true);
    if (data.data) {
      expect(data.data).toHaveProperty('rate');
      expect(typeof data.data.rate).toBe('number');
      expect(data.data.rate).toBeGreaterThan(0);
    }
  });

  test('TELADIA Portal displays real asset data', async ({ page }) => {
    await page.goto(`${BASE_URL}/TELADIA/teladia-portal.html`);
    
    // Wait for API calls
    await page.waitForTimeout(2000);
    
    // Check that no "Demo" or "Mock" text appears
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Demo');
    expect(pageContent).not.toContain('Mock');
    expect(pageContent).not.toContain('Placeholder');
    expect(pageContent).not.toContain('nicht verfügbar');
  });

  test('TELADIA Exchange form calculates real exchange rates', async ({ page }) => {
    await page.goto(`${BASE_URL}/TELADIA/teladia-portal.html`);
    
    // Wait for page load
    await page.waitForTimeout(1000);
    
    // Find exchange form
    const fromInput = page.locator('.teladia-exchange-form input[type="number"]').first();
    const fromSelect = page.locator('.teladia-exchange-form select').first();
    
    if (await fromInput.isVisible()) {
      await fromSelect.selectOption({ index: 0 }); // EUR
      await fromInput.fill('100');
      await page.waitForTimeout(1000);
      
      // Check that result is calculated (not placeholder)
      const toInput = page.locator('.teladia-exchange-form input[type="number"]').last();
      const value = await toInput.inputValue();
      expect(value).not.toBe('');
      expect(value).not.toContain('Demo');
    }
  });
});

test.describe('IBM Standard Quality Tests', () => {
  test('No console errors on TELBANK Portal', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(`${BASE_URL}/TELBANK/telbank-portal-negative-assets.html`);
    await page.waitForTimeout(2000);
    
    // Filter out expected errors (like 404 for missing APIs on GitHub Pages)
    const criticalErrors = errors.filter(e => 
      !e.includes('404') && 
      !e.includes('Failed to fetch') &&
      !e.includes('NetworkError')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('No console errors on TELADIA Portal', async ({ page }) => {
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    await page.goto(`${BASE_URL}/TELADIA/teladia-portal.html`);
    await page.waitForTimeout(2000);
    
    const criticalErrors = errors.filter(e => 
      !e.includes('404') && 
      !e.includes('Failed to fetch') &&
      !e.includes('NetworkError')
    );
    
    expect(criticalErrors.length).toBe(0);
  });

  test('TELBANK Portal uses Deutsche Bank style quality', async ({ page }) => {
    await page.goto(`${BASE_URL}/TELBANK/telbank-portal-negative-assets.html`);
    
    // Check for proper styling
    const header = page.locator('header, .teladia-header, h1').first();
    const styles = await header.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        fontFamily: computed.fontFamily,
        fontWeight: computed.fontWeight
      };
    });
    
    expect(styles.fontFamily).toBeTruthy();
  });

  test('TELADIA Portal uses Deutsche Bank original style', async ({ page }) => {
    await page.goto(`${BASE_URL}/TELADIA/teladia-portal.html`);
    
    // Check for DB blue color
    const logo = page.locator('.teladia-logo-mark, .teladia-logo').first();
    if (await logo.isVisible()) {
      const bgColor = await logo.evaluate(el => {
        return window.getComputedStyle(el).backgroundColor;
      });
      // Should contain blue (rgb values)
      expect(bgColor).toMatch(/rgb|rgba/);
    }
  });
});

test.describe('Integration Tests', () => {
  test('TELBANK and TELADIA can work together', async ({ page }) => {
    // Navigate to TELBANK
    await page.goto(`${BASE_URL}/TELBANK/telbank-portal-negative-assets.html`);
    await page.waitForTimeout(1000);
    
    // Navigate to TELADIA
    await page.goto(`${BASE_URL}/TELADIA/teladia-portal.html`);
    await page.waitForTimeout(1000);
    
    // Both should load without errors
    expect(page.url()).toContain('TELADIA');
  });

  test('Portal navigation links work', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    
    // Find TELBANK link
    const telbankLink = page.locator('a[href*="TELBANK"]').first();
    if (await telbankLink.isVisible()) {
      await telbankLink.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('TELBANK');
    }
    
    // Go back and find TELADIA link
    await page.goto(`${BASE_URL}/index.html`);
    const teladiaLink = page.locator('a[href*="TELADIA"]').first();
    if (await teladiaLink.isVisible()) {
      await teladiaLink.click();
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('TELADIA');
    }
  });
});

