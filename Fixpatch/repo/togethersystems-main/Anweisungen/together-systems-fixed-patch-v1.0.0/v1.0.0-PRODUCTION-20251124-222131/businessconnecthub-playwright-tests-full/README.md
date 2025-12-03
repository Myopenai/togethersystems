# TELCOMPETIOION – Playwright Testsuite

Diese Testsuite testet das **TELCOMPETIOION Root-Projekt** auf `http://localhost:9323/`.

## Getestete Bereiche

- **Startseite / Dashboard** (`/index.html`)
  - Portal öffnen, Dashboard, Daten-Tabelle, Berichte, Manifest-Forum-Download
  
- **Manifest-Portal** (`/manifest-portal.html`)
  - Bonus-Ökosystem, Module, Mesh-Historie
  - Verifizierung
  - Admin-Moderation (Server)
  - Hidden Viewer
  - Medien & Chat
  - P2P Datei-Transfer
  - Daten laden / API
  - Live-Funktionen
  - Datei-Transfer (R2)
  
- **Manifest-Forum – Offline-Editor** (`/manifest-forum.html`)
  - Beitrag erstellen
  - Hyperkommunikation (Text/Audio/Video/Code/Formel/Daten)
  - Daten Export/Import
  - Statische Webseite erzeugen
  - API-Veröffentlichung & Warteschlange
  - Mesh-Networking (P2P-Sync)

## Voraussetzungen

1. **Node.js** (empfohlen >= 18) installiert
2. **Lokaler Webserver** läuft auf `http://localhost:9323/` (z.B. via `python -m http.server 9323` im TELCOMPETIOION Root)

## Installation

```bash
cd D:\TELBOUISNINESSTESTS\businessconnecthub-playwright-tests-full
npm install
npx playwright install --with-deps chromium
```

## Tests ausführen

### Alle Tests (Chromium):
```bash
npx playwright test --project=Chromium
```

### Nur Startseite:
```bash
npx playwright test --project=Chromium tests/start.spec.ts
```

### Nur Forum:
```bash
npx playwright test --project=Chromium tests/offline-forum.spec.ts
```

### Nur Portal:
```bash
npx playwright test --project=Chromium tests/portal.spec.ts
```

### HTML-Report:
```bash
npx playwright test --project=Chromium --reporter=html
npx playwright show-report
```

### Mit anderer Base URL:
```bash
$env:PLAYWRIGHT_BASE_URL="http://localhost:8000/"; npx playwright test --project=Chromium
```

## Konfiguration

Die Base URL ist in `playwright.config.ts` definiert:
- **Default:** `http://localhost:9323/` (TELCOMPETIOION Root)
- **Überschreibbar:** via Umgebungsvariable `PLAYWRIGHT_BASE_URL`

> **Hinweis:** Komplexe Funktionen wie echte Audio-/Videoübertragung, P2P-Sync oder API-Publishing
> werden hier als **UI-Smoke-Tests** abgedeckt (Buttons/Elemente sichtbar und klickbar).
> Für echte End-to-End-Prüfung inkl. Server/Signaling/API brauchst du zusätzlich
> Backends, Testkonten oder Mocks.