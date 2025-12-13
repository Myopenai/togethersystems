# Automatisches Deploy & Kontrollsystem - Vollständig
## End-to-End: Fehler → Auto-Fix → Gates → Commit/Push → Deploy

**VERSION:** 3.0.0  
**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV

---

## ✅ IMPLEMENTIERTE KOMPONENTEN

### 1. Orchestrator-Skripte

- **`ci/orchestrator/canary-deploy.js`** - Canary-Deploy (10% Traffic)
- **`ci/orchestrator/monitor-slo.js`** - SLO-Monitoring (Latenz, Fehlerrate, Verfügbarkeit)
- **`ci/orchestrator/decide-rollout.js`** - Entscheidung: Rollout oder Rollback
- **`ci/orchestrator/generate-evidence.js`** - Evidence-Pack (Checksums, Coverage, Gates, SBOM)

### 2. Verifier Mesh

- **`ci/verifier-mesh/run-gate.js`** - Gate-Runner für alle Gates:
  - Formatting, Lint, Types
  - Unit, Integration, Property, Mutation
  - Contracts, Security, Build

### 3. Spec Mirror

- **`ci/spec-mirror/store.js`** - Speichert nur fehlerfreien Code mit Metadaten

### 4. Control Service

- **`control/watchdog.ts`** - Kontinuierliche Überwachung (Health, Specs, Security)
- **`control/server.ts`** - Express-Server mit Health/Status-Endpoints
- **`control/probes.ts`** - Synthetic Probes (Funktionstüchtigkeit ohne Produkte)
- **`control/ready.sh`** - Readiness Gates Script

### 5. CI/CD Pipeline

- **`.github/workflows/auto-fix-deploy.yml`** - Auto-Fix → Commit → Push → Deploy
- **`.github/workflows/control-verify.yml`** - Kontinuierliche Verifikation

### 6. Git Hooks

- **`.git/hooks/pre-commit`** - Fast Gates + Auto-Fix vor Commit
- **`.git/hooks/post-commit`** - Evidence Pack nach Commit

### 7. Gateway-Konfiguration

- **`apple-pi/infra/nginx/control.conf`** - Nginx-Konfiguration für Control-Endpoints

### 8. Runtime-Konfiguration

- **`runtime/feature-flags.json`** - Feature Flags (Control, Watchdogs, Canary, Gateway)

---

## 🔄 WORKFLOW

### Automatischer Workflow

1. **Fehler erkannt** → `console-error-controller.js`
2. **Auto-Fix angewendet** → `error-fix-system.js`
3. **Fast Gates** → Formatting, Lint, Types (mit Auto-Fix)
4. **Commit** → Automatisch mit "auto-fix: apply patterns + gates"
5. **Push** → Automatisch zu GitHub
6. **Full Gates** → Unit, Integration, Property, Mutation, Contracts, Security, Build
7. **Mirror Store** → Nur fehlerfreier Code wird gespeichert
8. **Evidence Pack** → Checksums, Coverage, Gates, SBOM
9. **Canary Deploy** → 10% Traffic
10. **SLO-Monitoring** → 5 Minuten Monitoring
11. **Rollout/Rollback** → Entscheidung basierend auf SLOs

---

## 🎯 KONTROLLSYSTEM

### Watchdog-Schedule

- **Health-Check:** Alle 5 Minuten
- **Spec-Conformance:** Alle 15 Minuten
- **Security-Check:** Stündlich (auch im Ruhestand)

### Endpoints

- **`GET /healthz`** - Health-Check
- **`GET /readyz`** - Readiness-Check
- **`GET /status`** - Global Status
- **`POST /mode/ruhestand`** - Ruhestand aktivieren
- **`POST /mode/aktiv`** - Aktiv-Modus

### Ruhestand-Modus

- **Aktivierung:** `POST /mode/ruhestand`
- **Effekt:** Watchdogs pausieren, Minimal-Health bleibt aktiv
- **Security:** CVE-Scan und Zertifikatsprüfung laufen weiter
- **Wiederaufnahme:** `POST /mode/aktiv` → Vollständige Revalidierung

---

## 📊 EVIDENCE PACK

**Inhalt:**
- Checksums (SHA-256) aller wichtigen Dateien
- Coverage (Lines, Branches, Functions, Statements)
- Gate-Report (alle Gates: passed/failed)
- SBOM (Software Bill of Materials)

**Speicherung:**
- `evidence/evidence-{timestamp}.json`
- `evidence/latest.json`

---

## 🚀 VERWENDUNG

### Lokal

```bash
# Fast Gates + Auto-Fix
node ci/verifier-mesh/run-gate.js --gate=formatting --autofix=true

# Full Gates
bash control/ready.sh

# Canary Deploy
node ci/orchestrator/canary-deploy.js --percent=10

# SLO-Monitoring
node ci/orchestrator/monitor-slo.js --windowMin=5

# Rollout/Rollback
node ci/orchestrator/decide-rollout.js

# Evidence Pack
node ci/orchestrator/generate-evidence.js
```

### Control Service

```bash
# Start Control Service
cd control
npm install
npx ts-node server.ts

# Watchdog starten
npx ts-node watchdog.ts
```

### Ruhestand aktivieren

```bash
curl -X POST https://apple-pi.local/mode/ruhestand
```

### Aktiv-Modus

```bash
curl -X POST https://apple-pi.local/mode/aktiv
```

---

## 🔐 SICHERHEIT

- **Branch Protection:** Main-Branch nur bei grünen Gates
- **Auto-Merge:** Bot bei "double green" (CI + Control)
- **Rollback:** Automatisch bei SLO-Verletzung
- **Audit Trails:** Evidence-Pack signiert und archiviert

---

## 📈 ERGEBNIS

✅ **Automatische Aktualität:** Jede Fehlerbehebung wird sofort geprüft, committed, gepusht und deployed  
✅ **Kontinuierliche Betriebsbereitschaft:** Fabrik ist stets 100% funktionsfähig  
✅ **Energie-aware:** Ruhestand-Modus pausiert geordnet mit Sicherheits-Grundwache  
✅ **Universeller Zugang:** Manifest-Portal für alle Systeme, Offline/PWA

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
