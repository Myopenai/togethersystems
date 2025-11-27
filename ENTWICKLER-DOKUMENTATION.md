# TogetherSystems – Entwickler-Dokumentation
## Vollständige Anleitung für Entwickler

**Version:** 1.0.0  
**Stand:** 27. November 2025  
**Branding:** T,.&T,,.&T,,,.TOGETHERSYSTEMS. INTERNATIONAL TTT T,.&T,,.T,,,.(C)  
**Kontakt:** (+31) - ( 613 803 782.) | https://tel1.nl | https://orcid.org/0009-0003-1328-2430

---

## 📚 Inhaltsverzeichnis

1. [Überblick](#überblick)
2. [System-Architektur](#system-architektur)
3. [Hauptanwendungen](#hauptanwendungen)
4. [Entwicklungsumgebung](#entwicklungsumgebung)
5. [API & Backend](#api--backend)
6. [Deployment](#deployment)
7. [Testing](#testing)
8. [Beitrag zum Projekt](#beitrag-zum-projekt)

---

## 🎯 Überblick

TogetherSystems ist ein **Meta-Transaktionsportal** für vollautomatisierte Geschäftsprozesse ohne klassische Registrierung. Das System basiert auf:

- **Accountless Identity**: Automatische Identifizierung pro Browser/Manifest
- **Offline-First**: Lokale Datenhaltung mit optionaler Server-Synchronisation
- **Wabenräume**: Visuelle und logische Räume für Transaktionen
- **Voucher-System**: Universelle JSON-Strukturen für Geschäftstransaktionen
- **Social Media UI/UX**: Vereinfachte Bedienung wie LinkedIn, WhatsApp

---

## 🏗️ System-Architektur

### Frontend-Komponenten

#### **1. Portal-Start (`index.html`)**
- **Zweck**: Haupt-Einstiegspunkt des Systems
- **Features**:
  - Dashboard-Übersicht
  - Daten-Verwaltung
  - Berichte & Export
  - Manifest-Forum Download
  - Offline-Funktionalität
- **Technologie**: HTML5, CSS3, JavaScript (Vanilla)
- **Datenhaltung**: localStorage

#### **2. Manifest-Forum (`manifest-forum.html`)**
- **Zweck**: Offline-Forum für Beiträge, Verträge, Definitionsobjekte
- **Features**:
  - Beitrag erstellen & bearbeiten
  - Hyperkommunikation (Text/Audio/Video/Code/Formel/Daten)
  - Daten Export/Import (JSON/CSV)
  - Statische Webseite erzeugen
  - API-Veröffentlichung & Warteschlange
  - Mesh-Networking (P2P-Sync)
- **Datenhaltung**: localStorage
- **Verifizierung**: Hash-basierte Token-Verifikation

#### **3. Online-Portal (`manifest-portal.html`)**
- **Zweck**: Online-Ansicht mit Live-Funktionen
- **Features**:
  - Feed-Ansicht (Lesen)
  - Token-Verifikation (Hash-Parameter)
  - Auto-Connect (Presence-API, Match-Loop)
  - Live-Room (WebSocket-Signaling)
  - Voucher & Termine (inkl. Branch-Templates + Kalender)
  - Immobilien & Hypotheken
  - Events & Memberships
- **APIs**: REST-APIs, WebSocket-Signaling

#### **4. Wabenräume (`honeycomb.html`)**
- **Zweck**: Visuelle Raumlogik für Transaktionen
- **Features**:
  - Raum-IDs (A-1, B-2, etc.)
  - Raum-Verknüpfung mit Vouchers/Events
  - Bildkarussell für Räume
  - Raum-Status & Verwaltung
- **Technologie**: SVG-basierte Visualisierung

#### **5. Legal-Hub (`legal-hub.html`)**
- **Zweck**: Rechtlicher Hub für Verträge & Verifikationen
- **Features**:
  - Verträge hochladen & verwalten
  - Verträge mit Vouchers/Räumen verknüpfen
  - Signaturen & Archivierung
  - Standardvertrags-Templates
- **Datenhaltung**: Lokal + optional Server-Sync

#### **6. TELBANK (`TELBANK/index.html`)**
- **Zweck**: MetaMask Liquidity Console
- **Features**:
  - MetaMask-Integration
  - Transfer-Logging
  - In/Out-Flows
  - TPGA Wallet Layer
- **Technologie**: Web3.js, MetaMask API

#### **7. Business-Admin (`business-admin.html`)**
- **Zweck**: Vouchers & Buchungen verwalten
- **Features**:
  - Voucher-Erstellung & -Verwaltung
  - Buchungsübersicht
  - Export/Import
- **Datenhaltung**: localStorage + API

#### **8. Admin-Monitoring (`admin-monitoring.html`)**
- **Zweck**: Monitoring & Events
- **Features**:
  - Event-Logging
  - System-Status
  - Telemetrie
- **APIs**: Event-API, Monitoring-API

#### **9. Production Dashboard (`production-dashboard.html`)**
- **Zweck**: Vollständige System-Übersicht
- **Features**:
  - System-Status
  - Performance-Metriken
  - Fehler-Logging
  - Deployment-Status

#### **10. Neural Network Console (`neural-network-console.html`)**
- **Zweck**: KI-Orchestrierung
- **Features**:
  - Model-Management
  - Routing-Policies
  - Performance-Monitoring
- **APIs**: AI Gateway API

#### **11. CMS Dashboard (`cms-dashboard.html`)**
- **Zweck**: Content Management System
- **Features**:
  - Multi-Tenant-Support
  - Block-basierte Seiten
  - E-Commerce-Integration
  - Media-Verwaltung
- **Datenbank**: D1 (Cloudflare)

#### **12. Investoren-Portal (`ostos-branding.html`)**
- **Zweck**: OSTOS Branding Universe für Investoren & Sponsoren
- **Features**:
  - Logo-Upload (SVG bevorzugt)
  - Sponsor-Integration
  - Animierte Visualisierung
  - Branding-Lab mit Live-Kontrolle
- **Technologie**: SVG, Canvas, CSS-Animationen

#### **13. Settings-Graph-Explorer (`settings-graph-explorer.html`)**
- **Zweck**: Neural Network Config + Provider + Deployment + OS/Hardware-Dimensionen
- **Features**:
  - Provider-Wahl (AWS, GCP, TEL1 Cloud)
  - Dimensionale Analyse (Latenz, Kosten, CPU, Kernel, BIOS, RAM, Storage)
  - AI-Planungslogik mit Hard/Soft Constraints
  - Live-Konsole/Fixbox
- **Technologie**: JavaScript (ES6 Modules)

#### **14. YORDY Artist Showcase (`YORDY/yordy-artist-showcase.html`)**
- **Zweck**: MicroLED Quality Showcase mit Animationen
- **Features**:
  - High-Quality Visualisierung
  - Animierte Effekte
  - Artist-Informationen
- **Technologie**: SVG, CSS-Animationen

#### **15. Developer Portal (`ultra/ui/developer-portal.html`)**
- **Zweck**: Entwickler-Onboarding & Community
- **Features**:
  - Onboarding-Flow
  - Community-Zugang
  - Entwickler-Ressourcen
- **APIs**: Developer-API

#### **16. Beta Portal (`ultra/beta/index.html`)**
- **Zweck**: Beta-Testing & Entwicklung
- **Features**:
  - Beta-Features testen
  - Feedback-System
  - Experimentelle Funktionen

---

## 🔧 Entwicklungsumgebung

### Voraussetzungen

- **Node.js**: >= 18.0.0
- **Git**: Für Versionierung
- **Browser**: Chrome/Edge (für Playwright-Tests)
- **Python**: Für lokalen HTTP-Server (optional)

### Lokale Entwicklung

```bash
# 1. Repository klonen
git clone https://github.com/Myopenai/togethersystems.git
cd togethersystems

# 2. Lokalen Server starten
python -m http.server 9323

# 3. Browser öffnen
# http://localhost:9323/index.html
```

### Projekt-Struktur

```
togethersystems/
├── index.html                    # Portal-Start
├── manifest-forum.html          # Offline-Forum
├── manifest-portal.html         # Online-Portal
├── honeycomb.html               # Wabenräume
├── legal-hub.html               # Legal-Hub
├── ostos-branding.html          # Investoren-Portal
├── settings-graph-explorer.html # Settings-Explorer
├── TELBANK/                     # TELBANK-Konsole
├── YORDY/                       # YORDY Artist
├── ultra/                       # Developer & Beta Portals
├── functions/                   # Cloudflare Pages Functions
├── businessconnecthub-playwright-tests-full/  # E2E-Tests
└── assets/                      # Statische Assets
```

---

## 🌐 API & Backend

### Cloudflare Pages Functions

**Basis-Pfad**: `/api/`

#### **Presence-API**
- `POST /api/presence/verify` - Token-Verifikation
- `POST /api/presence/heartbeat` - Präsenz-Update
- `POST /api/presence/match` - Match-Finding
- `GET /api/presence/catalog/apis` - API-Katalog

#### **TELBANK-API**
- `POST /api/telbank/transfers` - Transfer-Verarbeitung
- `GET /api/telbank/transfers` - Transfer-Historie

#### **Voucher-API**
- `GET /api/vouchers` - Voucher-Liste
- `POST /api/vouchers` - Voucher erstellen
- `GET /api/vouchers/:id` - Voucher-Details

#### **WebSocket-Signaling**
- `wss://your-domain.com/ws` - Live-Room-Signaling

### Datenbank (Cloudflare D1)

**Schema**: `d1-schema.sql`

**Tabellen**:
- `transfers` - TELBANK-Transfers
- `vouchers` - Voucher-Daten
- `events` - Event-Logging
- `users` - User-Daten (optional)

---

## 🚀 Deployment

### GitHub Pages

1. Repository auf GitHub erstellen
2. Dateien ins Root-Verzeichnis kopieren
3. Commit & Push
4. Repository Settings → Pages aktivieren
5. Branch: `main` / `/ (root)`

**URL-Format**: `https://USERNAME.github.io/togethersystems/`

### Cloudflare Pages

1. Cloudflare-Account erstellen
2. Pages-Projekt erstellen
3. GitHub-Repository verbinden
4. Build-Command: (kein Build nötig, statische Dateien)
5. Deploy

**URL-Format**: `https://your-project.pages.dev`

---

## 🧪 Testing

### Playwright-Tests

**Pfad**: `businessconnecthub-playwright-tests-full/`

```bash
# Tests ausführen
cd businessconnecthub-playwright-tests-full
npm install
npx playwright install --with-deps chromium
npx playwright test --project=Chromium
```

**Getestete Bereiche**:
- Portal-Start (`index.html`)
- Manifest-Forum (`manifest-forum.html`)
- Online-Portal (`manifest-portal.html`)
- Wabenräume (`honeycomb.html`)
- Legal-Hub (`legal-hub.html`)
- TELBANK (`TELBANK/index.html`)
- Business-Admin (`business-admin.html`)
- Admin-Monitoring (`admin-monitoring.html`)

---

## 🤝 Beitrag zum Projekt

### Entwickler-Onboarding

1. **Developer Portal öffnen**: `ultra/ui/developer-portal.html`
2. **Job-Angebot lesen**: `JOB-ANGEBOT-ENTWICKLER.html`
3. **Beta Portal testen**: `ultra/beta/index.html`

### Entwicklungsprozess

1. **Feature-Entwicklung**:
   - Feature-Branch erstellen
   - Code schreiben
   - Tests schreiben
   - Pull Request erstellen

2. **Code-Standards**:
   - Vanilla JavaScript (keine Frameworks)
   - localStorage für Offline-Daten
   - REST-APIs für Online-Funktionen
   - WebSocket für Live-Features

3. **Testing**:
   - Playwright-Tests für E2E
   - Manuelle Tests in verschiedenen Browsern
   - Offline/Online-Szenarien testen

---

## 📖 Weitere Ressourcen

- **Businessplan**: https://github.com/T-T-T-Sysytems-T-T-T-Systems-com-T-T/.github/blob/main/TGPA_Businessplan_DE.pdf
- **Forum**: https://tel1.boards.net/
- **GoFundMe**: https://www.gofundme.com/f/magnitudo
- **ORCID**: https://orcid.org/0009-0003-1328-2430

---

## 🎯 Vision

**TogetherSystems** ist das erste vollautomatisierte Meta-Transaktionsportal ohne klassische Registrierung. Das System ermöglicht:

- **Grenzenlose Teilnahme**: Jeder kann mitmachen
- **Vollautomatisierung**: Keine manuellen Schritte nötig
- **Offline-First**: Funktioniert auch ohne Internet
- **Social Media UX**: Einfache Bedienung wie WhatsApp, LinkedIn

**Unternehmensmotto**: `{T,. - Punkt. - T,,.}`

---

**Version:** 1.0.0  
**Letzte Aktualisierung:** 27. November 2025  
**Status:** 🟢 Produktionsreif
