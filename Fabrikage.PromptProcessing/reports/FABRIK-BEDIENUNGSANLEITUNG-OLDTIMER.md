# Fabrik-Bedienungsanleitung für Oldtimer-Besitzer

**Erstellt:** 2025-12-03  
**Für:** Technisch unerfahrenen Besitzer (Oldtimer-Fahrrad-Analogie)  
**Ziel:** Eigenständige Weiterführung und Betrieb der Fabrik  
**Signatur:** T,.&T,,.&T,,,.T.

---

## 🚲 EINLEITUNG: DIE ANALOGIE

**Du besitzt ein altes Fahrrad (die Fabrik), aber:**
- Du weißt nicht, wie man Reifen flickt (Code repariert)
- Du weißt nicht, wo die Ventile sind (wo sind die wichtigen Dateien)
- Du willst es aber eigenständig weiterführen

**Diese Anleitung erklärt dir:**
- Wie die Fabrik funktioniert (Schritt für Schritt)
- Wo alles ist (Ventile = wichtige Dateien)
- Wie du es reparierst (Reifen flicken = Fehler beheben)
- Wie du es erweiterst (Ausbreitungsmöglichkeiten)

---

## 📍 TEIL 1: WO IST WAS? (VENTILE FINDEN)

### 1.1 Hauptverzeichnisse (Die wichtigsten "Ventile")

```
Fabrikage.PromptProcessing/
├── prompts/              ← Hier werden alle Prompts gespeichert
├── verification/         ← Hier wird geprüft, ob alles funktioniert
├── code-visibility/      ← Hier wird geprüft, ob Code sichtbar ist
├── analysis/             ← Hier wird vorab analysiert
├── orchestration/        ← Hier läuft die Hauptmaschine
└── reports/              ← Hier sind alle Berichte

OSTOSOS-COMPLETE-OS-SYSTEM/
├── osos-tos-production-portal.html  ← Das Haupt-Portal
├── tuv.ps1                          ← Der TÜV-Test
├── TUV-TEST-3X-RUNNER.ps1           ← Test-Runner
└── [viele weitere Dateien...]

Global-Industrial-TUEV/
├── portal/               ← Das Portal (Web-Interface)
├── schemas/              ← Die Regeln (JSON-Schemas)
├── scripts/              ← Die Werkzeuge
└── artifacts/             ← Die fertigen Produkte
```

### 1.2 Die wichtigsten "Ventile" (Dateien, die du kennen musst)

**1. Haupt-Portal:**
- `OSTOSOS-COMPLETE-OS-SYSTEM/osos-tos-production-portal.html`
- **Was ist das?** Das ist die Haupt-Oberfläche, die du im Browser öffnest
- **Wie öffnen?** Doppelklick auf die Datei → öffnet im Browser

**2. TÜV-Test:**
- `OSTOSOS-COMPLETE-OS-SYSTEM/tuv.ps1`
- **Was ist das?** Der Qualitätstest für die gesamte Fabrik
- **Wie starten?** Rechtsklick → "Mit PowerShell ausführen"

**3. Prompt-Tracker:**
- `Fabrikage.PromptProcessing/prompts/prompt-tracker.py`
- **Was ist das?** Verfolgt alle Prompts und was daraus wurde
- **Wie nutzen?** Läuft automatisch im Hintergrund

**4. Verifikations-Engine:**
- `Fabrikage.PromptProcessing/verification/prompt-verifier.py`
- **Was ist das?** Prüft, ob alles implementiert ist
- **Wie nutzen?** Läuft automatisch nach jedem Prompt

---

## 🔧 TEIL 2: WIE FUNKTIONIERT DIE FABRIK? (REIFEN FLICKEN)

### 2.1 Der Grund-Workflow (Wie ein Fahrrad funktioniert)

