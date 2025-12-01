# Think Orders - Vollständige Test-Suite

## 📋 Übersicht

Dieses Verzeichnis enthält eine **vollständige automatisierte Test-Suite** für die Think Orders Applikation. Alle Funktionen und User-Flows werden getestet.

## 🎯 Was wird getestet?

### ✅ Navigation
- Alle Seiten-Navigationen
- URL-Hash-Routing
- Navigation-Aktiv-Status

### ✅ Home Dashboard
- Quick Stats Anzeige
- Quick Actions Funktionalität
- Stats-Updates

### ✅ Orders Management (CRUD)
- Order erstellen (kompletter Flow)
- Order anzeigen
- Order Status ändern
- Order löschen

### ✅ Products Management (CRUD)
- Produkt hinzufügen
- Produkt bearbeiten
- Produkt löschen

### ✅ Customers
- Automatische Customer-Erstellung aus Orders

### ✅ Invoices
- Automatische Invoice-Erstellung bei bezahlten Orders

### ✅ Settings
- Währung ändern
- Daten exportieren
- Daten importieren

### ✅ User Center
- User Information Anzeige

### ✅ Sign In
- Login-Funktionalität

### ✅ Data Persistence
- Daten bleiben nach Seitenwechsel erhalten
- Daten bleiben nach Reload erhalten

### ✅ Responsive Design
- Mobile View Tests

## 🚀 Schnellstart

### Installation

```bash
cd tests/think-orders
npm install
npx playwright install
```

### Tests ausführen

```bash
# Alle Tests
npm test

# Tests mit Browser (headed)
npm run test:headed

# Nur Chromium
npm run test:chromium

# Nur Firefox
npm run test:firefox

# Nur WebKit
npm run test:webkit

# Mobile Tests
npm run test:mobile

# Mit UI (visuell)
npm run test:ui

# Debug-Modus
npm run test:debug
```

## 📁 Struktur

```
tests/think-orders/
├── playwright.config.ts      # Playwright Konfiguration
├── think-orders.spec.ts      # Haupt-Test-Datei (alle Tests)
├── helpers/
│   └── test-helpers.ts       # Helper-Funktionen
├── package.json              # Dependencies
└── README.md                 # Diese Datei
```

## 🔧 Konfiguration

Die Konfiguration befindet sich in `playwright.config.ts`:

- **Timeout**: 30 Sekunden pro Test
- **Retries**: 2x bei CI, 0x lokal
- **Browser**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Reporter**: HTML, JSON, List

## 📊 Test-Ergebnisse

Nach dem Ausführen der Tests:

```bash
# HTML-Report anzeigen
npm run test:report
```

Die Reports werden erstellt in:
- `test-results/` - Screenshots, Videos, Traces
- `playwright-report/` - HTML-Report

## 🛠️ Erweiterte Nutzung

### Eigene Tests hinzufügen

Siehe `ERWEITERUNGS-ANLEITUNG.md` für detaillierte Anweisungen.

### Helper-Funktionen verwenden

```typescript
import { ThinkTestHelpers } from './helpers/test-helpers';

test('Mein Test', async ({ page }) => {
  const helpers = new ThinkTestHelpers(page);
  await helpers.navigateToRoute('/orders');
  await helpers.createTestOrder();
  // ...
});
```

## ✅ Best Practices

1. **Immer LocalStorage vor jedem Test leeren** (außer bei Persistence-Tests)
2. **Warte auf Seiten-Ladevorgänge** mit `waitForPageLoad()`
3. **Verwende Helper-Funktionen** für wiederkehrende Aufgaben
4. **Nimm Screenshots** bei wichtigen Schritten (automatisch bei Fehlern)

## 🐛 Troubleshooting

### Tests schlagen fehl

1. Prüfe ob HTML-Datei existiert: `THYNK-ORDERS-COMPLETE-ALL-PAGES.html`
2. Prüfe Browser-Installation: `npx playwright install`
3. Führe Tests mit `--headed` aus um zu sehen was passiert

### Langsame Tests

- Reduziere `workers` in `playwright.config.ts`
- Erhöhe `timeout` Werte bei langsamen Maschinen

## 📚 Weitere Dokumentation

- [Erweiterungs-Anleitung](ERWEITERUNGS-ANLEITUNG.md) - Tests erweitern für Dummies
- [Test-Features](TEST-FEATURES.md) - Alle verfügbaren Features

