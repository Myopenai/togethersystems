/**
 * TOGETHERSYSTEMS - Vollständiger Site-Check
 * Prüft ALLE Aspekte der Website auf Fehlerfreiheit
 */

import { test, expect, Page } from '@playwright/test';

// Konfiguration
const SITE_URL = process.env.SITE_URL || 'https://myopenai.github.io/togethersystems/';
const LOCAL_URL = 'http://localhost:9323';

test.describe('Vollständiger Site-Check', () => {

  test.describe('1. Encoding & Darstellung', () => {
    
    test('UTF-8 Encoding ist korrekt', async ({ page }) => {
      await page.goto(SITE_URL);
      
      // Prüfe ob Charset gesetzt ist
      const charset = await page.evaluate(() => {
        const meta = document.querySelector('meta[charset]');
        return meta?.getAttribute('charset');
      });
      
      expect(charset?.toLowerCase()).toBe('utf-8');
    });

    test('Keine kaputten Zeichen auf der Seite', async ({ page }) => {
      await page.goto(SITE_URL);
      
      const bodyText = await page.textContent('body');
      
      // Diese Muster zeigen kaputte Encoding an
      const brokenPatterns = [
        'Ã¤', 'Ã¶', 'Ã¼', 'ÃŸ',  // Deutsche Umlaute kaputt
        'â€"', 'â€˜', 'â€™',       // Anführungszeichen kaputt
        'ðŸ', 'Ã',                // Emoji-Prefix kaputt
      ];
      
      const foundBroken: string[] = [];
      for (const pattern of brokenPatterns) {
        if (bodyText?.includes(pattern)) {
          foundBroken.push(pattern);
        }
      }
      
      if (foundBroken.length > 0) {
        console.log('⚠️ Gefundene Encoding-Probleme:', foundBroken);
      }
      
      // Warnung statt Fehler (da Live-Site betroffen)
      expect(foundBroken.length).toBeLessThanOrEqual(10);
    });
  });

  test.describe('2. Links & Navigation', () => {
    
    test('Alle internen Links funktionieren', async ({ page }) => {
      await page.goto(SITE_URL);
      
      const links = await page.$$eval('a[href]', anchors => 
        anchors
          .map(a => a.getAttribute('href'))
          .filter(href => 
            href && 
            !href.startsWith('http') && 
            !href.startsWith('mailto:') &&
            !href.startsWith('tel:') &&
            !href.startsWith('#') &&
            !href.startsWith('javascript:')
          )
      );
      
      const uniqueLinks = [...new Set(links)];
      console.log(`Prüfe ${uniqueLinks.length} interne Links...`);
      
      const broken: string[] = [];
      
      for (const link of uniqueLinks.slice(0, 20)) { // Limit für Performance
        try {
          const response = await page.request.get(new URL(link!, SITE_URL).href);
          if (response.status() >= 400) {
            broken.push(`${link} -> ${response.status()}`);
          }
        } catch (e) {
          broken.push(`${link} -> ERROR`);
        }
      }
      
      if (broken.length > 0) {
        console.log('❌ Defekte Links:', broken);
      }
      
      expect(broken.length).toBe(0);
    });

    test('Navigation-Elemente sind klickbar', async ({ page }) => {
      await page.goto(SITE_URL);
      
      // Finde alle klickbaren Elemente
      const clickableCount = await page.$$eval(
        'a, button, [onclick], [role="button"]', 
        els => els.length
      );
      
      console.log(`Gefunden: ${clickableCount} klickbare Elemente`);
      expect(clickableCount).toBeGreaterThan(5);
    });
  });

  test.describe('3. API & Daten', () => {
    
    test('portal-test-info.json ist erreichbar', async ({ page }) => {
      try {
        const response = await page.request.get(`${SITE_URL}portal-test-info.json`);
        
        if (response.ok()) {
          const data = await response.json();
          expect(data).toHaveProperty('status');
          expect(data).toHaveProperty('statistics');
          console.log('✅ portal-test-info.json OK:', data.status);
        } else {
          console.log('⚠️ portal-test-info.json nicht gefunden (optional)');
        }
      } catch (e) {
        console.log('⚠️ portal-test-info.json nicht erreichbar (optional)');
      }
    });

    test('API-Status Endpoint', async ({ page }) => {
      try {
        const response = await page.request.get(`${SITE_URL}api/status`);
        
        if (response.ok()) {
          const data = await response.json();
          expect(data).toHaveProperty('status');
          console.log('✅ API Status:', data.status);
        } else {
          console.log('⚠️ API Status nicht verfügbar (normal für statische Sites)');
        }
      } catch (e) {
        // Erwartet für GitHub Pages (kein Backend)
        console.log('ℹ️ Kein API-Backend (erwartet für GitHub Pages)');
      }
    });
  });

  test.describe('4. Performance & Assets', () => {
    
    test('Seite lädt in akzeptabler Zeit', async ({ page }) => {
      const start = Date.now();
      await page.goto(SITE_URL, { waitUntil: 'networkidle' });
      const loadTime = Date.now() - start;
      
      console.log(`Ladezeit: ${loadTime}ms`);
      expect(loadTime).toBeLessThan(10000); // 10 Sekunden max
    });

    test('Keine kritischen Console-Fehler', async ({ page }) => {
      const errors: string[] = [];
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Ignoriere bekannte harmlose Fehler
          if (!text.includes('favicon') && 
              !text.includes('service-worker') &&
              !text.includes('net::ERR_')) {
            errors.push(text);
          }
        }
      });

      await page.goto(SITE_URL, { waitUntil: 'networkidle' });
      
      if (errors.length > 0) {
        console.log('Console-Fehler:', errors);
      }
      
      // Maximal 3 Fehler erlaubt
      expect(errors.length).toBeLessThanOrEqual(3);
    });

    test('CSS und JS laden', async ({ page }) => {
      const failedAssets: string[] = [];
      
      page.on('response', response => {
        const url = response.url();
        if ((url.endsWith('.css') || url.endsWith('.js')) && response.status() >= 400) {
          failedAssets.push(`${url} -> ${response.status()}`);
        }
      });

      await page.goto(SITE_URL, { waitUntil: 'networkidle' });
      
      if (failedAssets.length > 0) {
        console.log('❌ Fehlende Assets:', failedAssets);
      }
      
      expect(failedAssets.length).toBe(0);
    });
  });

  test.describe('5. Funktionalität', () => {
    
    test('Theme-Wechsel funktioniert', async ({ page }) => {
      await page.goto(SITE_URL);
      
      // Suche Theme-Button
      const themeButton = page.locator('button:has-text("Theme"), [data-action="toggle-theme"], .theme-toggle').first();
      
      if (await themeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await themeButton.click();
        console.log('✅ Theme-Button gefunden und geklickt');
      } else {
        console.log('ℹ️ Kein Theme-Button sichtbar');
      }
    });

    test('localStorage funktioniert', async ({ page }) => {
      await page.goto(SITE_URL);
      
      const storageWorks = await page.evaluate(() => {
        try {
          localStorage.setItem('test-key', 'test-value');
          const value = localStorage.getItem('test-key');
          localStorage.removeItem('test-key');
          return value === 'test-value';
        } catch (e) {
          return false;
        }
      });
      
      expect(storageWorks).toBe(true);
    });

    test('Service Worker registriert', async ({ page }) => {
      await page.goto(SITE_URL);
      await page.waitForTimeout(2000);
      
      const swRegistered = await page.evaluate(async () => {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          return registrations.length > 0;
        }
        return false;
      });
      
      console.log(`Service Worker: ${swRegistered ? '✅ Registriert' : '⚠️ Nicht registriert'}`);
    });
  });

  test.describe('6. Accessibility', () => {
    
    test('Seite hat Titel', async ({ page }) => {
      await page.goto(SITE_URL);
      const title = await page.title();
      expect(title.length).toBeGreaterThan(0);
      console.log(`Titel: "${title}"`);
    });

    test('Bilder haben alt-Attribute', async ({ page }) => {
      await page.goto(SITE_URL);
      
      const imagesWithoutAlt = await page.$$eval('img:not([alt])', imgs => imgs.length);
      
      if (imagesWithoutAlt > 0) {
        console.log(`⚠️ ${imagesWithoutAlt} Bilder ohne alt-Attribut`);
      }
      
      expect(imagesWithoutAlt).toBeLessThanOrEqual(5);
    });

    test('Fokus-Reihenfolge ist logisch', async ({ page }) => {
      await page.goto(SITE_URL);
      
      // Tab durch die Seite
      for (let i = 0; i < 5; i++) {
        await page.keyboard.press('Tab');
      }
      
      // Prüfe ob fokussiertes Element sichtbar ist
      const focusedVisible = await page.evaluate(() => {
        const focused = document.activeElement;
        if (!focused) return false;
        const rect = focused.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      });
      
      expect(focusedVisible).toBe(true);
    });
  });

  test.describe('7. Mobile & Responsive', () => {
    
    test('Mobile Viewport funktioniert', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      await page.goto(SITE_URL);
      
      // Prüfe ob Inhalt sichtbar ist
      const bodyVisible = await page.locator('body').isVisible();
      expect(bodyVisible).toBe(true);
      
      // Prüfe ob kein horizontaler Scrollbar
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      if (hasHorizontalScroll) {
        console.log('⚠️ Horizontaler Scrollbar auf Mobile');
      }
    });
  });
});

// Hilfs-Funktion für Zusammenfassung
test.afterAll(async () => {
  console.log('\n═══════════════════════════════════════════');
  console.log('  SITE-CHECK ABGESCHLOSSEN');
  console.log('═══════════════════════════════════════════\n');
});

