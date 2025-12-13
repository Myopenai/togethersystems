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


---

## 🏢 Unternehmens-Branding & OCR

**TogetherSystems** | **T,.&T,,.&T,,,.** | **TTT Enterprise Universe**

| Information | Link |
|------------|------|
| **Initiator** | [Raymond Demitrio Tel](https://orcid.org/0009-0003-1328-2430) |
| **ORCID** | [0009-0003-1328-2430](https://orcid.org/0009-0003-1328-2430) |
| **Website** | [tel1.nl](https://tel1.nl) |
| **WhatsApp** | [+31 613 803 782](https://wa.me/31613803782) |
| **GitHub** | [myopenai/togethersystems](https://github.com/myopenai/togethersystems) |
| **Businessplan** | [TGPA Businessplan DE.pdf](https://github.com/T-T-T-Sysytems-T-T-T-Systems-com-T-T/.github/blob/main/TGPA_Businessplan_DE.pdf) |

**Branding:** T,.&T,,.&T,,,.(C)(R)TEL1.NL - TTT,. -

**IBM+++ MCP MCP MCP Standard** | **Industrial Business Machine** | **Industrial Fabrication Software**

---