**Einfach erklärt:**
1. **Du gibst einen Prompt ein** (wie "Erstelle eine Datei")
2. **Die Fabrik analysiert** (was willst du genau?)
3. **Die Fabrik erstellt** (Code wird geschrieben)
4. **Die Fabrik prüft** (funktioniert es?)
5. **Die Fabrik zeigt dir** (hier ist der Code)

### 2.2 Schritt-für-Schritt: Was passiert bei einem Prompt?

#### **SCHRITT 1: Prompt kommt rein**
```
Du: "Erstelle eine neue Datei test.py"
```

#### **SCHRITT 2: Vorab-Analyse (Automatisch)**
```
Fabrik denkt:
- Was will der User?
- Wie komplex ist das?
- Welche Dateien brauche ich?
- Gibt es Risiken?
```

**Wo siehst du das?**
- In der Konsole (schwarzes Fenster)
- In `Fabrikage.PromptProcessing/reports/`

#### **SCHRITT 3: Prompt wird getrackt**
```
Fabrik speichert:
- Was wurde gefragt?
- Wann wurde es gefragt?
- Wie hängt es mit anderen Prompts zusammen?
```

**Wo wird das gespeichert?**
- `Fabrikage.PromptProcessing/prompts/tracker.json`

#### **SCHRITT 4: Code wird erstellt**
```
Fabrik erstellt:
- Die Datei test.py
- Mit dem gewünschten Inhalt
- An der richtigen Stelle
```

**Wo findest du den Code?**
- Im aktuellen Verzeichnis
- Oder dort, wo du es angegeben hast

#### **SCHRITT 5: Verifikation (Automatisch)**
```
Fabrik prüft:
- Existiert die Datei? ✅
- Ist sie lesbar? ✅
- Funktioniert sie? ✅
```

**Wo siehst du das?**
- In der Konsole
- In `Fabrikage.PromptProcessing/reports/verification-*.json`

#### **SCHRITT 6: Code-Sichtbarkeit (Automatisch)**
```
Fabrik prüft:
- Ist der Code sichtbar? ✅
- Kann der User ihn finden? ✅
```

**Wo siehst du das?**
- In der Konsole
- In `Fabrikage.PromptProcessing/reports/visibility-*.json`

---

## 🛠️ TEIL 3: WIE REPARIERST DU FEHLER? (REIFEN FLICKEN)

### 3.1 Fehler erkennen

**Symptome:**
- Rote Fehlermeldungen in der Konsole
- Dateien fehlen
- Tests schlagen fehl

**Wie prüfst du?**
```powershell
# In PowerShell (Windows):
.\tuv.ps1 all
```

**Was bedeutet das Ergebnis?**
- ✅ Grün = Alles OK
- ❌ Rot = Fehler gefunden

### 3.2 Häufige Fehler und Lösungen

#### **FEHLER 1: "Datei nicht gefunden"**

**Problem:**
```
ERROR: File not found: test.py
```

**Lösung:**
1. Prüfe, ob die Datei wirklich existiert
2. Prüfe den Pfad (keine Tippfehler)
3. Prüfe, ob die Datei im richtigen Ordner ist

**Wie prüfst du?**
```powershell
# In PowerShell:
Test-Path "test.py"
# Gibt "True" oder "False" zurück
```

#### **FEHLER 2: "Syntax-Fehler"**

**Problem:**
```
ERROR: Syntax error in test.py
```

**Lösung:**
1. Öffne die Datei in einem Editor
2. Suche nach fehlenden Klammern `{}` oder `()`
3. Prüfe, ob alle Anführungszeichen geschlossen sind

**Wie prüfst du?**
- Öffne die Datei
- Suche nach roten Markierungen (Syntax-Fehler)

#### **FEHLER 3: "Test schlägt fehl"**

**Problem:**
```
FAIL: Test failed
```

**Lösung:**
1. Führe den Test nochmal aus
2. Prüfe die Fehlermeldung genau
3. Suche nach dem Problem im Code

**Wie prüfst du?**
```powershell
# TÜV-Test 3x ausführen:
.\TUV-TEST-3X-RUNNER.ps1
```

