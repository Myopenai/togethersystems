# Standardroutine — Prompts (DE)

Ziel: Produktionspipeline deterministisch durchlaufen lassen — ohne UI-Änderung.

Grundprinzip:
- Recognize → Validate → Produce

Leitprompts:
1. Pre-Analysis  
   - Prüfe Komplexität, Abhängigkeiten, Risiken.  
   - Eingaben standardisieren (Formate, Pfade).
2. Tracking  
   - Session-ID, Artefakte, Status-Events protokollieren.  
   - Sichtbarkeit/Transparenz aktiv halten.
3. Implementierung  
   - Policies beachten (Security, Accessibility).  
   - Keine UI-Modifikationen an `chflox.html`.
4. Verifikation  
   - Gates: Contracts/Schema, Tests, Compliance, Build, Report.
5. Report  
   - KPIs, Logs, Traces, Hashes (STAMP-SHA256).


