# T,. Fabrikage.PromptProcessing - Integration Guide

**Version:** 1.0.0  
**Signatur:** T,.&T,,.&T,,,.T.

---

## 🔌 INTEGRATION IN FABRIKATIONSSOFTWARE

### **1. Automatische Integration**

Das Prompt-Processing-System ist fest in die Fabrikationssoftware integriert.

**Pfad:** `Fabrikage.PromptProcessing/`

**Komponenten:**
- `prompts/prompt-tracker.py` - Multi-dimensionales Tracking
- `verification/prompt-verifier.py` - Verifikations-Engine
- `code-visibility/code-visibility-manager.py` - Sichtbarkeits-Manager
- `analysis/pre-analysis.py` - Vorab-Analyse
- `orchestration/prompt-pipeline.py` - Haupt-Orchestrator

---

### **2. Verwendung in Cursor AI / Fabrikage**

```python
# Automatisch bei jedem Prompt aktiviert
from Fabrikage.PromptProcessing.orchestration.prompt-pipeline import PromptPipeline

pipeline = PromptPipeline()
result = pipeline.process_prompt(user_prompt)
```

---

### **3. Standardroutine**

**Bei jedem Prompt automatisch:**

1. ✅ Vorab-Analyse (vor dem Coden)
2. ✅ Prompt-Tracking (multi-dimensional)
3. ✅ Implementierung mit Code-Sichtbarkeit
4. ✅ Verifikation nach Implementierung
5. ✅ Report-Generierung

---

### **4. Konfiguration**

**Standard-Konfiguration:**
- Codebase Root: `.` (aktuelles Verzeichnis)
- Storage: `prompts/tracker.json`
- Reports: `reports/`

**Anpassung:**
```python
pipeline = PromptPipeline(codebase_root="/path/to/codebase")
```

---

### **5. Reports**

**Automatisch generiert:**
- `reports/prompt-{session_id}.json` - Vollständiger Report
- `reports/verification-{session_id}.json` - Verifikations-Report
- `reports/visibility-{session_id}.json` - Sichtbarkeits-Report

---

*Integration abgeschlossen. System ist produktionsbereit.*