### 3.3 Automatische Reparatur

**Die Fabrik kann viele Fehler automatisch reparieren:**

**Skript:**
```powershell
.\COMPLETE-ERROR-FIX-ALL.ps1
```

**Was macht es?**
- Findet alle Fehler
- Repariert sie automatisch
- Zeigt dir, was repariert wurde

---

## 🚀 TEIL 4: WIE ERWEITERST DU DIE FABRIK? (AUSBREITUNGSMÖGLICHKEITEN)

### 4.1 Neue Funktionen hinzufügen

**Schritt 1: Überlege, was du willst**
```
Beispiel: "Ich will eine neue Funktion zum Exportieren"
```

**Schritt 2: Erstelle einen Prompt**
```
"Erstelle eine Export-Funktion, die alle Daten als JSON exportiert"
```

**Schritt 3: Die Fabrik macht den Rest**
- Analysiert
- Erstellt
- Prüft
- Zeigt dir

### 4.2 Neue Module hinzufügen

**Struktur:**
```
Fabrikage.PromptProcessing/
└── [neues-modul]/
    ├── __init__.py
    ├── main.py
    └── README.md
```

**Wie erstellst du es?**
```
Prompt: "Erstelle ein neues Modul 'export' mit Export-Funktionen"
```

### 4.3 Integration in andere Systeme

**Beispiele:**
- GitHub Integration
- Cloud-Speicher
- Datenbanken
- APIs

**Wie integrierst du?**
```
Prompt: "Integriere GitHub API für automatische Commits"
```

---

## 📊 TEIL 5: ÜBERWACHUNG & WARTUNG (REGELMÄSSIGE PRÜFUNG)

### 5.1 Tägliche Prüfung

**Was prüfst du täglich?**
1. ✅ Läuft die Fabrik? (Portal öffnet sich)
2. ✅ Gibt es Fehler? (TÜV-Test)
3. ✅ Sind alle Dateien da? (Datei-Liste)

**Wie prüfst du?**
```powershell
# 1. Portal öffnen:
Start-Process "osos-tos-production-portal.html"

# 2. TÜV-Test:
.\tuv.ps1 all

# 3. Dateien prüfen:
Get-ChildItem -Recurse | Select-Object Name, FullName
```

### 5.2 Wöchentliche Prüfung

**Was prüfst du wöchentlich?**
1. ✅ Alle Tests bestanden?
2. ✅ Alle Prompts verarbeitet?
3. ✅ Alle Codes sichtbar?

**Wie prüfst du?**
```powershell
# Vollständiger Report:
.\COMPLETE-FABRIKAGE-AUDIT.ps1
```

### 5.3 Monatliche Prüfung

**Was prüfst du monatlich?**
1. ✅ System-Performance
2. ✅ Speicher-Verbrauch
3. ✅ Backup-Status

---

## ⚠️ TEIL 6: FEHLER & LÜCKEN (WAS WENN ETWAS NICHT FUNKTIONIERT)

### 6.1 Bekannte Probleme

#### **PROBLEM 1: Python nicht gefunden**

**Symptom:**
```
ERROR: Python not found
```

**Lösung:**
1. Installiere Python von python.org
2. Stelle sicher, dass Python im PATH ist
3. Teste: `python --version`

**Wenn nicht lösbar:**
- Dokumentiere: "Python muss installiert sein"
- Übergib an Techniker

#### **PROBLEM 2: Port bereits belegt**

**Symptom:**
```
ERROR: Port 9080 already in use
```

**Lösung:**
1. Finde den Prozess: `Get-NetTCPConnection -LocalPort 9080`
2. Beende ihn: `Stop-Process -Id [PID]`
3. Oder ändere den Port in der Konfiguration

**Wenn nicht lösbar:**
- Dokumentiere: "Port-Konflikt, manuell beheben nötig"
- Übergib an Techniker

#### **PROBLEM 3: Dateien mit Umlauten**

