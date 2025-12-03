import { test, expect } from '@playwright/test';
import { ThinkTestHelpers } from './helpers/test-helpers';
import * as path from 'path';

/**
 * Vollständige Test-Suite für Think Orders App
 * Testet alle Funktionen und User-Flows
 */

const HTML_FILE_PATH = path.join(__dirname, '../../../THYNK-ORDERS-COMPLETE-ALL-PAGES.html');

test.describe('Think Orders - Navigation', () => {
  let helpers: ThinkTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new ThinkTestHelpers(page);
    await helpers.navigateToRoute('/');
    await helpers.waitForPageLoad();
  });

  test('Home-Seite sollte laden', async ({ page }) => {
    await helpers.isPageActive('page-home');
    await expect(page.locator('h1:has-text("THYNK ORDERS")')).toBeVisible();
  });

  test('Navigation zu User Center', async ({ page }) => {
    await helpers.clickNavLink('User Center');
    await helpers.isPageActive('page-userCenter');
    await helpers.isNavLinkActive('User Center');
  });

  test('Navigation zu Orders', async ({ page }) => {
    await helpers.clickNavLink('Orders');
    await helpers.isPageActive('page-orders');
    await helpers.isNavLinkActive('Orders');
  });

  test('Navigation zu Products', async ({ page }) => {
    await helpers.clickNavLink('Products');
    await helpers.isPageActive('page-products');
    await helpers.isNavLinkActive('Products');
  });

  test('Navigation zu Invoices', async ({ page }) => {
    await helpers.clickNavLink('Invoices');
    await helpers.isPageActive('page-invoices');
    await helpers.isNavLinkActive('Invoices');
  });

  test('Navigation zu Customers', async ({ page }) => {
    await helpers.clickNavLink('Customers');
    await helpers.isPageActive('page-customers');
    await helpers.isNavLinkActive('Customers');
  });

  test('Navigation zu Settings', async ({ page }) => {
    await helpers.clickNavLink('Settings');
    await helpers.isPageActive('page-settings');
    await helpers.isNavLinkActive('Settings');
  });

  test('Navigation zu Sign In', async ({ page }) => {
    await helpers.clickNavLink('Sign In');
    await helpers.isPageActive('page-sign-in');
    await helpers.isNavLinkActive('Sign In');
  });

  test('URL-Hash-Routing funktioniert', async ({ page }) => {
    await page.goto(`file://${HTML_FILE_PATH}#/orders`);
    await helpers.waitForPageLoad();
    await helpers.isPageActive('page-orders');
  });
});

test.describe('Think Orders - Home Dashboard', () => {
  let helpers: ThinkTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new ThinkTestHelpers(page);
    await helpers.navigateToRoute('/');
    await helpers.waitForPageLoad();
  });

  test('Quick Stats sollten angezeigt werden', async ({ page }) => {
    await expect(page.locator('#home-total-orders')).toBeVisible();
    await expect(page.locator('#home-total-revenue')).toBeVisible();
    await expect(page.locator('#home-pending-orders')).toBeVisible();
  });

  test('Quick Actions sollten funktionieren', async ({ page }) => {
    await page.click('button:has-text("View Orders")');
    await helpers.isPageActive('page-orders');
  });

  test('Stats werden aktualisiert', async ({ page }) => {
    // Erstelle Test-Order
    await helpers.createTestOrder();
    
    // Navigiere zurück zu Home
    await helpers.navigateToRoute('/');
    await helpers.waitForPageLoad();
    
    // Prüfe ob Stats aktualisiert wurden
    const totalOrders = await page.locator('#home-total-orders').textContent();
    expect(totalOrders).toContain('Total Orders: 1');
  });
});

