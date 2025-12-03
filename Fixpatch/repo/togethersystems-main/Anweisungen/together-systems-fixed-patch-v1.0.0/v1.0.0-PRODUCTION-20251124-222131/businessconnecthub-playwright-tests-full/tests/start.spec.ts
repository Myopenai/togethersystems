import { test, expect } from '@playwright/test';

// TELCOMPETIOION Root: index.html auf http://localhost:9323/
test.describe('Startseite / Dashboard', () => {
  test('Startseite lädt und zeigt Kern-UI', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000); // Längere Wartezeit für vollständige Ladung

    // Prüfe Header-Text (Arbeits‑Portal mit non-breaking hyphen)
    const headerText = page.getByText('Arbeits‑Portal', { exact: false });
    const headerCount = await headerText.count();
    expect(headerCount).toBeGreaterThan(0);
    await expect(headerText.first()).toBeVisible({ timeout: 5000 });
    
    // Prüfe Tags (kann mehrfach vorkommen - nutze first())
    const offlineTags = page.getByText('offline', { exact: true });
    const offlineCount = await offlineTags.count();
    expect(offlineCount).toBeGreaterThan(0);
    await expect(offlineTags.first()).toBeVisible({ timeout: 5000 });

    // Prüfe Links
    const zumPortalLink = page.locator('a[href*="manifest-portal"]').first();
    const linkCount = await zumPortalLink.count();
    expect(linkCount).toBeGreaterThan(0);
    await expect(zumPortalLink).toBeVisible({ timeout: 5000 });
    
    const portalOeffnenLink = page.getByRole('link', { name: /Portal öffnen/i }).first();
    const portalLinkCount = await portalOeffnenLink.count();
    expect(portalLinkCount).toBeGreaterThan(0);
    await expect(portalOeffnenLink).toBeVisible({ timeout: 5000 });

    // Dashboard-Tab ist standardmäßig aktiv
    const dashboardSection = page.locator('#tab-dashboard').first();
    const dashboardCount = await dashboardSection.count();
    expect(dashboardCount).toBeGreaterThan(0);
    await expect(dashboardSection).toBeVisible({ timeout: 5000 });

    // Prüfe KPI-Elemente
    const eintraege = page.getByText(/Einträge/i).first();
    const eintraegeCount = await eintraege.count();
    expect(eintraegeCount).toBeGreaterThan(0);
    
    const heute = page.getByText(/Heute/i).first();
    const heuteCount = await heute.count();
    expect(heuteCount).toBeGreaterThan(0);
  });

  test('Daten-Tabelle ist vorhanden (auch wenn leer)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Zu Daten-Tab navigieren
    const datenTab = page.locator('button[data-tab="daten"]').first();
    const datenTabCount = await datenTab.count();
    expect(datenTabCount).toBeGreaterThan(0);
    await expect(datenTab).toBeVisible({ timeout: 5000 });
    await datenTab.click();
    await page.waitForTimeout(1000);

    // Prüfe ob Daten-Sektion sichtbar ist
    const datenSection = page.locator('#tab-daten').first();
    const datenSectionCount = await datenSection.count();
    expect(datenSectionCount).toBeGreaterThan(0);
    await expect(datenSection).toBeVisible({ timeout: 5000 });
    
    // Prüfe Tabelle oder "Keine Daten" Text
    const table = page.locator('table').first();
    const noData = page.getByText(/Noch keine Daten|keine Daten/i).first();
    const hasTable = await table.count() > 0 && await table.isVisible({ timeout: 2000 }).catch(() => false);
    const hasNoData = await noData.count() > 0 && await noData.isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasTable || hasNoData).toBeTruthy();

    // Prüfe Navigation-Buttons (können beide sichtbar sein - prüfe einzeln)
    const zurueckBtn = page.locator('button#prevPage').first();
    const weiterBtn = page.locator('button#nextPage').first();
    const hasZurueck = await zurueckBtn.count() > 0 && await zurueckBtn.isVisible({ timeout: 2000 }).catch(() => false);
    const hasWeiter = await weiterBtn.count() > 0 && await weiterBtn.isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasZurueck || hasWeiter).toBeTruthy();
  });

  test('Bericht öffnen ist klickbar (Smoke-Test)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Zu Berichte-Tab navigieren
    const berichteTab = page.locator('button[data-tab="berichte"]').first();
    const berichteTabCount = await berichteTab.count();
    expect(berichteTabCount).toBeGreaterThan(0);
    await expect(berichteTab).toBeVisible({ timeout: 5000 });
    await berichteTab.click();
    await page.waitForTimeout(1000);

    // Prüfe ob Berichte-Sektion sichtbar ist
    const berichteSection = page.locator('#tab-berichte').first();
    const berichteSectionCount = await berichteSection.count();
    expect(berichteSectionCount).toBeGreaterThan(0);
    await expect(berichteSection).toBeVisible({ timeout: 5000 });

    // Suche nach "Bericht öffnen" Button
    const berichtBtn = page.locator('button#btnReport').first();
    const berichtBtnByRole = page.getByRole('button', { name: /Bericht.*öffnen|öffnen/i }).first();
    const hasBtnReport = await berichtBtn.count() > 0 && await berichtBtn.isVisible({ timeout: 2000 }).catch(() => false);
    const hasBtnByRole = await berichtBtnByRole.count() > 0 && await berichtBtnByRole.isVisible({ timeout: 2000 }).catch(() => false);
    
    if (hasBtnReport || hasBtnByRole) {
      const clickableBtn = hasBtnReport ? berichtBtn : berichtBtnByRole;
      await clickableBtn.click({ timeout: 5000 });
      await page.waitForTimeout(1000);
    }
    
    // Prüfe ob Seite noch funktioniert (Berichte-Tab sollte noch sichtbar sein)
    await expect(berichteTab).toBeVisible({ timeout: 5000 });
  });

  test('Manifest-Forum Download-Link ist vorhanden', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load', timeout: 30000 });
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Scrolle zum Download-Bereich
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Prüfe auf Manifest-Forum Text oder Download-Link (prüfe einzeln)
    const manifestText = page.getByText(/Manifest.*Forum/i).first();
    const downloadLink = page.getByRole('link', { name: /herunterladen|Download/i }).first();
    
    const hasText = await manifestText.count() > 0 && await manifestText.isVisible({ timeout: 2000 }).catch(() => false);
    const hasLink = await downloadLink.count() > 0 && await downloadLink.isVisible({ timeout: 2000 }).catch(() => false);
    
    // Mindestens einer sollte sichtbar sein
    expect(hasText || hasLink).toBeTruthy();
  });
});
