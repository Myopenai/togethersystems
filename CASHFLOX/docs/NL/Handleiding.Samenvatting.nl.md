# FABRIKAGE — Samenvatting (NL)

Dit is het compacte overzicht van de reproductiehandleiding. Voor de volledige, versiebeheerde tekst:
- Volledige tekst: [FABRIKAGE-REPRODUCTIEHANDLEIDING-1.0.0.nl.txt](./FABRIKAGE-REPRODUCTIEHANDLEIDING-1.0.0.nl.txt)

Kernprincipe:
- Recognize → Validate → Produce (deterministisch, declaratief, herhaalbaar)

Kernmodules:
- CoreProtocols, AutoExecution, IntelligenceMatrix, ProvenanceLedger, ObservabilityAtlas, PromptProcessing

Setup (kort):
- OS: Win/Mac/Linux; Tools: Python 3.10+, Node 20+, PowerShell 7+/Bash, Git 2.30+
- Start lokaal via `index.html` (single-file app)

Pijplijn:
- Pre-Deploy → Deploy → Post-Deploy → Vrijgave
- Poorten: Contracts/Schema, Tests, Compliance, Build, Report

Deployment:
- GitHub Pages via workflow, `.nojekyll`, `index.html`

Onderhoud:
- Analyseren → Updaten → Checks → Tests → Docs/Vrijgave

Checklist:
- Architectuur 1:1, pijplijn OK, Pages live, SBOM/handtekeningen/rapporten beschikbaar


