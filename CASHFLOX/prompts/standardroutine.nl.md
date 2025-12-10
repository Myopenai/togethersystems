# Standaardroutine — Prompts (NL)

Doel: Productiepijplijn deterministisch uitvoeren — zonder UI-wijziging.

Kernprincipe:
- Recognize → Validate → Produce

Richtprompts:
1. Pre-analyse  
   - Beoordeel complexiteit, afhankelijkheden, risico’s.  
   - Standaardiseer invoer (formaten, paden).
2. Tracking  
   - Log sessie-ID, artefacten, status-Events.  
   - Zichtbaarheid/transparantie behouden.
3. Implementatie  
   - Policies respecteren (Security, Accessibility).  
   - Geen UI-wijzigingen aan `chflox.html`.
4. Verificatie  
   - Poorten: Contracts/Schema, Tests, Compliance, Build, Report.
5. Rapport  
   - KPI’s, logs, traces, hashes (STAMP-SHA256).


