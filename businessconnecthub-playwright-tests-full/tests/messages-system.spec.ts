// Test für Nachrichten-System
import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:9323';

test.describe('Nachrichten-System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE_URL}/manifest-portal.html`);
    await page.waitForTimeout(2000);
  });

  test('💬 Nachrichten-Tab ist sichtbar', async ({ page }) => {
    const messagesTab = page.locator('#navMessages');
    await expect(messagesTab).toBeVisible();
    await expect(messagesTab).toContainText('Nachrichten');
  });

  test('Nachrichten-Panel öffnet sich', async ({ page }) => {
    await page.click('#navMessages');
    await page.waitForTimeout(500);
    
    const panel = page.locator('#messages-panel');
    await expect(panel).toBeVisible();
  });

  test('Inbox/Outbox-Tabs sind sichtbar', async ({ page }) => {
    await page.click('#navMessages');
    await page.waitForTimeout(500);
    
    const inboxBtn = page.locator('#btnMessagesInbox');
    const outboxBtn = page.locator('#btnMessagesOutbox');
    
    await expect(inboxBtn).toBeVisible();
    await expect(outboxBtn).toBeVisible();
  });

  test('Nachricht verfassen-Formular ist sichtbar', async ({ page }) => {
    await page.click('#navMessages');
    await page.waitForTimeout(500);
    
    const composeBtn = page.locator('#btnMessagesCompose');
    const toInput = page.locator('#messageToInput');
    const bodyInput = page.locator('#messageBodyInput');
    
    await expect(composeBtn).toBeVisible();
    await expect(toInput).toBeVisible();
    await expect(bodyInput).toBeVisible();
  });

  test('Sync-Button ist vorhanden', async ({ page }) => {
    await page.click('#navMessages');
    await page.waitForTimeout(500);
    
    const syncBtn = page.locator('#btnSyncMessages');
    await expect(syncBtn).toBeVisible();
  });
});


