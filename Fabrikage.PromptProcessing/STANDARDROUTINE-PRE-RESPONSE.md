# Standardroutine: Pre-Response Verification

**Version:** 1.0.0  
**Signatur:** T,.&T,,.&T,,,.T.  
**Zweck:** System-Abschluss-Standard-Antwort bevor den Betreiber User Antwort gibt

---

## 🎯 ZWECK

**ARBEITSPLATZ PROMPT USER EINGABE UPDATE**

Vor JEDER User-Antwort wird automatisch geprüft:
- ✅ Alle eingegebenen Prompts funktionieren im System
- ✅ Alle Funktionen sind ausführbar
- ✅ Code-Integrität über gesamte Fläche
- ✅ Sicherheit des Prozesses
- ✅ Abhängigkeiten verfügbar

---

## 🔄 STANDARDROUTINE

### **Automatische Ausführung:**

```python
from Fabrikage.PromptProcessing.orchestration.pre-response-verification import PreResponseVerification

# Vor jeder User-Antwort:
verifier = PreResponseVerification()
result = verifier.run_full_verification()

# Standard-Antwort generieren:
if result['status'] == 'READY':
    # System bereit für Antwort
    pass
else:
    # Warnungen ausgeben
    pass
```

### **Phasen:**

1. **PHASE 1: PROMPT-VERIFIKATION**
   - Prüft alle Prompts im Tracker
   - Verifiziert Implementierungs-Status
   - Prüft Vollständigkeit

2. **PHASE 2: FUNKTIONS-VERIFIKATION**
   - Prüft alle Python-Funktionen
   - Syntax-Checks
   - Funktionsfähigkeit

3. **PHASE 3: CODE-INTEGRITÄTS-PRÜFUNG**
   - Prüft kritische Dateien
   - Über gesamte Fläche ausgebreitet
   - Sicherung des Prozesses

4. **PHASE 4: SICHERHEITS-PRÜFUNG**
   - Hardcodierte Secrets
   - Sicherheitslücken
   - Best Practices

5. **PHASE 5: ABHÄNGIGKEITS-PRÜFUNG**
   - Python-Module
   - Externe Abhängigkeiten
   - Verfügbarkeit

---

## 📊 ERGEBNIS

### **Status:**
- `READY` - System bereit, alle Prüfungen bestanden
- `WARNING` - System funktionsfähig, aber Warnungen vorhanden
- `ERROR` - Kritische Fehler gefunden

### **Standard-Antwort:**
```
╔══════════════════════════════════════════════════════════════════════════════╗
║                    SYSTEM-ABSCHLUSS-STANDARD-ANTWORT                          ║
║                    T,. Fabrikage Prompt Processing                             ║
╚══════════════════════════════════════════════════════════════════════════════╝

STATUS: READY/WARNING/ERROR
Zeitpunkt: [TIMESTAMP]

VERIFIKATIONS-ERGEBNIS:
  ✅ Bestanden: [COUNT]
  ❌ Fehlgeschlagen: [COUNT]
  📊 Erfolgsrate: [PERCENTAGE]%

[STATUS-MELDUNG]

╔══════════════════════════════════════════════════════════════════════════════╗
║                    ENDE SYSTEM-ABSCHLUSS-STANDARD                             ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## 🔧 INTEGRATION

### **Automatisch bei jedem Prompt:**

1. User gibt Prompt ein
2. **→ Pre-Response Verification läuft automatisch**
3. System prüft alle Prompts und Funktionen
4. Standard-Antwort wird generiert
5. **Dann erst:** User-Antwort wird gegeben

### **Manuelle Ausführung:**

```bash
python Fabrikage.PromptProcessing/orchestration/pre-response-verification.py
```

---

## ✅ QUALITÄTSSICHERUNG

**Standard:** 100% Verifikation vor jeder Antwort

**Gates:**
- ✅ Alle Prompts verifiziert
- ✅ Alle Funktionen geprüft
- ✅ Code-Integrität bestätigt
- ✅ Sicherheit gewährleistet
- ✅ Abhängigkeiten verfügbar

---

*Diese Standardroutine ist fest in die Fabrikationssoftware integriert und läuft automatisch vor jeder User-Antwort.*

