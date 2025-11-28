# TogetherSystems Portal

## 🏢 Unternehmens-Informationen

**Initiator:** [Raymond Demitrio Tel](https://orcid.org/0009-0003-1328-2430)  
**ORCID:** [0009-0003-1328-2430](https://orcid.org/0009-0003-1328-2430)  
**Website:** [tel1.nl](https://tel1.nl)  
**WhatsApp:** [+31 613 803 782](https://wa.me/31613803782)  
**GitHub:** [myopenai/togethersystems](https://github.com/myopenai/togethersystems)  
**Businessplan:** [TGPA Businessplan DE.pdf](https://github.com/T-T-T-Sysytems-T-T-T-Systems-com-T-T/.github/blob/main/TGPA_Businessplan_DE.pdf)

**Branding:** T,.&T,,.&T,,,.(C)(R)TEL1.NL - TTT,. -

**IBM+++ MCP MCP MCP Standard** | **Industrial Business Machine** | **Industrial Fabrication Software**

---

# TogetherSystems – Manifest of Thinkers / BusinessConnect Hub

Dieses Repository enthält eine lauffähige, statische Web-Applikation:

- Offline-Portal (`index.html`)
- Admin-Bereich (`admin.html`)
- Offline-Manifest / Forum (`manifest-forum.html`)
- Online-Portal / Bridge (`manifest-portal.html`)
- Wabenräume für Verabredungen (`honeycomb.html`)
- Legal- & Verifikations-Hub (`legal-hub.html`)
- Service Worker (`sw.js`) für Offline-Funktionalität
- Branding-Assets im Verzeichnis `assets/branding/`

## Deployment auf GitHub Pages

1. Neues Repository auf GitHub anlegen (z. B. `together-systems-manifest`).
2. Den gesamten Inhalt dieses Projektordners in das Repository kopieren (Dateien direkt ins Wurzelverzeichnis).
3. Commit & Push.
4. In den *Repository Settings* → **Pages**:
   - Source: `Deploy from a branch`
   - Branch: z. B. `main` / `/ (root)`
5. Nach der Aktivierung ist die Anwendung unter der angegebenen GitHub-Pages-URL erreichbar, z. B.:

   `https://USERNAME.github.io/together-systems-manifest/`

Beim Aufruf von `index.html` ist das Portal direkt sichtbar – keine leere Standardseite von GitHub.

## Hinweise

- Die App ist komplett statisch und läuft rein im Browser (HTML, CSS, JavaScript).
- Daten werden im Browser über `localStorage` gehalten.
- Die Wabenräume sind derzeit lokal organisiert; echte Live-Kommunikation (Chat, Video, etc.) kann über separate Hubs ergänzt werden.
- Der Legal-/Verifikationsbereich ist als Demo gedacht und ersetzt keine Rechtsberatung.

## E2E-Tests & „Pool-Einstieg“ (Playwright)

Für automatische End-to-End-Tests gibt es im Unterordner `businessconnecthub-playwright-tests-full` eine vollständige
Playwright-Suite (Chromium).

**Schnellstart lokal:**

- Im Projekt-Root einen statischen Server starten:

  ```bash
  python -m http.server 9323
  ```

- In einem zweiten Terminal in den Testordner wechseln und die Chromium-Tests ausführen:

  ```bash
  cd businessconnecthub-playwright-tests-full
  npx playwright test --project=Chromium
  ```

Alternativ kannst du vom Projekt-Root aus mit einem Befehl starten:

```bash
npm run test:e2e
```

Der spezielle Test `businessconnecthub-playwright-tests-full/tests/pool-entry.spec.ts` prüft den **„Pool-Einstieg“-No-Code-Flow**:

- Startseite (`index.html`) öffnen.
- Link/Schaltfläche „Portal öffnen“ klicken.
- Im Manifest-Portal (`manifest-portal.html`) die No-Code-Bereiche verifizieren:
  - Verifizierung & „Token-URL generieren (No‑Code)“
  - „Daten laden“ mit JSON-Upload und API-URL
  - „Live-Raum erstellen (No‑Code)“ mit Formular statt JSON-Handarbeit.

Damit lässt sich der zentrale „ins Becken rein und wieder raus“-Einstieg des Portals automatisch überwachen.

Branding-String (vollständig):

> T,.&T,,.&T,,,.TOGETHERSYSTEMS. INTERNATIONAL TTT T,.&T,,.T,,,.(C) (+31) - ( 613 803 782.) https://orcid.org/0009-0003-1328-2430
