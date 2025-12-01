// T,. OSTOSOS - Pre-Build Test System
// Tests MÜSSEN vor jedem Build ausgeführt werden

const PRE_BUILD_TESTS = {
  async runAllTests() {
    console.log('[PRE-BUILD] Starte alle Tests...');
    const results = {
      passed: 0,
      failed: 0,
      errors: []
    };

    const tests = [
      { name: 'HTML-Struktur', func: this.testHTMLStructure },
      { name: 'CSS-Laden', func: this.testCSSLoading },
      { name: 'JavaScript-Ausführung', func: this.testJavaScript },
      { name: 'LocalStorage', func: this.testLocalStorage },
      { name: 'IndexedDB', func: this.testIndexedDB },
      { name: 'Service Worker', func: this.testServiceWorker },
      { name: 'Da Vinci Design System', func: this.testDaVinciSystem },
      { name: 'Settings-Integration', func: this.testSettingsIntegration },
      { name: 'Navigation', func: this.testNavigation },
      { name: 'Cross-Platform', func: this.testCrossPlatform },
      { name: 'Donation-Integration', func: this.testDonationIntegration },
      { name: 'Root-Apps-Integration', func: this.testRootAppsIntegration },
      { name: 'THYNK-Integration', func: this.testTHYNKIntegration },
      { name: 'Settings-Integration-Updated', func: this.testSettingsIntegrationUpdated }
    ];

    for (const test of tests) {
      try {
        const result = await test.func();
        if (result) {
          results.passed++;
          console.log(`[PRE-BUILD] ✅ ${test.name}: Bestanden`);
        } else {
          results.failed++;
          results.errors.push(`${test.name}: Fehlgeschlagen`);
          console.error(`[PRE-BUILD] ❌ ${test.name}: Fehlgeschlagen`);
        }
      } catch (error) {
        results.failed++;
        results.errors.push(`${test.name}: ${error.message}`);
        console.error(`[PRE-BUILD] ❌ ${test.name}: ${error.message}`);
      }
    }

    console.log(`[PRE-BUILD] Tests abgeschlossen: ${results.passed} bestanden, ${results.failed} fehlgeschlagen`);
    
    if (results.failed > 0) {
      console.error('[PRE-BUILD] ⚠️ BUILD BLOCKIERT - Tests fehlgeschlagen!');
      throw new Error(`Build blockiert: ${results.failed} Tests fehlgeschlagen`);
    }

    return results;
  },

  testHTMLStructure() {
    return document.documentElement && document.documentElement.tagName === 'HTML';
  },

  testCSSLoading() {
    const stylesheets = Array.from(document.styleSheets);
    return stylesheets.length > 0;
  },

  testJavaScript() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  },

  testLocalStorage() {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      return false;
    }
  },

  testIndexedDB() {
    return typeof indexedDB !== 'undefined';
  },

  testServiceWorker() {
    return 'serviceWorker' in navigator;
  },

  testDaVinciSystem() {
    return typeof window.DaVinciStandard !== 'undefined' || 
           document.querySelector('[class*="davinci"]') !== null;
  },

  testSettingsIntegration() {
    // Prüfe ob Settings-System verfügbar ist
    return localStorage.getItem('ostosos.installed') !== null || 
           typeof window.ENV !== 'undefined';
  },

  testNavigation() {
    return typeof window.location !== 'undefined' && 
           typeof window.history !== 'undefined';
  },

  testCrossPlatform() {
    const platform = navigator.platform;
    return platform.includes('Win') || platform.includes('Mac') || platform.includes('Linux');
  },

  // NEUE TESTS - Updated
  async testDonationIntegration() {
    return typeof window.DonationIntegration !== 'undefined' || 
           document.querySelector('script[src*="DONATION-INTEGRATION"]') !== null;
  },

  async testRootAppsIntegration() {
    return typeof window.RootAppsIntegration !== 'undefined' || 
           document.querySelector('script[src*="ROOT-APPS-INTEGRATION"]') !== null;
  },

  async testTHYNKIntegration() {
    return typeof window.THYNKLaborPrototyp !== 'undefined' || 
           document.querySelector('script[src*="thynk"]') !== null;
  },

  async testSettingsIntegrationUpdated() {
    // Erweiterte Settings-Prüfung
    return localStorage.getItem('ostosos.installed') !== null || 
           typeof window.ENV !== 'undefined' ||
           typeof window.Settings !== 'undefined';
  }
};

// Auto-Run wenn als Modul geladen
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PRE_BUILD_TESTS;
}

// Global verfügbar machen
window.PRE_BUILD_TESTS = PRE_BUILD_TESTS;

