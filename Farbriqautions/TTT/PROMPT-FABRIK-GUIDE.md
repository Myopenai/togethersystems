# 🏭 Prompt-Fabrik: Vollständiger Guide

> **[.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS. INTERNATIONAL TTT**
>
> Datenbank, sichere Formel-Mischung, Auto-Programmherstellung mit 99.99% Systemhandlung

---

## 📑 Inhaltsverzeichnis

1. [Übersicht](#übersicht)
2. [Architektur](#architektur)
3. [Schnellstart](#schnellstart)
4. [Prompt-Datenbank](#prompt-datenbank)
5. [Formel-Mixer](#formel-mixer)
6. [Programm-Generator](#programm-generator)
7. [Auto-Fix Pipeline](#auto-fix-pipeline)
8. [Cursor + OpenRouter/Groq Setup](#cursor-setup)
9. [Sicherheit](#sicherheit)
10. [Archetypen-Katalog](#archetypen-katalog)

---

## Übersicht

Die Prompt-Fabrik ist ein **industrietaugliches System** für automatisierte Software-Fertigung:

```
┌─────────────────────────────────────────────────────────────────┐
│  USER AKTION (0.5-1%)                                           │
│  ↓                                                              │
│  Auswahl: Prompt-ID oder Formel-Mix                             │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│  SYSTEM HANDLUNG (99.99%)                                       │
│                                                                 │
│  1. Prompt-DB → Rezept holen                                    │
│  2. Generator → Projekt-Skeleton bauen                          │
│  3. Validator → Sicherheit prüfen                               │
│  4. Preview → Abstrakte Vorschau                                │
│  5. Audit → Hash + Provenienz speichern                         │
│  6. Optional: Installation ins OS                               │
└─────────────────────────────────────────────────────────────────┘
```

**Ziel:** 1 Klick = 1 fertiges, getestetes Programm.

---

## Architektur

### Komponenten

| Komponente | Funktion |
|------------|----------|
| **Prompt-DB** | Katalogisiert Programm-Archetypen, Sprachen, Frameworks |
| **Generator** | Wandelt Prompt-Rezepte in Projekt-Skeletons |
| **Formel-Mixer** | Kombiniert sichere, software-logische Formeln |
| **Validator** | Prüft Sicherheit, Konsistenz, Lizenzen |
| **Preview** | Zeigt erwartetes Verhalten, I/O-Graphen |
| **Audit/Registry** | Speichert Artefakte, Hashes, Versionen |

### Datenfluss

```
                    ┌───────────────┐
                    │   Prompt-DB   │
                    │  (JSON/YAML)  │
                    └───────┬───────┘
                            │
                            ▼
┌──────────────┐    ┌───────────────┐    ┌──────────────┐
│ Formel-Mix   │───▶│   Generator   │───▶│  Validator   │
│ (abstrakt)   │    │ (Templates)   │    │  (Safety)    │
└──────────────┘    └───────────────┘    └──────┬───────┘
                                                │
                    ┌───────────────┐           │
                    │    Preview    │◀──────────┘
                    │  (graph-only) │
                    └───────┬───────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ Audit/Registry│
                    │  (Hash+Log)   │
                    └───────────────┘
```

---

## Schnellstart

### 1. Datenbank initialisieren

```bash
make init-db
```

Dies erstellt:
- 10 Starter-Prompts (REST API, Frontend, CLI, Desktop, ETL, etc.)
- 10 Starter-Formeln (Zeitreihen, Constraints, Hashes, etc.)
- 5 Starter-Mixes (Simulation, Analyse, API Protection, etc.)

### 2. Verfügbare Prompts anzeigen

```bash
make list-prompts
```

### 3. Programm generieren

```bash
make generate OUT=build/myapi ID=prog.web.api.rest.node.express
```

### 4. Mix-Vorschau

```bash
make preview MIX_ID=mix.simulation.pipeline
```

### 5. Auto-Fix Pipeline

```bash
make auto-fix
```

---

## Prompt-Datenbank

### Struktur

```json
{
  "id": "prog.web.api.rest.node.express",
  "title": "REST API (Node/Express)",
  "domain": "web_backend",
  "language": "TypeScript",
  "framework": "Express",
  "inputs": ["OpenAPI spec", "Env config"],
  "outputs": ["src/", "tests/", "Dockerfile"],
  "archetype": "service",
  "prompt": {
    "system": "Erzeuge eine produktionsreife REST API...",
    "instructions": ["...", "..."],
    "constraints": {
      "license": "MIT",
      "dependencies": ["express", "zod"],
      "security": ["no-dangerous-content"],
      "temperature": 0.1
    }
  },
  "templates": [
    {"path": "src/index.ts", "engine": "mustache"}
  ],
  "tags": ["api", "node", "typescript"]
}
```

### Befehle

```bash
# Liste Prompts
make list-prompts

# Prompt hinzufügen
make add-prompt ITEM=system/prompts/my-new-prompt.json

# Statistiken
make stats
```

---

## Formel-Mixer

### Konzept

Formeln sind **abstrakte, software-logische Bausteine** — wie ein Periodensystem für Code:

```json
{
  "id": "formula.time.series.increment",
  "title": "Zeitreihen-Inkrement",
  "type": "equation",
  "expression": "x_{t+1} = x_t + step",
  "invariants": ["monotonic", "bounded"],
  "inputs": ["x0", "step", "n"],
  "outputs": ["series"],
  "safety": ["abstract-only", "no-hazard"]
}
```

### Mix erstellen

Kombiniere Formeln zu Pipelines:

```json
{
  "mixId": "mix.simulation.pipeline",
  "title": "Simulation Pipeline",
  "steps": [
    {"ref": "formula.time.series.increment", "order": 1},
    {"ref": "formula.constraint.range", "order": 2},
    {"ref": "formula.visualizer.linechart", "order": 3}
  ],
  "io": {
    "inputs": ["x0", "step", "n", "min", "max"],
    "outputs": ["series", "valid", "chart"]
  },
  "safetyGate": "no-hazard-all-steps"
}
```

### Befehle

```bash
# Liste Formeln
make list-formulas

# Liste Mixes
make list-mixes

# Mix-Vorschau
make preview MIX_ID=mix.simulation.pipeline
```

---

## Programm-Generator

### Workflow

1. **Prompt laden** aus Datenbank
2. **Safety Gate** prüfen
3. **Templates** anwenden
4. **Skeleton** generieren (README, .gitignore, etc.)
5. **Audit** (SHA256 + Log)

### Befehle

```bash
# Generiere REST API
make generate OUT=build/api ID=prog.web.api.rest.node.express

# Generiere React Frontend
make generate OUT=build/frontend ID=prog.web.frontend.react.typescript

# Generiere CLI Tool
make generate OUT=build/cli ID=prog.cli.tool.go.cobra
```

### Output-Struktur

```
build/api/
├── README.md           # Generiert aus Prompt-Metadaten
├── .safety             # Sicherheits-Marker
├── .gitignore          # Standard-Ignoreliste
├── .prompt-ref.json    # Referenz zum Prompt
├── src/
│   └── index.ts        # Template-Stub
├── tests/
│   └── health.test.ts  # Test-Template
└── Dockerfile          # Container-Config
```

---

## Auto-Fix Pipeline

### Zyklus

```
AI → Analyzer → Tests → Fix → Commit
```

### Was passiert?

1. **AI Code-Generierung** (Cursor/OpenRouter/Aider)
2. **Static Analyzer** (ESLint, Ruff, ShellCheck)
3. **Tests** (Jest, Pytest, Go Test)
4. **Feedback** für LLM (Fehlerlogs)
5. **Commit** (bei 0 Fehlern)

### Befehle

```bash
# Vollständige Pipeline
make auto-fix

# Nur Build-Fix
make fix
```

---

## Cursor Setup

### 1. API-Key einrichten

```
Cursor → Settings → Models → Add Provider

OpenRouter: sk-or-v1-...
Groq:       gsk_...
```

### 2. Workspace Instructions

Die Datei `.cursor/instructions.md` enthält:
- Strikte Regeln für den AI-Assistenten
- Projekt-Kontext (Sprachen, Frameworks)
- Genehmigte Dependencies
- Temperature-Einstellungen

### 3. Modell-Konfiguration

| Aufgabe | Modell | Temperature |
|---------|--------|-------------|
| Autocomplete | DeepSeek Coder | 0.0 |
| Chat | LLaMA 3.1 | 0.2 |
| Composer | Codestral/Qwen | 0.1 |

### 4. Alternative Tools

```bash
# Aider (CLI)
make aider-local      # Mit Ollama
make aider-groq       # Mit Groq
make aider-openrouter # Mit OpenRouter

# Continue.dev
# → Konfiguration in .continuerc.json
```

---

## Sicherheit

### Prinzipien

1. **Kein realweltlicher Gefahr-Content**
2. **Formeln sind ausschließlich software-logisch**
3. **Keine Instruktionen für physische Risiken**
4. **Validator blockt unsichere Inhalte**

### Safety Gates

Jeder Prompt und Mix durchläuft:

```
┌─────────────────────────────────────────┐
│  SAFETY GATE                            │
│                                         │
│  ✓ no-dangerous-content                 │
│  ✓ no-realworld-hazard                  │
│  ✓ abstract-only                        │
│  ✓ no-hardcoded-secrets                 │
└─────────────────────────────────────────┘
```

### .safety Datei

Jedes generierte Projekt enthält:

```
no-realworld-hazard=true
abstract-only=true
generated-by=prompt-fabrik
```

---

## Archetypen-Katalog

### Starter-Prompts

| ID | Beschreibung |
|----|--------------|
| `prog.web.api.rest.node.express` | REST API (Node/Express/TS) |
| `prog.web.api.rest.python.fastapi` | REST API (Python/FastAPI) |
| `prog.web.frontend.react.typescript` | React Frontend (Vite/Tailwind) |
| `prog.cli.tool.go.cobra` | CLI Tool (Go/Cobra) |
| `prog.desktop.app.tauri.typescript` | Desktop App (Tauri) |
| `prog.data.etl.python.airflow` | ETL Pipeline (Airflow) |
| `prog.infra.terraform.aws` | Terraform Module (AWS) |
| `prog.docs.site.mkdocs` | Docs Site (MkDocs) |
| `prog.testing.e2e.playwright` | E2E Testing (Playwright) |
| `prog.web.pwa.vanilla` | PWA Starter (Vanilla) |

### Starter-Formeln

| ID | Beschreibung |
|----|--------------|
| `formula.time.series.increment` | Zeitreihen-Inkrement |
| `formula.constraint.range` | Range Constraint |
| `formula.growth.exponential` | Exponential Growth |
| `formula.stats.moving.average` | Moving Average |
| `formula.crypto.hash.sha256` | SHA-256 Hash |
| `formula.math.lerp` | Linear Interpolation |
| `formula.data.pagination` | Pagination Calculator |
| `formula.system.rate.limiter` | Rate Limiter |
| `formula.system.retry.backoff` | Exponential Backoff |
| `formula.visualizer.linechart` | Line Chart Renderer |

### Starter-Mixes

| ID | Beschreibung |
|----|--------------|
| `mix.simulation.pipeline` | Zeitreihen-Simulation |
| `mix.data.analysis` | Datenanalyse-Pipeline |
| `mix.api.protection` | API Protection Stack |
| `mix.animation.smooth` | Smooth Animation |
| `mix.data.fetcher` | Paginated Data Fetcher |

---

## Erweiterung

### Neuen Prompt hinzufügen

1. Erstelle JSON in `system/prompts/`:

```json
{
  "id": "prog.my.new.archetype",
  "title": "My New Archetype",
  "domain": "custom",
  "language": "TypeScript",
  "framework": "Custom",
  ...
}
```

2. Füge zur DB hinzu:

```bash
make add-prompt ITEM=system/prompts/prog.my.new.archetype.json
```

### Neue Formel hinzufügen

```bash
make add-formula ITEM=system/formulas/formula.my.new.json
```

### Neuen Mix hinzufügen

```bash
make add-mix ITEM=system/mixes/mix.my.new.json
```

---

## Zusammenfassung

| Befehl | Funktion |
|--------|----------|
| `make init-db` | Datenbank initialisieren |
| `make list-prompts` | Prompts anzeigen |
| `make generate OUT=dir ID=id` | Programm generieren |
| `make preview MIX_ID=id` | Mix-Vorschau |
| `make auto-fix` | Vollständige Pipeline |
| `make aider-local` | Aider mit Ollama |

---

**[.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS. INTERNATIONAL TTT**

*© 2025 Raymond Demitrio Tel*

*99.99% Systemhandlung, 0.5-1% Userhandlung*


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
