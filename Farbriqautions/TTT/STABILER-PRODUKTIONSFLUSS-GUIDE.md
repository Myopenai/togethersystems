# 🔧 Stabiler Produktionsfluss - Vollständiger Guide

> **[.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS. INTERNATIONAL TTT**
> 
> Industrielle Reproduzierbarkeit ohne IDE-Launen

---

## 📑 Inhaltsverzeichnis

1. [Problemanalyse](#problemanalyse)
2. [Modelle & Provider](#modelle--provider)
3. [Strikte Projekt-Regeln](#strikte-projekt-regeln)
4. [Auto-Fix-System](#auto-fix-system)
5. [Cache-Strategien](#cache-strategien)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Desktop-App (Tauri)](#desktop-app-tauri)
8. [Alternativen zu Cursor](#alternativen-zu-cursor)
9. [Checkliste](#checkliste)
10. [Schnellstart](#schnellstart)

---

## Problemanalyse

### Warum passieren Cache-Probleme?

| Problem | Ursache | Lösung |
|---------|---------|--------|
| **IDE-Gedächtnisverlust** | Zustand in Tool-Sessions, nicht im Repo | Alles ins Git, keine IDE-Sessions |
| **Cache-Fehler lokal vs. extern** | SW, Browser-Cache, CDN ohne Hash | Hash-Dateinamen, SW-Version bump |
| **Deploy-Illusion** | Lokaler Browser lädt alte Dateien | Hard Reload, CDN Purge |
| **Konsole-Verwirrung** | Dev vs. Prod Build unklar | Version-Label im Footer |

### Die Lösung: Ein-Knopf-Automatisierung

```
[Schlüssel drehen] → Clean → Build → Hash → SW → Deploy → Purge
```

---

## Modelle & Provider

### Kostenlose/Günstige Optionen

| Provider | Modelle | Kosten | Stärke |
|----------|---------|--------|--------|
| **Ollama (lokal)** | llama3.1, deepseek-coder, mistral | 0€ | Offline, keine Datenabfluss |
| **Groq** | LLaMA 3.1, Mixtral | Günstig | Sehr schnell |
| **OpenRouter** | DeepSeek, Qwen, Codestral | Pay-per-use | Viele Modelle |
| **Together.ai** | Diverse | Pay-per-use | Günstige Inference |

### Empfohlene Konfiguration

```
┌─────────────────────────────────────────────────────────────────┐
│  AUFGABE              │  MODELL              │  TEMPERATURE     │
├─────────────────────────────────────────────────────────────────┤
│  Autocomplete         │  DeepSeek Coder      │  0.0 - 0.1       │
│  Chat/Erklärungen     │  Llama 3.1 70B       │  0.2             │
│  Code-Generierung     │  Codestral/Qwen 2.5  │  0.1             │
│  Refactoring          │  DeepSeek Coder      │  0.0             │
└─────────────────────────────────────────────────────────────────┘
```

### Ollama Installation

```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows: Installer von https://ollama.com/download

# Modelle laden
ollama pull llama3.1
ollama pull deepseek-coder
ollama pull mistral
ollama pull nomic-embed-text  # Für Embeddings

# Server starten
ollama serve
```

---

## Strikte Projekt-Regeln

### System-Prompt für AI-Assistenten

```markdown
Du bist ein präziser Coding-Assistent für TogetherSystems.

STRIKTE REGELN:
1. Befolge Anweisungen EXAKT - ändere Architektur nur auf explizite Anfrage
2. Verwende NUR Libraries aus dem Repo oder Lockfile
3. Schreibe kompilierbaren, getesteten Code
4. Halte dich an vorhandene Build-Skripte, Makefile und CI
5. Bei Unsicherheit: FRAGE ZUERST
6. Keine eigenmächtigen Refactorings
7. Deterministische Änderungen, keine "Kreativität"
```

### Temperature-Einstellungen

| Aufgabe | Temperature | Begründung |
|---------|-------------|------------|
| Code-Completion | 0.0 | Maximale Präzision |
| Bugfixes | 0.0 - 0.1 | Keine Experimente |
| Neue Features | 0.1 - 0.2 | Leicht kreativ |
| Erklärungen | 0.2 - 0.3 | Natürlicher Text |

---

## Auto-Fix-System

### Ein-Knopf-Lösung

```bash
# Ausführen
./scripts/auto_fix.sh

# Oder via Make
make fix
```

### Was passiert?

```
[1/7] Clean          - Lösche altes Build-Verzeichnis
[2/7] Build          - Deterministischer Build (HTML, MD→HTML)
[3/7] Hash           - Cache-Busting: style.css → style.abc123.css
[4/7] SW Bump        - Service Worker Version: osos-cache-v1733140000
[5/7] Metadata       - Injiziere Build-Info in HTML Footer
[6/7] Deploy         - rsync/git push (optional)
[7/7] CDN Purge      - Cloudflare Cache leeren (optional)
```

### Umgebungs-Switch

```bash
# Development: Kein SW, kein Cache, Live Server
./scripts/start.sh dev

# Staging: Full Build, lokale Preview
./scripts/start.sh staging

# Production: Full Build + Deploy + CDN Purge
./scripts/start.sh prod

# Oder via Make
make dev
make staging
make prod
```

---

## Cache-Strategien

### 1. Asset-Hashing (Cache-Busting)

```
VORHER:  style.css, app.js
NACHHER: style.abc123def.css, app.789xyz012.js
```

Vorteile:
- Browser lädt neue Version automatisch
- Immutable caching möglich (1 Jahr)
- Keine manuellen Cache-Invalidierungen

### 2. Service Worker

```javascript
const CACHE = 'osos-cache-v1733140000';  // Auto-generated

// Install: Cache minimal
self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/index.html'])));
});

// Activate: Lösche alte Caches
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => 
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
});

// Fetch: HTML immer frisch, Assets aus Cache
self.addEventListener('fetch', e => {
    if (e.request.url.includes('.html')) {
        e.respondWith(fetch(e.request, { cache: 'no-store' }));
    } else {
        e.respondWith(caches.match(e.request) || fetch(e.request));
    }
});
```

### 3. HTTP-Header (Server)

```nginx
# Nginx
location ~* \.(css|js|png|svg|woff2)$ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}
location ~* \.(html)$ {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
}
```

### 4. CDN Purge

```bash
# Cloudflare
curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
    -H "Authorization: Bearer $API_TOKEN" \
    -d '{"purge_everything":true}'
```

---

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: Build & Deploy
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: chmod +x scripts/*.sh
      - run: make docs
      - uses: actions/upload-pages-artifact@v3
        with: { path: docs_build }

  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions: { pages: write, id-token: write }
    steps:
      - uses: actions/deploy-pages@v4
```

### Pre-Commit Hooks

```bash
# .git/hooks/pre-commit
#!/bin/bash
set -e

# Lint Markdown
markdownlint *.md

# Validate Links
./scripts/validate_links.sh

# Build Test
make docs
```

---

## Desktop-App (Tauri)

### Warum Tauri statt Electron?

| Aspekt | Tauri | Electron |
|--------|-------|----------|
| Bundle-Größe | ~3-10 MB | ~150+ MB |
| RAM-Verbrauch | Niedrig | Hoch |
| Native Feeling | Ja | Nein |
| Auto-Updates | Ja | Ja |

### Quick Start

```bash
# Prerequisites
npm install

# Development
cargo tauri dev

# Build für alle Plattformen (via CI)
cargo tauri build
```

### Release Workflow

```
Tag v1.0.0 → GitHub Action → 
├── Windows: .msi
├── macOS Intel: .dmg
├── macOS ARM: .dmg
└── Linux: .AppImage
```

---

## Alternativen zu Cursor

### 1. Continue.dev (VSCode/JetBrains)

**Kostenlos, Open Source**

```json
// .continuerc.json
{
    "models": [
        {
            "title": "DeepSeek Coder",
            "provider": "ollama",
            "model": "deepseek-coder"
        },
        {
            "title": "Llama 3.1 (Groq)",
            "provider": "groq",
            "model": "llama-3.1-70b-versatile"
        }
    ]
}
```

### 2. Aider (CLI)

**Git-aware, sehr stabil**

```bash
# Installation
pip install aider-chat

# Starten
aider --model ollama/deepseek-coder

# Mit Konfiguration
aider --config .aider.conf.yml
```

### 3. Codeium (VSCode)

**Kostenlos, gute Autocomplete**

- VSCode Extension installieren
- Kein API-Key nötig für Basis-Funktionen

### 4. Windsurf IDE

**Günstige Cursor-Alternative**

- Ähnliche Features
- Kontrollierbare Agents
- Günstiger als Cursor Pro

### Strategie-Empfehlung

```
┌─────────────────────────────────────────────────────────────────┐
│  LOKAL (0€)           → Ollama + Continue.dev + Aider          │
│  CLOUD (bei Bedarf)   → Groq/OpenRouter (nur wenn nötig)       │
│  BACKUP              → Alle Prompts/Settings im Git            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Checkliste

### ✅ Gleiche Ansicht überall

- [ ] **Service Worker**: Version bump bei Release
- [ ] **Asset-Hashing**: CSS/JS mit Hash im Namen
- [ ] **CDN Purge**: Nach Deploy global leeren
- [ ] **HTML no-cache**: Browser holt immer frisch
- [ ] **Footer-Label**: Build/Commit/Cache sichtbar
- [ ] **Repo-Wahrheit**: Alle Settings im Git
- [ ] **Temperature niedrig**: 0.0 - 0.2

### ✅ Stabile Entwicklung

- [ ] **Make-Targets**: `dev`, `staging`, `prod`
- [ ] **Auto-Fix-Script**: Ein Knopf für alles
- [ ] **Pre-Commit Hooks**: Lint + Validate
- [ ] **CI/CD**: Automatische Builds
- [ ] **Strikte Prompts**: AI folgt Regeln

### ✅ Cross-Platform

- [ ] **Tauri Config**: `src-tauri/tauri.conf.json`
- [ ] **Release Workflow**: `.github/workflows/release-desktop.yml`
- [ ] **Checksums**: SHA256 für alle Artifacts

---

## Schnellstart

### 1. Repository klonen

```bash
git clone https://github.com/Myopenai/togethersystems.git
cd togethersystems
```

### 2. Ollama installieren (optional, für lokale AI)

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull deepseek-coder
ollama pull llama3.1
```

### 3. Development starten

```bash
# Scripts ausführbar machen
chmod +x scripts/*.sh

# Dev-Server starten
make dev
# oder: ./scripts/start.sh dev
```

### 4. Production Deploy

```bash
make prod
# oder: ./scripts/start.sh prod
```

### 5. Aider für Coding

```bash
# Mit lokalem Modell
make aider-local

# Mit Groq
GROQ_API_KEY=... make aider-groq
```

---

## Dateien-Übersicht

```
togethersystems/
├── .continuerc.json           # Continue.dev Konfiguration
├── .aider.conf.yml            # Aider Konfiguration
├── Makefile                   # Build-Targets
├── scripts/
│   ├── auto_fix.sh            # Ein-Knopf-Automatisierung
│   ├── start.sh               # Umgebungs-Switch
│   ├── build_docs.sh          # MD→HTML Pipeline
│   └── aider-start.sh         # Aider mit Tests
├── src-tauri/
│   ├── tauri.conf.json        # Tauri Konfiguration
│   ├── Cargo.toml             # Rust Dependencies
│   └── src/main.rs            # Tauri Main
├── .github/workflows/
│   ├── build.yml              # CI/CD Pipeline
│   └── release-desktop.yml    # Desktop-App Releases
└── docs_build/                # Generated (nicht einchecken)
```

---

## Support

Bei Problemen:

1. **Issue erstellen**: https://github.com/Myopenai/togethersystems/issues
2. **Logs prüfen**: Browser Console, Terminal Output
3. **Cache leeren**: Hard Reload (Ctrl+Shift+R)

---

**[.TTT T,.&T,,.T,,,.T.] TOGETHERSYSTEMS. INTERNATIONAL TTT**

*© 2025 Raymond Demitrio Tel*