test.describe('Think Orders - Orders Management', () => {
  let helpers: ThinkTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new ThinkTestHelpers(page);
    await helpers.clearLocalStorage();
    await helpers.navigateToRoute('/orders');
    await helpers.waitForPageLoad();
  });

  test('Orders-Seite sollte leer sein wenn keine Orders vorhanden', async ({ page }) => {
    await expect(page.locator('text=No orders found')).toBeVisible();
  });

  test('Neue Order erstellen - Navigation', async ({ page }) => {
    await page.click('button:has-text("New Order")');
    await helpers.isPageActive('page-orders-new');
  });

  test('Neue Order erstellen - Vollständiger Flow', async ({ page }) => {
    await page.click('button:has-text("New Order")');
    await helpers.waitForPageLoad();

    // Produkt hinzufügen
    await helpers.fillInput('#productName', 'Test Product');
    await helpers.fillInput('#productPrice', '29.99');
    await helpers.fillInput('#productQuantity', '2');
    await page.click('button:has-text("Add to Cart")');

    // Warenkorb prüfen
    await expect(page.locator('text=Test Product')).toBeVisible();
    await expect(page.locator('#cartTotal')).toContainText('59.98');

    // Kundendaten eingeben
    await helpers.fillInput('#customerName', 'Test Customer');
    await helpers.fillInput('#customerEmail', 'test@example.com');
    await helpers.fillInput('#customerAddress', 'Test Street 123');
    await helpers.fillInput('#customerPhone', '+1234567890');

    // Order erstellen - Alert-Handler vor Click registrieren
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    await page.click('button:has-text("Create Order")');
    await page.waitForTimeout(1000);

    // Prüfe ob Order erstellt wurde
    await helpers.isPageActive('page-orders');
    await expect(page.locator('text=Test Customer')).toBeVisible();
  });

  test('Order anzeigen', async ({ page }) => {
    const order = await helpers.createTestOrder();
    await helpers.navigateToRoute('/orders');
    await helpers.waitForPageLoad();

    // Alert-Handler vor Click registrieren
    page.on('dialog', async dialog => {
      await dialog.accept();
    });
    await page.click(`button[onclick*="${order.id}"]:has-text("👁️")`);
    await page.waitForTimeout(500);
  });

  test('Order Status ändern', async ({ page }) => {
    const order = await helpers.createTestOrder();
    await helpers.navigateToRoute('/orders');
    await helpers.waitForPageLoad();

    // Dialog-Handler für Status-Änderung
    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('prompt');
      await dialog.accept('2'); // paid
    });

    await page.click(`button[onclick*="${order.id}"]:has-text("✏️")`);
    await page.waitForTimeout(1000);

    // Prüfe ob Status geändert wurde
    await expect(page.locator('text=Paid')).toBeVisible();
  });

  test('Order löschen', async ({ page }) => {
    const order = await helpers.createTestOrder();
    await helpers.navigateToRoute('/orders');
    await helpers.waitForPageLoad();

    page.on('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });

    await page.click(`button[onclick*="${order.id}"]:has-text("🗑️")`);
    await page.waitForTimeout(1000);

    // Prüfe ob Order gelöscht wurde
    await expect(page.locator('text=No orders found')).toBeVisible();
  });
});

test.describe('Think Orders - Products Management', () => {
  let helpers: ThinkTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new ThinkTestHelpers(page);
    await helpers.clearLocalStorage();
    await helpers.navigateToRoute('/products');
    await helpers.waitForPageLoad();
  });

  test('Products-Seite sollte leer sein wenn keine Products vorhanden', async ({ page }) => {
    await expect(page.locator('text=No products found')).toBeVisible();
  });

  test('Produkt hinzufügen', async ({ page }) => {
    page.on('dialog', async dialog => {
      if (dialog.type() === 'prompt') {
        if (dialog.message().includes('Product Name')) {
          await dialog.accept('Test Product');
        } else if (dialog.message().includes('Price')) {
          await dialog.accept('29.99');
        } else if (dialog.message().includes('SKU')) {
          await dialog.accept('TEST-SKU-001');
        }
      }
    });

    await page.click('button:has-text("Add Product")');
    await page.waitForTimeout(2000);

    // Prüfe ob Product erstellt wurde
    await expect(page.locator('text=Test Product')).toBeVisible();
    await expect(page.locator('text=29.99')).toBeVisible();
  });

  test('Produkt bearbeiten', async ({ page }) => {
    await helpers.createTestProduct();
    await helpers.navigateToRoute('/products');
    await helpers.waitForPageLoad();

    const products = await helpers.getLocalStorage('thynk_products');
    const productId = products[0].id;

    page.on('dialog', async dialog => {
      if (dialog.type() === 'prompt') {
        if (dialog.message().includes('Product Name')) {
          await dialog.accept('Updated Product');
        } else if (dialog.message().includes('Price')) {
          await dialog.accept('39.99');
        }
      }
    });

    await page.click(`button[onclick*="${productId}"]:has-text("✏️")`);
    await page.waitForTimeout(2000);

    // Prüfe ob Product aktualisiert wurde
    await expect(page.locator('text=Updated Product')).toBeVisible();
  });

  test('Produkt löschen', async ({ page }) => {
    await helpers.createTestProduct();
    await helpers.navigateToRoute('/products');
    await helpers.waitForPageLoad();

    const products = await helpers.getLocalStorage('thynk_products');
    const productId = products[0].id;

    page.on('dialog', async dialog => {
      await dialog.accept();
    });

    await page.click(`button[onclick*="${productId}"]:has-text("🗑️")`);
    await page.waitForTimeout(1000);

    // Prüfe ob Product gelöscht wurde
    await expect(page.locator('text=No products found')).toBeVisible();
  });
});

test.describe('Think Orders - Customers', () => {
  let helpers: ThinkTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new ThinkTestHelpers(page);
    await helpers.clearLocalStorage();
  });

  test('Customers werden automatisch aus Orders erstellt', async ({ page }) => {
    await helpers.createTestOrder();
    await helpers.navigateToRoute('/customers');
    await helpers.waitForPageLoad();

    await expect(page.locator('text=Test Customer')).toBeVisible();
    await expect(page.locator('text=test@example.com')).toBeVisible();
  });
});

