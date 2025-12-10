# Fabrikage Platform

A modular, edge-native software factory that orchestrates pipelines, signs and tracks provenance, optimizes with AI, and exposes curated portals and APIs.

## Architecture Overview

### Core Modules

1. **CoreProtocols**: Schemas, types, policy DSL, and ADRs
2. **AutoExecution**: Pipeline engine, executor, and adapters
3. **IntelligenceMatrix**: Optimizer, recommendations, and rules
4. **ProvenanceLedger**: SBOM, DSSE, signatures, and journal
5. **ObservabilityAtlas**: Metrics, logs, traces, and dashboards
6. **Portals**: Admin, Legal, and Manifest UIs

### Development Setup

#### Prerequisites

- Node.js 16+
- npm 8+
- Lerna (will be installed automatically)

#### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fabrikage-platform
   ```

2. **Bootstrap the project**
   ```powershell
   .\scripts\bootstrap.ps1
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

### Project Structure

```
Fabrikage/
├── Portal/                       # UI portalen (Admin, Legal, Manifest)
├── Fabrikage.CoreProtocols/      # Schemas, types, policy DSL, ADRs
├── Fabrikage.AutoExecution/      # Pipeline engine, executor, adapters
├── Fabrikage.IntelligenceMatrix/ # Optimizer, recommendations, rules
├── Fabrikage.ProvenanceLedger/   # SBOM, DSSE, signatures, journal
├── Fabrikage.ObservabilityAtlas/ # Metrics, logs, traces, dashboards
├── Nodegraphs/                   # Declarative pipeline graphs
├── Pipelines/                    # CI/CD definitions
├── Policies/                     # Security/compliance policies
├── Docs/                         # C4 views, runbooks, compliance maps
├── scripts/                      # ps1/sh/node tooling
└── tests/                        # unit, integration, e2e, load
```

### Development Workflow

1. **Start a new feature**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow the coding standards
   - Write tests for new features
   - Update documentation as needed

3. **Run tests**
   ```bash
   npm test
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

5. **Push and create a pull request**

### Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

### License

[Specify License]

---

Built with ❤️ by [Your Team Name]
