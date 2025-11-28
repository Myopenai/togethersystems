import { test, expect } from '@playwright/test';

const URL = '/TELBANK/index.html';

test.describe('TELBANK – MetaMask-Konsole (Smoke)', () => {
  test('TELBANK-Seite lädt und zeigt Wallet-Bereich', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});

    await expect(page.getByText(/TPGA Telbank/i).first()).toBeVisible();
    await expect(page.locator('#walletAccount').first()).toBeVisible();
    await expect(page.locator('#walletNetwork').first()).toBeVisible();
  });

  test('Inflow- und Outflow-Formulare sind vorhanden', async ({ page }) => {
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForLoadState('networkidle').catch(() => {});

    await expect(page.locator('#inFiatAmount').first()).toBeVisible();
    await expect(page.locator('#inCryptoAmount').first()).toBeVisible();
    await expect(page.locator('#addInflowButton').first()).toBeVisible();

    await expect(page.locator('#outCryptoAmount').first()).toBeVisible();
    await expect(page.locator('#outFiatAmount').first()).toBeVisible();
    await expect(page.locator('#addOutflowButton').first()).toBeVisible();
  });
});