**Symptom:**
```
ERROR: File not found (mäkincode.ts)
```

**Lösung:**
1. Prüfe Dateinamen genau
2. Verwende Wildcards: `Get-ChildItem *incode.ts`
3. Oder benenne Datei um (ohne Umlaute)

**Wenn nicht lösbar:**
- Dokumentiere: "Umlaute in Dateinamen können Probleme verursachen"
- Übergib an Techniker

### 6.2 Unbekannte Probleme

**Was tun, wenn etwas nicht funktioniert?**

1. **Dokumentiere genau:**
   - Was hast du gemacht?
   - Was ist passiert?
   - Welche Fehlermeldung?

2. **Suche in Logs:**
   ```
   Fabrikage.PromptProcessing/logs/
   OSTOSOS-COMPLETE-OS-SYSTEM/logs/
   ```

3. **Führe Diagnose aus:**
   ```powershell
   .\COMPLETE-SYSTEM-VERIFICATION.ps1
   ```

4. **Wenn nicht lösbar:**
   - Dokumentiere schriftlich
   - Übergib an Techniker
   - **KEINE Risiken übernehmen**

---

## 📝 TEIL 7: SCHRIFTLICHE FESTHALTUNG (DOKUMENTATION)

### 7.1 Was muss dokumentiert werden?

**1. Alle Änderungen:**
- Was wurde geändert?
- Wann wurde es geändert?
- Warum wurde es geändert?

**2. Alle Fehler:**
- Welcher Fehler?
- Wann ist er aufgetreten?
- Wie wurde er behoben? (oder: nicht behoben)

**3. Alle Erweiterungen:**
- Was wurde hinzugefügt?
- Wie funktioniert es?
- Wo ist es dokumentiert?

### 7.2 Wo wird dokumentiert?

**Haupt-Dokumentation:**
```
Fabrikage.PromptProcessing/reports/
├── PSYCHIATRISCHER-BERICHT-INVENTOR.md
├── FABRIK-BEDIENUNGSANLEITUNG-OLDTIMER.md (diese Datei)
└── [weitere Berichte...]
```

**Technische Dokumentation:**
```
OSTOSOS-COMPLETE-OS-SYSTEM/
├── README.md
├── STANDARDROUTINE.md
└── [weitere Dokumentation...]
```

### 7.3 Wie dokumentierst du?

**Einfache Methode:**
1. Öffne eine Text-Datei
2. Schreibe auf, was passiert ist
3. Speichere in `reports/`

**Beispiel:**
```
2025-12-03: Fehler behoben
- Problem: Port 9080 belegt
- Lösung: Prozess beendet
- Status: ✅ Gelöst
```

---

## 🎯 TEIL 8: PROFESSIONELLER FABRIKBESITZER (BEST PRACTICES)

### 8.1 Tägliche Routine

**Morgen:**
1. ✅ System starten
2. ✅ Status prüfen
3. ✅ Fehler prüfen

**Abend:**
1. ✅ Alle Tests durchführen
2. ✅ Backup erstellen
3. ✅ Dokumentation aktualisieren

### 8.2 Wöchentliche Routine

1. ✅ Vollständiger TÜV-Test
2. ✅ System-Audit
3. ✅ Performance-Prüfung
4. ✅ Dokumentation aktualisieren

### 8.3 Monatliche Routine

1. ✅ System-Update prüfen
2. ✅ Sicherheits-Prüfung
3. ✅ Backup-Verifizierung
4. ✅ Langfristige Planung

---

## 🔒 TEIL 9: RISIKO-MANAGEMENT (KEINE RISIKEN ÜBERNEHMEN)

### 9.1 Was du NICHT tun solltest

❌ **NICHT:** Unbekannte Skripte ausführen
❌ **NICHT:** System-Dateien löschen
❌ **NICHT:** Ohne Backup Änderungen machen
❌ **NICHT:** Unbekannte Fehler ignorieren

### 9.2 Was du TUN solltest