test.describe('Think Orders - Invoices', () => {
  let helpers: ThinkTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new ThinkTestHelpers(page);
    await helpers.clearLocalStorage();
  });

  test('Invoice wird automatisch bei bezahlter Order erstellt', async ({ page }) => {
    const order = await helpers.createTestOrder();
    
    // Order als bezahlt markieren
    const orders = await helpers.getLocalStorage('thynk_orders');
    orders[0].status = 'paid';
    await helpers.setLocalStorage('thynk_orders', orders);

    // Prüfe ob Invoice erstellt wurde
    await helpers.navigateToRoute('/invoices');
    await helpers.waitForPageLoad();

    await expect(page.locator('text=Invoice')).toBeVisible();
  });
});

test.describe('Think Orders - Settings', () => {
  let helpers: ThinkTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new ThinkTestHelpers(page);
    await helpers.navigateToRoute('/settings');
    await helpers.waitForPageLoad();
  });

  test('Währung ändern', async ({ page }) => {
    await page.selectOption('#currency', 'USD');
    
    // Alert-Handler vor Click registrieren
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Settings saved');
      await dialog.accept();
    });
    
    await page.click('button:has-text("Save Settings")');
    await page.waitForTimeout(500);

    // Prüfe ob Währung geändert wurde
    const settings = await helpers.getLocalStorage('thynk_settings');
    expect(settings.currency).toBe('USD');
  });

  test('Daten exportieren', async ({ page, context }) => {
    await helpers.createTestOrder();
    
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Backup")');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('thynk-orders-backup');
  });

  test('Daten importieren', async ({ page }) => {
    // Erstelle Test-Backup
    const testData = {
      orders: [{
        id: 'imported-order',
        order_number: 'IMPORT-001',
        status: 'pending',
        customer: { name: 'Imported Customer', email: 'import@example.com' },
        items: [],
        total_amount: 99.99,
        currency: 'EUR',
        created_at: new Date().toISOString()
      }],
      settings: { currency: 'EUR', currencySymbol: '€' },
      export_date: new Date().toISOString()
    };

    // Simuliere File Upload (vereinfacht - in echten Tests würde man einen File Input verwenden)
    await page.evaluate((data) => {
      localStorage.setItem('thynk_orders', JSON.stringify(data.orders));
      localStorage.setItem('thynk_settings', JSON.stringify(data.settings));
      location.reload();
    }, testData);

    await helpers.navigateToRoute('/orders');
    await helpers.waitForPageLoad();
    await expect(page.locator('text=Imported Customer')).toBeVisible();
  });
});

test.describe('Think Orders - User Center', () => {
  let helpers: ThinkTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new ThinkTestHelpers(page);
    await helpers.navigateToRoute('/userCenter');
    await helpers.waitForPageLoad();
  });

  test('User Information anzeigen', async ({ page }) => {
    await expect(page.locator('#user-id')).toBeVisible();
    await expect(page.locator('#last-login')).toBeVisible();
  });
});

test.describe('Think Orders - Sign In', () => {
  let helpers: ThinkTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new ThinkTestHelpers(page);
    await helpers.navigateToRoute('/sign-in');
    await helpers.waitForPageLoad();
  });

  test('Sign In Form sollte vorhanden sein', async ({ page }) => {
    await expect(page.locator('#username')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Sign In sollte funktionieren', async ({ page }) => {
    await helpers.fillInput('#username', 'testuser');
    await helpers.fillInput('#password', 'testpass');
    
    // Alert-Handler vor Click registrieren
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Signed in successfully');
      await dialog.accept();
    });
    
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1000);

    // Prüfe ob zu User Center navigiert wurde
    await helpers.isPageActive('page-userCenter');
  });
});

test.describe('Think Orders - Data Persistence', () => {
  let helpers: ThinkTestHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new ThinkTestHelpers(page);
  });

  test('Daten bleiben nach Seitenwechsel erhalten', async ({ page }) => {
    await helpers.clearLocalStorage();
    await helpers.createTestOrder();
    
    // Navigiere zu verschiedenen Seiten
    await helpers.navigateToRoute('/products');
    await helpers.navigateToRoute('/customers');
    await helpers.navigateToRoute('/orders');
    
    // Prüfe ob Order noch vorhanden
    await expect(page.locator('text=Test Customer')).toBeVisible();
  });

  test('Daten bleiben nach Reload erhalten', async ({ page }) => {
    await helpers.clearLocalStorage();
    await helpers.createTestOrder();
    
    await page.reload();
    await helpers.waitForPageLoad();
    
    await helpers.navigateToRoute('/orders');
    await expect(page.locator('text=Test Customer')).toBeVisible();
  });
});

test.describe('Think Orders - Responsive Design', () => {
  test('Mobile View sollte funktionieren', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto(`file://${HTML_FILE_PATH}#/`);
    await page.waitForLoadState('networkidle');

    // Prüfe ob Navigation sichtbar ist
    await expect(page.locator('nav')).toBeVisible();
    
    // Prüfe ob Content sichtbar ist
    await expect(page.locator('h1:has-text("THYNK ORDERS")')).toBeVisible();
  });
});

