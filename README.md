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

Branding-String (vollständig):

> T,.&T,,.&T,,,.TOGETHERSYSTEMS. INTERNATIONAL TTT T,.&T,,.T,,,.(C) (+31) - ( 613 803 782.) https://orcid.org/0009-0003-1328-2430