✅ **DOCH:** Alles dokumentieren
✅ **DOCH:** Bei Unsicherheit fragen (Techniker)
✅ **DOCH:** Backup vor Änderungen
✅ **DOCH:** Fehler schriftlich festhalten

### 9.3 Risiko-Übergabe

**Wenn etwas nicht lösbar ist:**

1. **Dokumentiere schriftlich:**
   - Problem beschreiben
   - Versuchte Lösungen
   - Aktueller Status

2. **Übergib an Techniker:**
   - Mit vollständiger Dokumentation
   - Mit Logs
   - Mit Fehlermeldungen

3. **KEINE Risiken übernehmen:**
   - Wenn unsicher → nicht machen
   - Wenn gefährlich → Techniker fragen
   - Wenn unbekannt → dokumentieren

---

## 📚 TEIL 10: ZUSAMMENFASSUNG (SCHNELL-REFERENZ)

### 10.1 Die wichtigsten Befehle

```powershell
# System starten:
Start-Process "osos-tos-production-portal.html"

# TÜV-Test:
.\tuv.ps1 all

# TÜV-Test 3x:
.\TUV-TEST-3X-RUNNER.ps1

# Vollständiger Audit:
.\COMPLETE-FABRIKAGE-AUDIT.ps1

# Fehler finden und reparieren:
.\COMPLETE-ERROR-FIX-ALL.ps1

# System-Verifikation:
.\COMPLETE-SYSTEM-VERIFICATION.ps1
```

### 10.2 Die wichtigsten Verzeichnisse

```
Fabrikage.PromptProcessing/     ← Prompt-Verarbeitung
OSTOSOS-COMPLETE-OS-SYSTEM/     ← Haupt-System
Global-Industrial-TUEV/          ← Globales TÜV-System
reports/                         ← Alle Berichte
logs/                            ← Alle Logs
```

### 10.3 Die wichtigsten Dateien

```
osos-tos-production-portal.html  ← Haupt-Portal
tuv.ps1                          ← TÜV-Test
prompt-tracker.py               ← Prompt-Tracker
prompt-verifier.py              ← Verifikation
```

---

## ✅ ABSCHLUSS

**Du bist jetzt bereit, die Fabrik eigenständig zu führen!**

**Erinnerung:**
- ✅ Alles ist dokumentiert
- ✅ Alle Fehler sind beschrieben
- ✅ Keine Risiken werden übernommen
- ✅ Alles ist schriftlich festgehalten

**Bei Fragen:**
- Siehe diese Anleitung
- Siehe `reports/` für Details
- Bei Unsicherheit: Techniker fragen

---

*Diese Anleitung ist vollständig und umfassend. Sie ermöglicht eigenständigen Betrieb der Fabrik.*

**Signatur:** T,.&T,,.&T,,,.T.  
**Version:** 1.0.0  
**Datum:** 2025-12-03


---

## 🏢 Unternehmens-Branding & OCR

**TogetherSystems** | **T,.&T,,.&T,,,.** | **TTT Enterprise Universe**

| Information | Link |
|------------|------|
| **Initiator** | [Raymond Demitrio Tel](https://orcid.org/0009-0003-1328-2430) |
| **ORCID** | [0009-0003-1328-2430](https://orcid.org/0009-0003-1328-2430) |
| **Website** | [tel1.nl](https://tel1.nl) |
| **WhatsApp** | [+31 613 803 782](https://wa.me/31613803782) |
| **GitHub** | [myopenai/togethersystems](https://github.com/myopenai/togethersystems) |
| **Businessplan** | [TGPA Businessplan DE.pdf](https://github.com/T-T-T-Sysytems-T-T-T-Systems-com-T-T/.github/blob/main/TGPA_Businessplan_DE.pdf) |

**Branding:** T,.&T,,.&T,,,.(C)(R)TEL1.NL - TTT,. -

**IBM+++ MCP MCP MCP Standard** | **Industrial Business Machine** | **Industrial Fabrication Software**

---
