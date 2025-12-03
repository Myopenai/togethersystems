# TogetherSystems T,. - Entwicklerhandbuch

**Branding:** `T,.&T,,.&T,,,.T.`  
**Version:** 2.0.0-INFINITE

---

## 🚀 Schnellstart

### 1. Repository klonen

```bash
git clone https://github.com/togethersystems/togethersystems.git
cd togethersystems/TogetherSystems
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. A-Start ausführen

```bash
cd Fabrikage.AutoExecution/bootstrap
npm run a-start
```

---

## 📁 Projektstruktur

```
TogetherSystems/
├── Fabrikage.CoreProtocols/      # Normkern
├── Fabrikage.AutoExecution/       # Pipelines, Generatoren
├── Fabrikage.IntelligenceMatrix/  # KI, Optimierung
├── Fabrikage.ProvenanceLedger/    # SBOM, Signaturen
├── Fabrikage.ObservabilityAtlas/ # Metriken, Logs
├── Docs/                         # Dokumentation
├── Nodegraphs/                    # Transformationsgraphen
├── Pipelines/                    # Build, Deploy, Verify
├── Policies/                     # Policies
├── Keys/                         # Schlüsselverwaltung
└── Portal/                       # DaVinci-Gestalten Portal
```

---

## 🔧 Entwicklung

### Code-Standards

- **Linting:** ESLint
- **Formatting:** Prettier
- **Testing:** Jest + Playwright
- **Coverage:** Mindestens 80%

### Git-Workflow

1. **Branch erstellen:**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Änderungen committen:**
   ```bash
   git add .
   git commit -m "T,. Add feature"
   ```

3. **Push:**
   ```bash
   git push origin feature/my-feature
   ```

4. **Pull Request erstellen**

---

## 🧪 Testing

### Unit-Tests

```bash
npm run test:unit
```

### Integration-Tests

```bash
npm run test:integration
```

### E2E-Tests

```bash
npm run test:e2e
```

### Coverage

```bash
npm run test:coverage
```

---

## 🏗️ Build

### Development

```bash
npm run build:dev
```

### Production

```bash
npm run build:prod
```

---

## 🚀 Deploy

### Staging

```bash
npm run deploy:staging
```

### Production

```bash
npm run deploy:prod
```

---

## 📚 Dokumentation

- **Architektur:** `Docs/ARCHITECTURE.md`
- **API:** `Docs/API.md`
- **Portal:** `Docs/PORTAL.md`

---

## 🔗 Links

- **GitHub:** https://github.com/togethersystems/togethersystems
- **Portal:** `Portal/index.html`
- **Manifest:** `factory.manifest.yaml`

---

**T,.&T,,.&T,,,.T.** - Together Systems, Startup Systems

