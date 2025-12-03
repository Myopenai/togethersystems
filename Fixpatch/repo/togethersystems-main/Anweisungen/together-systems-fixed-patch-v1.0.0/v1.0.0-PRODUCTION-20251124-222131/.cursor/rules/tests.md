# E2E-Test- und Automations-Regeln für TogetherSystems Portal

## 1. Test-Suite (Playwright)

- **Framework**: Playwright (`@playwright/test`)
- **Testprojekt**: `businessconnecthub-playwright-tests-full`
- **Konfigurationsdatei**: `businessconnecthub-playwright-tests-full/playwright.config.ts`
- **Testverzeichnis**: `businessconnecthub-playwright-tests-full/tests`

### 1.1 Standard-Befehle

- **Vom Projekt-Root aus** (empfohlen):
  - `npm run test:e2e`  
    → führt die Chromium-Tests im Unterordner `businessconnecthub-playwright-tests-full` aus.
- **Direkt im Test-Ordner**:
  - `cd businessconnecthub-playwright-tests-full`
  - `npx playwright test --project=Chromium`

### 1.2 Basis-URL / Server

- **Lokal (Default in Config)**:
  - Basis-URL: `http://localhost:9323`
  - Vor den Tests MUSS im Projekt-Root laufen:
    - `python -m http.server 9323`
- **Gegen Cloudflare Pages (ohne lokalen Server)**:
  - `PLAYWRIGHT_BASE_URL="https://ts-portal.pages.dev" npm run test:e2e`

## 2. Wann Tests automatisch ausführen

Cursor / der Agent soll nach **größeren Änderungen** an diesen Dateien IMMER `npm run test:e2e` ausführen:

- `index.html`
- `manifest-forum.html`
- `manifest-portal.html`
- `admin.html`
- `admin-monitoring.html`
- `business-admin.html`
- `honeycomb.html`
- `legal-hub.html`
- `TELBANK/**`
- `functions/api/**`
- `functions/ws.js`
- `mot-core.js`
- alle Dateien unter `businessconnecthub-playwright-tests-full/tests/**`

Regel:

1. Code ändern.
2. `npm run test:e2e` ausführen.
3. Testergebnisse auswerten.
4. Fehler im Code beheben, bis alle relevanten Tests grün sind.

## 3. Playwright MCP / Tools

- Playwright kann zusätzlich als **MCP-Tool** in Cursor konfiguriert werden (z. B. für interaktive Browser-Steuerung).
- Diese Konfiguration erfolgt **in Cursor selbst**, nicht im Repo.  
  Dieses Projekt liefert dafür:
  - klare Test-Kommandos (`npm run test:e2e`),
  - eine vollständige Test-Suite,
  - und eine definierte lokale Basis-URL (`http://localhost:9323`).

Empfehlung für Agent/YOLO-Modus:

- Nach relevanten Code-Änderungen:
  - `npm run test:e2e` ausführen.
  - Bei Fehlschlägen die Fehlerursachen im Code suchen und beheben.
  - Erst dann neue Änderungen vorschlagen oder deployen.


