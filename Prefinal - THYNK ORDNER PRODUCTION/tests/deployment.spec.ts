import { test, expect } from '@playwright/test';

test.describe('THYNK ORDERS Deployment Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/index.html');
  });

  test('should load index.html', async ({ page }) => {
    await expect(page).toHaveTitle(/THYNK ORDERS/);
  });

  test('should have all tabs', async ({ page }) => {
    await expect(page.locator('text=Bestellungen')).toBeVisible();
    await expect(page.locator('text=Neue Bestellung')).toBeVisible();
    await expect(page.locator('text=Statistiken')).toBeVisible();
    await expect(page.locator('text=Einstellungen')).toBeVisible();
  });

  test('should have theme switcher', async ({ page }) => {
    const themeSwitcher = page.locator('#themeToggle, .theme-switcher, [onchange*="toggleTheme"]');
    await expect(themeSwitcher.first()).toBeVisible({ timeout: 5000 });
  });

  test('should create order', async ({ page }) => {
    // Gehe zu "Neue Bestellung" Tab
    await page.click('text=Neue Bestellung');
    
    // Fülle Produkt ein
    await page.fill('#productName', 'Test Produkt');
    await page.fill('#productPrice', '29.99');
    await page.fill('#productQuantity', '1');
    
    // Klicke "Zum Warenkorb"
    await page.click('text=Zum Warenkorb, button:has-text("Zum Warenkorb")');
    
    // Fülle Kundendaten
    await page.fill('#customerName', 'Test Kunde');
    await page.fill('#customerEmail', 'test@example.com');
    
    // Erstelle Bestellung
    await page.click('text=Bestellung erstellen, button:has-text("Bestellung erstellen")');
    
    // Prüfe ob Bestellung erstellt wurde
    await page.click('text=Bestellungen');
    await expect(page.locator('text=Test Kunde, text=test@example.com')).toBeVisible({ timeout: 5000 });
  });

  test('should display statistics', async ({ page }) => {
    await page.click('text=Statistiken');
    await expect(page.locator('#totalOrders, text=Gesamt')).toBeVisible();
  });
});

