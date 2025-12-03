# TogetherSystems T,. - Entwickler-Dokumentation

**Branding:** `T,.&T,,.&T,,,.T.`  
**Version:** 2.0.0-INFINITE  
**Zielgruppe:** Entwickler, Software-Ingenieure

---

## 📋 Inhaltsverzeichnis

1. [Schnellstart](#schnellstart)
2. [Projektstruktur](#projektstruktur)
3. [Entwicklungsumgebung](#entwicklungsumgebung)
4. [Code-Standards](#code-standards)
5. [Testing](#testing)
6. [Build & Deploy](#build--deploy)
7. [API-Entwicklung](#api-entwicklung)
8. [Generator-Entwicklung](#generator-entwicklung)
9. [Pipeline-Entwicklung](#pipeline-entwicklung)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 Schnellstart

### Voraussetzungen

- Node.js 20+
- npm oder yarn
- Git
- TypeScript 5.0+

### Installation

```bash
# Repository klonen
git clone https://github.com/togethersystems/togethersystems.git
cd togethersystems/TogetherSystems

# Dependencies installieren
npm install

# A-Start ausführen
cd Fabrikage.AutoExecution/bootstrap
npm install
npm run a-start
```

---

## 📁 Projektstruktur

```
TogetherSystems/
├── Fabrikage.CoreProtocols/      # Normkern
│   ├── policies/                 # Policies
│   ├── schemas/                  # JSON-Schemas
│   ├── tools/                    # Tools (Encoding-Lint, etc.)
│   └── manifest.yaml             # Modul-Manifest
│
├── Fabrikage.AutoExecution/      # Automatische Ausführung
│   ├── bootstrap/                # A-Start Bootstrapper
│   ├── generators/               # Generatoren (UI, API, Adapter)
│   └── pipelines/                # Pipelines (Build, Deploy, Verify)
│
├── Fabrikage.IntelligenceMatrix/ # KI & Optimierung
│   ├── intelligence/             # Intelligence-Layer
│   ├── prompt-db/                # Prompt-Datenbank
│   └── self-healing/             # Kill-Switches, Feature-Flags
│
├── Fabrikage.ProvenanceLedger/   # Provenance & SBOM
│   ├── registry/                 # Artifact Registry
│   ├── sbom/                     # SBOM-Dateien
│   └── provenance/               # Provenance-Daten
│
├── Fabrikage.ObservabilityAtlas/ # Observability
│   ├── monitoring/               # Prometheus, Grafana
│   ├── metrics/                  # Metriken
│   └── logs/                     # Logs
│
├── Docs/                         # Dokumentation
├── Nodegraphs/                    # Transformationsgraphen
├── Pipelines/                    # Pipeline-Definitionen
├── Policies/                     # Policy-Dateien
├── Keys/                         # Schlüsselverwaltung
├── Portal/                       # DaVinci-Gestalten Portal
└── tests/                        # Tests (Unit, Integration, E2E)
```

---

## 🛠️ Entwicklungsumgebung

### Editor-Konfiguration

**VS Code / Cursor:**
- Extension: ESLint
- Extension: Prettier
- Extension: TypeScript

**Settings:**
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Environment Variables

```bash
# .env
NODE_ENV=development
BRANDING=T,.&T,,.&T,,,.T.
LOG_LEVEL=debug
```

---

## 📝 Code-Standards

### TypeScript

- **Strict Mode:** Aktiviert
- **Target:** ES2020
- **Module:** ESNext
- **Linting:** ESLint mit TypeScript-Regeln

### Naming Conventions

- **Klassen:** PascalCase (`AStart`, `UIGenerator`)
- **Funktionen:** camelCase (`generateUI`, `validateManifest`)
- **Konstanten:** UPPER_SNAKE_CASE (`CACHE_VERSION`)
- **Dateien:** kebab-case (`a-start.ts`, `ui-generator.ts`)

### Code-Formatierung

- **Indentation:** 2 Spaces
- **Line Length:** 100 Zeichen
- **Quotes:** Single Quotes
- **Semicolons:** Ja

---

## 🧪 Testing

### Unit-Tests

```bash
npm run test:unit
```

**Beispiel:**
```typescript
describe('T,. A-Start Bootstrapper', () => {
  it('sollte Manifest erfolgreich laden', async () => {
    const result = await aStart.recognize();
    expect(result.status).toBe('success');
  });
});
```

### Integration-Tests

```bash
npm run test:integration
```

### E2E-Tests

```bash
npm run test:e2e
```

**Playwright:**
```typescript
test('sollte Portal erfolgreich laden', async ({ page }) => {
  await page.goto('http://localhost:8080/Portal/index.html');
  await expect(page).toHaveTitle(/T,. TogetherSystems Portal/);
});
```

---

## 🏗️ Build & Deploy

### Development Build

```bash
npm run build:dev
```

### Production Build

```bash
npm run build:prod
```

### Deploy

```bash
# GitHub Pages
npm run deploy:github

# Cloudflare Pages
npm run deploy:cloudflare
```

---

## 🔌 API-Entwicklung

### API-Generator verwenden

```typescript
import { APIGenerator } from './generators/api/api-generator';

const generator = new APIGenerator({
  openapiSpec: true,
  validation: true,
  documentation: true,
  versioning: true
});

const files = await generator.generate(intent);
```

### Neue Endpunkte hinzufügen

1. OpenAPI-Spec erweitern
2. API-Implementierung anpassen
3. Validation-Schemas aktualisieren
4. Tests schreiben

---

## 🎨 Generator-Entwicklung

### UI-Generator

```typescript
import { UIGenerator } from './generators/ui/ui-generator';

const generator = new UIGenerator({
  contrastEngine: true,
  accessibilityChecks: true,
  responsiveDesign: true,
  componentLibrary: true
});

const files = await generator.generate(intent);
```

### Adapter-Generator

```typescript
import { AdapterGenerator } from './generators/adapters/adapter-generator';

const generator = new AdapterGenerator({
  deviceProtocols: true,
  protocolProfiles: true,
  errorHandling: true,
  retryLogic: true
});

const files = await generator.generate(intent);
```

---

## 🔄 Pipeline-Entwicklung

### Pipeline erstellen

1. YAML-Datei in `Pipelines/` erstellen
2. Stages definieren
3. Gates konfigurieren
4. In `factory.manifest.yaml` registrieren

**Beispiel:**
```yaml
stages:
  - name: "build"
    steps:
      - name: "compile"
        action: "compile"
        toolchain: "node@20"
    gates:
      - name: "build-success"
        required: true
        fail_fast: true
```

---

## 🐛 Troubleshooting

### Encoding-Probleme

```bash
# Encoding-Lint ausführen
cd Fabrikage.CoreProtocols/tools
node encoding-lint.js
```

### Build-Fehler

```bash
# Clean Build
npm run clean
npm run build
```

### Test-Fehler

```bash
# Tests mit Debug-Output
npm run test:unit -- --verbose
```

---

## 📚 Weiterführende Ressourcen

- **Architektur:** `Docs/ARCHITECTURE.md`
- **API-Referenz:** `Docs/API.md`
- **Systemarchitektur-Analyse:** `Docs/SYSTEMARCHITEKTUR-ANALYSE.md`
- **Technische Roadmap:** `TECHNISCHE-ROADMAP.md`

---

**T,.&T,,.&T,,,.T.** - Together Systems, Startup Systems

