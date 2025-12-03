# T,. Fabrikage.PromptProcessing - Standardroutine

**Version:** 1.0.0  
**Signatur:** T,.&T,,.&T,,,.T.  
**Fabrikage:** Standardroutine für Prompt-Arbeitsbereich

---

## 🏭 STANDARDROUTINE: PROMPT-VERARBEITUNGS-FLIESSBANDMASCHINE

### **Prinzip:**
Jeder Prompt wird durch die komplette Pipeline verarbeitet:
1. **Vorab-Analyse** (vor dem Coden)
2. **Prompt-Tracking** (multi-dimensional)
3. **Implementierung** (mit Code-Sichtbarkeit)
4. **Verifikation** (vollständige Prüfung)
5. **Report-Generierung**

---

## 📋 WORKFLOW

### **PHASE 1: VORAB-ANALYSE**

**Ziel:** Wichtige Ergebnisse liefern, bevor Code geschrieben wird.

**Aktionen:**
1. Prompt-Komplexität analysieren
2. Geschätzte Dateien/Funktionen berechnen
3. Abhängigkeiten identifizieren
4. Risiken erkennen
5. Empfehlungen generieren

**Output:**
- Komplexitäts-Level (low/medium/high/very_high)
- Geschätzte Implementierungs-Zeit
- Liste von Abhängigkeiten
- Risiko-Assessment
- Handlungsempfehlungen

---

### **PHASE 2: PROMPT-TRACKING**

**Ziel:** Gesamten Prompt-Inhalt seit Beginn erfassen.

**Dimensionen:**
- **Horizontal:** Zeitliche Abfolge der Prompts
- **Vertikal:** Hierarchische Tiefe (Parent-Child)
- **Diagonal:** Querverbindungen zwischen Prompts
- **Spatial:** Räumliche Erweiterung
- **Temporal:** Zeitliche Dimension
- **Logical:** Logische Verknüpfungen

**Aktionen:**
1. Session starten
2. Prompt-Segment hinzufügen
3. Verknüpfungen erstellen
4. Multi-dimensionalen Graphen aufbauen

---

### **PHASE 3: IMPLEMENTIERUNG**

**Ziel:** Code implementieren mit vollständiger Sichtbarkeit.

**Anforderungen:**
- ✅ Code muss für User sichtbar sein
- ✅ Code muss in sichtbaren Verzeichnissen sein
- ✅ Code muss lesbar sein (UTF-8, Text-Format)
- ✅ Code muss strukturiert sein

**Aktionen:**
1. Code implementieren
2. Code-Sichtbarkeit prüfen
3. Bei Bedarf Code sichtbar machen
4. Code-Pfade im Tracker speichern

---

### **PHASE 4: VERIFIKATION**

**Ziel:** Prüfen ob alles implementiert, codiert und lauffähig ist.

**Gates:**
1. **TÜV-I:** Contracts, Schema, Safety
2. **Tests:** Unit, Integration, E2E
3. **TÜV-II:** Parity, Compliance
4. **Build:** Artifacts, Hashes
5. **Report:** Audit, Attestation

**Aktionen:**
1. Anforderungen aus Prompt extrahieren
2. Implementierungen finden
3. Code-Existenz prüfen
4. Code-Sichtbarkeit prüfen
5. Lauffähigkeit prüfen
6. Status markieren

---

### **PHASE 5: REPORT-GENERIERUNG**

**Ziel:** Vollständigen Status-Report erstellen.

**Inhalt:**
- Vollständigkeit der Implementierung
- Code-Sichtbarkeits-Status
- Verifikations-Ergebnisse
- Fehlende Implementierungen
- Empfehlungen

---

## 🔧 INTEGRATION IN FABRIKATIONSSOFTWARE

### **Automatische Aktivierung:**

```python
from Fabrikage.PromptProcessing.orchestration.prompt-pipeline import PromptPipeline

# Pipeline initialisieren
pipeline = PromptPipeline(codebase_root=".")

# Prompt verarbeiten
result = pipeline.process_prompt(prompt_content)

# Nach Implementierung: Verifikation
verification = pipeline.verify_implementation(result['session_id'])

# Code-Sichtbarkeit prüfen
visibility = pipeline.check_code_visibility(result['session_id'])

# Vollständigen Report generieren
report = pipeline.generate_complete_report(result['session_id'])
```

### **Standardroutine bei jedem Prompt:**

1. **Vorab:** Pre-Analyse durchführen
2. **Während:** Prompt tracken (multi-dimensional)
3. **Nach Implementierung:** Verifikation durchführen
4. **Nach Implementierung:** Code-Sichtbarkeit prüfen
5. **Abschluss:** Report generieren

---

## 📊 METRIKEN

### **Vollständigkeit:**
- Implementierungs-Status pro Segment
- Code-Sichtbarkeits-Status
- Verifikations-Status

### **Qualität:**
- Code-Existenz
- Code-Lesbarkeit
- Code-Lauffähigkeit
- Test-Status

### **Transparenz:**
- Alle Code-Pfade sichtbar
- Alle Implementierungen nachvollziehbar
- Vollständiger Audit-Trail

---

## ✅ QUALITÄTSSICHERUNG

**Standard:** 100% Implementierung, 100% Sichtbarkeit, 100% Verifikation

**Gates:**
- ✅ Alle Prompts implementiert
- ✅ Alle Codes sichtbar
- ✅ Alle Implementierungen verifiziert
- ✅ Alle Tests bestanden

---

## 🎯 ZIEL

**"Gesamter Promptinhalt, seit Beginn des Promptes, ob alles implementiert, codiert und lauffähig ist. Der Code auch für den User sichtbar ist."**

**Erreicht durch:**
- Multi-dimensionales Tracking
- Vollständige Verifikation
- Code-Sichtbarkeits-Management
- Automatische Report-Generierung

---

*Diese Standardroutine ist fest in die Fabrikationssoftware integriert.*

