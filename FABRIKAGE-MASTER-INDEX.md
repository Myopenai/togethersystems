# FABRIKAGE MASTER INDEX
## Vollständige Übersicht aller Systeme und Komponenten

**VERSION:** 3.0.0  
**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV  
**DATUM:** 2025-01-27

---

## 📚 DOKUMENTATION

### System-Übersichten
- `FABRIKAGE-COMPLETE-SYSTEM-OVERVIEW.md` - Vollständige System-Übersicht
- `FABRIKAGE-UNIVERSAL-ENGINE-COMPLETE.md` - Universal Engine Dokumentation
- `FABRIKAGE-CONTROL-SYSTEM-COMPLETE.md` - Control Service Dokumentation
- `FABRIKAGE-FORMULA-PROGRAM-GENERATOR-COMPLETE.md` - Formula Generator Dokumentation
- `FABRIKAGE-DIGITALNOTATOR-COMPLETE-IMPLEMENTATION.md` - Digitalnotator Dokumentation
- `FABRIKAGE-GITHUB-UPLOAD-FIX.md` - GitHub Upload Problem Lösung

### READMEs
- `universal-fabrikage/README.md` - Universal Engine
- `formula-generator/README.md` - Formula Generator
- `apple-pi/README.md` - Apple-Pi System
- `HARDWARE-DOKUMENTATION.md` - Raspberry Pi Hardware

---

## 🎯 HAUPT-SYSTEME

### 1. Universal Prompt-to-Program Engine
**Pfad:** `universal-fabrikage/`

**Features:**
- Natürliche Sprache → Programm
- 10 Programmiersprachen
- Web/Mobile/Desktop UI
- Docker + Kubernetes Deployment
- Automatische Test-Generierung

**Verwendung:**
```bash
node universal-fabrikage/engine/prompt_to_program.ts "Erstelle ein Haushaltsbuch"
```

### 2. Formula Program Generator
**Pfad:** `formula-generator/`

**Features:**
- Formeln aus Datenbank
- Graph-basierte Code-Generierung
- Multi-Language Support
- Web-UI Generation

**Verwendung:**
```bash
node formula-generator/generate-all.js F000001 F000002 F000003
```

### 3. Apple-Pi System
**Pfad:** `apple-pi/`

**Features:**
- Spec Mirror (A-Z Schemas)
- Containerisierung (Docker)
- API Gateway (Traefik)
- Client-Integration (macOS/iOS)
- Datenbank-Setup (PostgreSQL/MariaDB)
- Security (mTLS)
- Backup (BorgBackup/Restic)

**Verwendung:**
```bash
cd apple-pi/infra && docker-compose up -d
```

### 4. Control Service
**Pfad:** `control/`

**Features:**
- Kontinuierliche Überwachung
- Health/Ready/Status Endpoints
- Ruhestand-Modus
- Synthetic Probes

**Verwendung:**
```bash
node control/server.ts
```

### 5. Digitalnotator
**Pfad:** `CASHFLOX/TOGETHERSYSTEMS-COMPLETE-PACKAGE/apps/notar-complete.html`

**Features:**
- 8 Menü-Items
- Unterschriftsfeld (Canvas)
- OCR-System
- 2FA, Verschlüsselung, Blockchain-Hash

### 6. Startup-System
**Pfad:** `startup-system/`

**Features:**
- Produktübergabe
- Verifizierung
- Entwicklungsberichte
- Mathematische Verifikation

### 7. Wissenschaftliche Excel-Formeln
**Pfad:** `excel-scientific/`

**Features:**
- Solar-Energie-Berechnung
- Brennstoffzelle-Berechnung
- Haushaltsbuch
- Excel-Export

---

## 🔧 CI/CD & AUTOMATION

### PowerShell Scripts
- `FABRIKAGE-ULTIMATE-AUTO-ALL.ps1` - Master-Script (Update, Fix, Deploy, Test)
- `FABRIKAGE-DEPLOY-ALL-REPOS.ps1` - Git Deploy zu allen Repos
- `FABRIKAGE-ADD-CONSOLE-TO-ALL-FILES.ps1` - Console-System Integration
- `FABRIKAGE-TEST-ALL-WEBSITES.ps1` - Website-Tests
- `FABRIKAGE-AUTO-FIX-WEBSITE-ERRORS.ps1` - Auto-Fix Website-Fehler

### Node.js Scripts
- `ci/prompt-scanner.js` - Task-Erkennung
- `ci/auto-executor.js` - Auto-Ausführung
- `ci/orchestrator/canary-deploy.js` - Canary Deploy
- `ci/orchestrator/monitor-slo.js` - SLO Monitoring
- `ci/orchestrator/decide-rollout.js` - Rollout/Rollback

### GitHub Actions
- `.github/workflows/auto-fix-deploy.yml` - Auto-Fix → Deploy
- `.github/workflows/control-verify.yml` - Kontinuierliche Verifikation

---

## 📊 STATISTIKEN

- **10 Programmiersprachen** unterstützt
- **4 UI-Frameworks** (Web PWA, React Native, Flutter, Electron)
- **2 Deployment-Optionen** (Docker, Kubernetes)
- **21+ Fehler-Patterns** automatisch behoben
- **8 Digitalnotator-Menü-Items** vollständig
- **A-Z Domain-Schemas** (10+ Schemas)
- **Automatische Test-Generierung**
- **Kontinuierliche Überwachung**

---

## 🚀 QUICK START GUIDE

### 1. System starten
```bash
# Control Service
node control/server.ts

# Universal Engine
cd universal-fabrikage/engine
node prompt_to_program.ts "Erstelle ein Haushaltsbuch"

# Apple-Pi
cd apple-pi/infra
docker-compose up -d
```

### 2. Portal öffnen
```bash
# Universal Portal
open universal-fabrikage/portal/index.html

# Digitalnotator
open CASHFLOX/TOGETHERSYSTEMS-COMPLETE-PACKAGE/apps/notar-complete.html

# Startup-System
open startup-system/index.html

# Excel-Formeln
open excel-scientific/index.html
```

### 3. Tests ausführen
```bash
# Alle Websites testen
powershell -ExecutionPolicy Bypass -File FABRIKAGE-TEST-ALL-WEBSITES.ps1

# Auto-Fix ausführen
powershell -ExecutionPolicy Bypass -File FABRIKAGE-AUTO-FIX-WEBSITE-ERRORS.ps1

# Master-Script (alles)
powershell -ExecutionPolicy Bypass -File FABRIKAGE-ULTIMATE-AUTO-ALL.ps1
```

---

## 🔐 SECURITY & ACCESS

- **WebAuthn (Passkeys):** Primär-Auth
- **mTLS:** Optional für starke Clients
- **Device Flow:** Für Headless/TV/CLI
- **Offline PWA:** Manifest Portal offline
- **VPN/Tor:** Optional für Privacy-User

---

## ⚙️ CONTROL SERVICE

- **Health:** `GET /healthz`
- **Ready:** `GET /readyz`
- **Status:** `GET /status`
- **Ruhestand:** `POST /ruhestand`
- **Aktiv:** `POST /aktiv`

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**VERSION:** 3.0.0  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV

---

*Erstellt: 2025-01-27*


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
