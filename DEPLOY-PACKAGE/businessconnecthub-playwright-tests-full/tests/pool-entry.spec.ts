import { test, expect } from '@playwright/test';

// "Pool-Einstieg" – No-Code-Flow testen:
// 1. Startseite -> Manifest-Portal öffnen
// 2. No-Code-Bereiche sichtbar: Token-Generator, Daten laden, Live-Raum-Formular

test.describe('Pool-Einstieg – No-Code-Flow', () => {
  test('Startseite -> Portal öffnen -> No-Code-Bereiche sichtbar', async ({ page }) => {
    // Schritt 1: Startseite laden
    await page.goto('/', { waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

    // Arbeits-Portal sollte erkennbar sein
    await expect(page.getByText(/Arbeits.?Portal/i).first()).toBeVisible();

    // Button/Link "Portal öffnen" anklicken (Schwimmbad-Einstieg)
    const portalOpen = page.getByRole('link', { name: /Portal öffnen/i }).first()
      .or(page.getByRole('button', { name: /Portal öffnen/i }).first());
    const count = await portalOpen.count();
    expect(count).toBeGreaterThan(0);
    await portalOpen.first().click();

    // Schritt 2: Manifest-Portal Seite sollte geladen sein
    await page.waitForLoadState('load', { timeout: 30000 });
    await expect(page.getByText(/Manifest of Thinkers – Portal/i).first()).toBeVisible();

    // No-Code 1: Verifizierung + Token-URL-Generator
    await expect(
      page.getByText(/Verifizierung \(nur Offline-Forum-Nutzer\)/i).first()
    ).toBeVisible();
    await expect(
      page.getByText(/Token-URL generieren \(No.?Code\)/i).first()
    ).toBeVisible();

    // No-Code 2: Daten laden – JSON importieren & API-URL
    await expect(page.getByText(/Daten laden/i).first()).toBeVisible();
    await expect(page.getByText(/JSON importieren/i).first()).toBeVisible();
    await expect(page.getByPlaceholder(/https:\/\/deine-seite\.tld\/api\/manifest\/list/i)).toBeVisible();

    // No-Code 3: Live-Raum erstellen – Formular statt JSON
    await expect(page.getByText(/Live-Raum erstellen \(No.?Code\)/i).first()).toBeVisible();
    await expect(page.getByPlaceholder(/Raum-ID \(z\. B\. post-123 oder wabe A-2\)/i)).toBeVisible();
    
    // Button kann mit verschiedenen Bindestrichen sein (normal oder non-breaking)
    const button = page.locator('button#buildRoomJsonBtn').first()
      .or(page.getByRole('button', { name: /Raum.*JSON anzeigen/i }).first());
    await expect(button).toBeVisible({ timeout: 10000 });
  });
});


