# FABRIKAGE — Kurzfassung (DE)

Dies ist die kompakte Übersicht der Reproduktionsanleitung. Für die vollständige, versionierte Anleitung siehe:
- Volltext: [FABRIKAGE-BAUANLEITUNG-REPLIKA-1.0.0.de.txt](./FABRIKAGE-BAUANLEITUNG-REPLIKA-1.0.0.de.txt)

Kernprinzip:
- Recognize → Validate → Produce (deterministisch, deklarativ, wiederholbar)

Kernmodule:
- CoreProtocols, AutoExecution, IntelligenceMatrix, ProvenanceLedger, ObservabilityAtlas, PromptProcessing

Setup (Kurz):
- OS: Win/Mac/Linux; Tools: Python 3.10+, Node 20+, PowerShell 7+/Bash, Git 2.30+
- Start lokal über `index.html` (Single-File App)

Pipeline:
- Pre-Deploy → Deploy → Post-Deploy → Freigabe
- Gates: Contracts/Schema, Tests, Compliance, Build, Report

Deployment:
- GitHub Pages via Workflow, `.nojekyll`, `index.html`

Wartung:
- Analyse → Update → Checks → Tests → Doku/Freigabe

Checkliste:
- Architektur 1:1, Pipeline OK, Pages online, SBOM/Signaturen/Reports verfügbar


