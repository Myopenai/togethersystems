# StudioLive XXLS – One-Click Canvas

## [.SYSTEMS.T.SYSTEMS.] Complete Plug-and-Play Code Bundle

### Überblick

Ein komplettes, kopierfertiges System für:
- **Portal** (StudioLive XXLS Design)
- **APIs** (Cloudflare Pages Functions)
- **Robotics Pipeline** (3D Printer Jobs Simulation)
- **Downloads Hub** (Checksums & One-Click Bundle)

### Schnellstart

#### 1. Installation

```bash
npm install
```

#### 2. One-Click Setup

**Linux/macOS:**
```bash
chmod +x scripts/oneclick.sh
bash scripts/oneclick.sh
```

**Windows:**
```powershell
.\scripts\oneclick.ps1
```

#### 3. Lokale Entwicklung

```bash
npm run dev
```

Öffne: `http://localhost:8788`

#### 4. Deployment

```bash
npm run publish
```

### Was wird erstellt

- `public/index.html` - StudioLive XXLS Portal
- `public/manifest-portal.html` - Manifest Portal
- `public/downloads/` - Downloads Hub mit Checksums
- `functions/api/voucher/` - Voucher APIs
- `functions/api/presence/` - Presence API
- `functions/api/robotics/` - Robotics Pipeline APIs

### Features

- ✅ StudioLive XXLS Design
- ✅ .T. Branding überall
- ✅ UTF-8/NFC Normalization (Umlaute korrekt)
- ✅ Robotics Pipeline Simulation
- ✅ Cloudflare Pages Functions
- ✅ Downloads mit Checksums
- ✅ One-Click Bundle Download

### APIs

- `GET /api/voucher/list` - Voucher-Liste
- `POST /api/voucher/redeem?id=...` - Voucher einlösen
- `GET /api/presence/status` - Presence-Status
- `POST /api/robotics/start` - Robotics Pipeline starten
- `GET /api/robotics/jobs` - Job-Liste

### Robotics Pipeline

Simuliert einen kompletten Workflow:
1. **Materialannahme** - Scanner erkennt Material (PET+PP)
2. **Mix-Berechnung** - Safe low-temp mix
3. **Druckprofil** - Layer, Nozzle, Temperatur
4. **Job-Enqueue** - 3D-Printer Job in Warteschlange
5. **QC-Plan** - Qualitätskontrolle geplant

### [.SYSTEMS.T.SYSTEMS.]

BRANÐ: TTT.T,.3T | Kennung: [.T.4T.]
