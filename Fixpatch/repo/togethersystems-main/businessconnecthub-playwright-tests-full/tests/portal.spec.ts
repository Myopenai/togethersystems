import { test, expect } from '@playwright/test';

// Base-URL wird in playwright.config.ts gesetzt, wir testen relativ.
const PORTAL_URL = '/manifest-portal.html';

test.describe('Manifest-Portal – neue Architektur (Smoke & Multi-User)', () => {
  test('Portal lädt und zeigt Kernbereiche', async ({ page }) => {
    await page.goto(PORTAL_URL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});

    // Haupttitel & Untertitel
    const h1 = page.locator('h1', { hasText: /Manifest of Thinkers.*Portal/i }).first();
    await expect(h1).toBeVisible();

    const subtitle = page.getByText(/Öffentliche Ansicht.*nur lesen/i).first();
    await expect(subtitle).toBeVisible();

    // Navigationslinks oben (Brand-Bar)
    await expect(page.getByRole('link', { name: 'Portal-Hilfe', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Manifest', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Online-Portal', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Wabenräume', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Legal-Hub', exact: true })).toBeVisible();
  });

  test('Voucher-, Events- und Buchungsbereiche sind vorhanden', async ({ page }) => {
    await page.goto(PORTAL_URL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});

    // Voucher & Termine
    const voucherPanel = page.getByRole('heading', { name: /Voucher.*Termine/i });
    await expect(voucherPanel.first()).toBeVisible();

    await expect(page.getByRole('button', { name: /Ich bin Kunde/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Ich bin Anbieter/i })).toBeVisible();

    // Branchen-Template-Buttons
    await expect(page.getByRole('button', { name: /Beratung/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Therapie/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Haus.*Besichtigung/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Maschinenzeit/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Membership/i })).toBeVisible();

    // Events & Memberships Panel
    await expect(page.getByRole('heading', { name: /Events.*Memberships/i }).first()).toBeVisible();

    // Vertikale Konsolen & Meine Buchungen
    await expect(page.getByRole('heading', { name: /Vertikale Konsolen/i }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: /Meine Buchungen/i }).first()).toBeVisible();
  });

  test('Live-Raum- und Chat-UI ist vorhanden (auch wenn noch inaktiv)', async ({ page }) => {
    await page.goto(PORTAL_URL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});

    // Live-Raum-Container existiert
    const liveRoom = page.locator('#liveRoom');
    await expect(liveRoom).toHaveCount(1);

    // Chat-Elemente existieren im DOM
    const chatInput = page.locator('#liveChatInput');
    const chatSend = page.locator('#liveChatSendBtn');
    await expect(chatInput).toHaveCount(1);
    await expect(chatSend).toHaveCount(1);
  });

  test('Verifizierungsbereich ist sichtbar', async ({ page }) => {
    await page.goto(PORTAL_URL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});

    const verifyBtn = page.locator('#verifyBtn');
    const tokenInput = page.locator('#token');
    await expect(verifyBtn.first()).toBeVisible();
    await expect(tokenInput.first()).toBeVisible();
  });

  test('Multi-User Smoke: Drei parallele Sitzungen können das Portal laden', async ({ browser }) => {
    const ctx1 = await browser.newContext();
    const ctx2 = await browser.newContext();
    const ctx3 = await browser.newContext();

    const page1 = await ctx1.newPage();
    const page2 = await ctx2.newPage();
    const page3 = await ctx3.newPage();

    await Promise.all([
      page1.goto(PORTAL_URL, { waitUntil: 'load' }),
      page2.goto(PORTAL_URL, { waitUntil: 'load' }),
      page3.goto(PORTAL_URL, { waitUntil: 'load' }),
    ]);

    await Promise.all([
      expect(page1.locator('h1', { hasText: /Manifest of Thinkers/i }).first()).toBeVisible(),
      expect(page2.locator('h1', { hasText: /Manifest of Thinkers/i }).first()).toBeVisible(),
      expect(page3.locator('h1', { hasText: /Manifest of Thinkers/i }).first()).toBeVisible(),
    ]);

    await Promise.all([ctx1.close(), ctx2.close(), ctx3.close()]);
  });

  test('⚖️ Gleichgewichts-Börse Tab ist vorhanden', async ({ page }) => {
    await page.goto(PORTAL_URL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});

    const boerseTab = page.locator('#navBalancedExchange');
    await expect(boerseTab).toBeVisible();
    await expect(boerseTab).toContainText('Börse');
  });

  test('Gleichgewichts-Börse Panel öffnet sich', async ({ page }) => {
    await page.goto(PORTAL_URL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});

    await page.click('#navBalancedExchange');
    await page.waitForTimeout(500);

    const panel = page.locator('#balanced-exchange-panel');
    await expect(panel).toBeVisible();
  });

  test('💬 Nachrichten Tab ist vorhanden', async ({ page }) => {
    await page.goto(PORTAL_URL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});

    const messagesTab = page.locator('#navMessages');
    await expect(messagesTab).toBeVisible();
    await expect(messagesTab).toContainText('Nachrichten');
  });

  test('Nachrichten Panel öffnet sich', async ({ page }) => {
    await page.goto(PORTAL_URL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});

    await page.click('#navMessages');
    await page.waitForTimeout(500);

    const panel = page.locator('#messages-panel');
    await expect(panel).toBeVisible();
  });

  test('Nachrichten-System Features sind vorhanden', async ({ page }) => {
    await page.goto(PORTAL_URL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});

    await page.click('#navMessages');
    await page.waitForTimeout(500);

    await expect(page.locator('#btnMessagesInbox')).toBeVisible();
    await expect(page.locator('#btnMessagesOutbox')).toBeVisible();
    await expect(page.locator('#btnMessagesCompose')).toBeVisible();
    await expect(page.locator('#btnSyncMessages')).toBeVisible();
  });
});

