# Playwright Test-Suite Status

## ✅ Implementiert

1. **Playwright-Config** (`playwright.config.ts`)
   - Base URL: `http://localhost:9323/` (TELCOMPETIOION Root)
   - Chromium, Firefox, WebKit Projekte konfiguriert
   - Timeout: 60 Sekunden, Retries: 1

2. **Test-Dateien (aktuelle Architektur):**
   - ✅ `tests/start.spec.ts` – Startseite / Dashboard (`index.html`)
   - ✅ `tests/offline-forum.spec.ts` – Offline-Forum (`manifest-forum.html`)
   - ✅ `tests/portal.spec.ts` – Online-Portal (`manifest-portal.html`, inkl. Voucher/Events/Live/Mehrbenutzer-Szenario)
   - ✅ `tests/business-admin.spec.ts` – Business-Admin (Vouchers & Buchungen)
   - ✅ `tests/admin-monitoring.spec.ts` – Monitoring & Events
   - ✅ `tests/honeycomb.spec.ts` – Wabenräume
   - ✅ `tests/legal-hub.spec.ts` – Legal-Hub (Verträge)
   - ✅ `tests/telbank.spec.ts` – TELBANK-Konsole
   - ✅ `checks/home.check.ts` – Checkly-Integration

3. **Dependencies installiert:**
   - ✅ `npm install` erfolgreich
   - ✅ Playwright Chromium Browser installiert

## 🎯 Tests zielen auf TELCOMPETIOION Root

- `http://localhost:9323/index.html` → Startseite
- `http://localhost:9323/manifest-forum.html` → Offline-Forum
- `http://localhost:9323/manifest-portal.html` → Portal

## 📝 Tests ausführen

**Wichtig:** Lokaler Webserver muss auf Port 9323 laufen!

```bash
# Im TELCOMPETIOION Root-Verzeichnis:
python -m http.server 9323

# Dann in anderem Terminal:
cd D:\TELBOUISNINESSTESTS\businessconnecthub-playwright-tests-full
npx playwright test --project=Chromium
```

## 📊 Test-Statistiken (ungefähr)

- **40+ Tests** insgesamt (je nach Skip/Browser)
- Startseite / Dashboard
- Offline-Forum (Social-Editor)
- Online-Portal (Voucher, Events, Live-UI, Multi-User)
- Business-Admin (Vouchers & Buchungen)
- Monitoring (Events & Telemetrie)
- Honeycomb (Wabenräume)
- Legal-Hub (Vertrags-UI)
- TELBANK (Wallet-Konsole)

## ⚠️ Bekannte Probleme

- Manche Tests können fehlschlagen, wenn lokaler Server nicht läuft
- UI-Elemente können sich geändert haben (Tests müssen angepasst werden)
- Timeouts bei langsamen Verbindungen (60s Timeout)

