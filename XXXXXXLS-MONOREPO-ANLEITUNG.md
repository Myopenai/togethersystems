# XXXXXXLS Fabrikage Monorepo - Setup Anleitung

## 🚀 One-Click Setup (PowerShell)

### Schritt 1: Haupt-Setup ausführen

```powershell
# Im Hauptverzeichnis ausführen
.\setup-xxxxxxls-monorepo.ps1
```

Dies erstellt:
- ✅ Vollständiges Monorepo mit NPM Workspaces
- ✅ TypeScript-Konfigurationen
- ✅ ESLint + Prettier Standards
- ✅ Shared Schemas (TypeScript Types)
- ✅ Express API Service
- ✅ Dashboard App
- ✅ Node-Editor App (Grundgerüst)
- ✅ Bubble App (Grundgerüst)
- ✅ Docker & Docker Compose
- ✅ GitHub Actions CI/CD

### Schritt 2: Fehlende Apps vervollständigen

```powershell
# Nach dem Haupt-Setup ausführen
.\create-node-editor-bubble-apps.ps1
```

Dies erstellt die vollständigen HTML-Dateien für:
- ✅ Node-Editor mit Graph-Funktionalität
- ✅ Bubble-Scene mit interaktiven Controls

### Schritt 3: Installation und Start

```powershell
cd xxxxxxls-fabrikage-monorepo
npm install
npm run dev
```

## 📋 Verfügbare Services

Nach dem Start sind folgende Services verfügbar:

- **API**: http://localhost:5173
  - `/api/health` - Health Check
  - `/api/nodes` - Alle Nodes
  - `/api/links` - Alle Links
  - `/api/events` - Event-Log
  - `/api/energy-ledger` - Energie-Ledger
  - `/api/universal/layers` - Universal-Layer
  - `/api/morph` - Morph-Funktion (POST)

- **Dashboard**: http://localhost:5174
  - KPIs (Energy, Nodes, Links, Events)
  - Nodes-Tabelle und Pie-Chart
  - Links-Tabelle und Bar-Chart
  - Energy Ledger
  - Events und Layers

- **Node-Editor**: http://localhost:5175
  - Graph-Editor
  - Nodes erstellen, verschieben, verbinden
  - Export-Funktion

- **Bubble**: http://localhost:5176
  - Hydrosphäre-Visualisierung
  - Interaktive Controls (Pulse, Foam, Brightness)

## 🛠️ NPM Scripts

```bash
# Development (alle Services parallel)
npm run dev

# Einzelne Services
npm run dev:api          # API Server
npm run dev:dashboard    # Dashboard
npm run dev:node-editor  # Node-Editor
npm run dev:bubble       # Bubble

# Build
npm run build            # Alle Packages bauen

# Quality Checks
npm run lint             # ESLint
npm run format           # Prettier
npm run typecheck        # TypeScript
npm run test             # Vitest

# CI Pipeline
npm run ci               # Lint + Typecheck + Test + Build
```

## 🏗️ Architektur

```
xxxxxxls-fabrikage-monorepo/
├── shared/
│   └── schemas/          # TypeScript Types (Node, Link, etc.)
├── services/
│   └── api/              # Express API Server
├── apps/
│   ├── dashboard/        # Dashboard UI
│   ├── node-editor/      # Graph Editor
│   └── bubble/           # Bubble Visualization
├── .github/
│   └── workflows/
│       └── ci.yml        # CI/CD Pipeline
├── Dockerfile            # API Container
├── docker-compose.yml    # Alle Services
└── package.json          # Root Workspace
```

## ✅ Standards & Bug-Free Features

### TypeScript Strict Mode
- Alle Datenmodelle strikt typisiert
- Keine `any` Types
- Vollständige Type-Safety

### ESLint + Prettier
- Konsistente Code-Formatierung
- Automatische Fehlererkennung
- Import-Ordering

### Zod Validation
- API-Requests werden validiert
- Type-Safe Request/Response
- Fehlerhafte Eingaben werden abgefangen

### Vitest Tests
- Unit-Tests für Schemas
- Integration-Tests für API
- Coverage-Reports

### GitHub Actions CI
- Automatische Tests bei jedem Commit
- Lint + Typecheck + Test + Build
- Fehler werden sofort erkannt

### Docker Compose
- Reproduzierbare Deployments
- Isolierte Services
- Einfaches Scaling

## 🔧 Erweiterungen

### Neue API-Endpunkte hinzufügen

1. Erweitere `services/api/src/server.ts`:
```typescript
app.get('/api/new-endpoint', (req, res) => {
  res.json({ ok: true });
});
```

2. Erweitere Types in `shared/schemas/src/index.ts`:
```typescript
export interface NewResponse {
  ok: boolean;
  data: string;
}
```

### Neue App hinzufügen

1. Erstelle `apps/new-app/package.json`
2. Erstelle `apps/new-app/public/index.html`
3. Füge zu Root `package.json` Workspaces hinzu
4. Füge `npm run dev:new-app` Script hinzu

### Docker Deployment

```bash
# Build
docker-compose build

# Start
docker-compose up

# Stop
docker-compose down
```

## 📊 Features

### Dimensionless Architecture
- Operiert in allen Dimensionen (WORLD bis TRANSUNIVERSAL_META)
- Kontinuum-Feld für Forschung

### Self-Healing
- Automatische Fehlererkennung
- Retry-Logik
- Circuit-Breaker

### Hot-Swap Modules
- Module können transformiert werden
- Morph-API für Transformationen

### Audit Trail
- Alle Events werden geloggt
- Unveränderliche Event-Signaturen
- Vollständige Nachvollziehbarkeit

## 🎯 Nächste Schritte

1. **Hardware-Integration:**
   - Roboter-APIs anbinden
   - 3D-Drucker-Integration
   - Sensor-Netzwerke

2. **Produktions-Flows:**
   - Materialfluss-Modellierung
   - Energiefluss-Optimierung
   - Informationsfluss-Tracking

3. **Visualisierung:**
   - 3D-Graph-Rendering
   - Real-time Updates
   - Interactive Controls

4. **Monitoring:**
   - Prometheus Metrics
   - Grafana Dashboards
   - Alerting

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**VERSION:** 3.0.0  
**STATUS:** ✅ Production-Ready


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
