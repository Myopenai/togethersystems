# FABRIKAGE — Summary (EN)

This is the compact overview of the reproduction guide. For the full, versioned text see:
- Full text: [FABRIKAGE-REPRODUCTION-GUIDE-1.0.0.en.txt](./FABRIKAGE-REPRODUCTION-GUIDE-1.0.0.en.txt)

Core principle:
- Recognize → Validate → Produce (deterministic, declarative, repeatable)

Core modules:
- CoreProtocols, AutoExecution, IntelligenceMatrix, ProvenanceLedger, ObservabilityAtlas, PromptProcessing

Setup (short):
- OS: Win/Mac/Linux; Tools: Python 3.10+, Node 20+, PowerShell 7+/Bash, Git 2.30+
- Start locally via `index.html` (single-file app)

Pipeline:
- Pre-Deploy → Deploy → Post-Deploy → Release
- Gates: Contracts/Schema, Tests, Compliance, Build, Report

Deployment:
- GitHub Pages via workflow, `.nojekyll`, `index.html`

Maintenance:
- Analyze → Update → Checks → Tests → Docs/Release

Checklist:
- Architecture 1:1, pipeline OK, Pages live, SBOM/signatures/reports available


