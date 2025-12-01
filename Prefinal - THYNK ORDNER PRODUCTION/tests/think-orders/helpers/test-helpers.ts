import { Page, expect } from '@playwright/test';
import * as path from 'path';

/**
 * Helper-Funktionen für Think Orders Tests
 */
export class ThinkTestHelpers {
  constructor(public page: Page) {}

  /**
   * Navigiere zu einer Route
   */
  async navigateToRoute(route: string) {
    await this.page.goto(`file://${path.join(__dirname, '../../../THYNK-ORDERS-COMPLETE-ALL-PAGES.html')}#${route}`);
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Warte bis Seite geladen ist
   */
  async waitForPageLoad() {
    await this.page.waitForSelector('#app', { state: 'visible' });
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForTimeout(500); // Kurze Pause für JavaScript-Initialisierung
  }

  /**
   * Prüfe ob eine Seite aktiv ist
   */
  async isPageActive(pageId: string) {
    const page = this.page.locator(`#${pageId}`);
    await expect(page).toBeVisible();
    await expect(page).toHaveClass(/active/);
  }

  /**
   * Klicke auf Navigation-Link
   */
  async clickNavLink(linkText: string) {
    await this.page.click(`nav a:has-text("${linkText}")`);
    await this.page.waitForTimeout(500);
  }

  /**
   * Prüfe Navigation-Aktiv-Status
   */
  async isNavLinkActive(linkText: string) {
    const navLink = this.page.locator(`nav a:has-text("${linkText}")`);
    await expect(navLink).toHaveClass(/active/);
  }

  /**
   * Fülle Formular-Feld
   */
  async fillInput(selector: string, value: string) {
    await this.page.fill(selector, value);
  }

  /**
   * Klicke Button
   */
  async clickButton(text: string) {
    await this.page.click(`button:has-text("${text}")`);
    await this.page.waitForTimeout(500);
  }

  /**
   * Prüfe ob Text vorhanden ist
   */
  async expectText(text: string) {
    await expect(this.page.locator(`text=${text}`).first()).toBeVisible();
  }

  /**
   * Warte auf Alert und akzeptiere
   */
  async acceptAlert(expectedText?: string) {
    this.page.on('dialog', async dialog => {
      if (expectedText) {
        expect(dialog.message()).toContain(expectedText);
      }
      await dialog.accept();
    });
  }

  /**
   * Lösche alle LocalStorage-Daten
   */
  async clearLocalStorage() {
    await this.page.evaluate(() => {
      localStorage.clear();
    });
  }

  /**
   * Setze LocalStorage-Daten
   */
  async setLocalStorage(key: string, value: any) {
    await this.page.evaluate(({ key, value }) => {
      localStorage.setItem(key, JSON.stringify(value));
    }, { key, value });
  }

  /**
   * Lese LocalStorage-Daten
   */
  async getLocalStorage(key: string): Promise<any> {
    return await this.page.evaluate((key) => {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }, key);
  }

  /**
   * Erstelle Test-Order
   */
  async createTestOrder() {
    const order = {
      id: 'test-order-' + Date.now(),
      order_number: 'TEST-ORD-001',
      status: 'pending',
      payment_status: 'pending',
      customer: {
        name: 'Test Customer',
        email: 'test@example.com',
        address: 'Test Street 123',
        phone: '+1234567890'
      },
      items: [{
        id: 1,
        name: 'Test Product',
        price: 29.99,
        quantity: 2,
        total: 59.98
      }],
      total_amount: 59.98,
      currency: 'EUR',
      created_at: new Date().toISOString()
    };
    
    const orders = await this.getLocalStorage('thynk_orders') || [];
    orders.push(order);
    await this.setLocalStorage('thynk_orders', orders);
    
    return order;
  }

  /**
   * Erstelle Test-Product
   */
  async createTestProduct() {
    const product = {
      id: 'test-product-' + Date.now(),
      name: 'Test Product',
      price: 29.99,
      sku: 'TEST-SKU-001',
      created_at: new Date().toISOString()
    };
    
    const products = await this.getLocalStorage('thynk_products') || [];
    products.push(product);
    await this.setLocalStorage('thynk_products', products);
    
    return product;
  }

  /**
   * Screenshot aufnehmen
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  /**
   * Warte auf Element
   */
  async waitForElement(selector: string, timeout = 5000) {
    await this.page.waitForSelector(selector, { timeout, state: 'visible' });
  }
}

