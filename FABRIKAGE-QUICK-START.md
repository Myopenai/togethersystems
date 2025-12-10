# FABRIKAGE QUICK START
## Schnellstart für komplette Standards-Prüfung, Tests und Deployment

**VERSION:** 2.0.0  
**STATUS:** 🔴 PERMANENT AKTIV - IBM STANDARD

---

## 🚀 SCHNELLSTART

### 1. Komplette Prüfung und Fixes (Empfohlen)

```powershell
.\FABRIKAGE-MASTER-COMPLETE-FIX-MATCH.ps1
```

**Was passiert:**
- ✅ Standards-Prüfung
- ✅ TÜV-Prüfung (404, Links, Funktionen)
- ✅ Online/Offline-Tests
- ✅ Deployment zu allen Repos
- ✅ Finale Verifikation

### 2. Nur TÜV-Prüfung

```powershell
.\FABRIKAGE-TUEV-COMPLETE-TEST-AND-FIX.ps1
```

**Was passiert:**
- ✅ Standards-Prüfung
- ✅ Dateien-Prüfung
- ✅ Fehlende Dokumente finden und erstellen
- ✅ Modular-Fabrikage prüfen

### 3. Nur Online/Offline-Tests

```powershell
.\FABRIKAGE-ONLINE-OFFLINE-TEST.ps1
```

**Was passiert:**
- ✅ Online-Version testen
- ✅ Offline-Version testen
- ✅ Vergleich beider Versionen

### 4. Nur Deployment

```powershell
.\FABRIKAGE-DEPLOY-ALL-REPOS.ps1
```

**Was passiert:**
- ✅ Deploy zu Myopenai
- ✅ Deploy zu ViewunitySystem
- ✅ Deploy zu ViewUnitySystemT

---

## 📋 PARAMETER

### FABRIKAGE-MASTER-COMPLETE-FIX-MATCH.ps1

- `-SkipTests` - Überspringt Tests
- `-SkipDeploy` - Überspringt Deployment
- `-DryRun` - Zeigt was gemacht würde, ohne es zu tun
- `-Verbose` - Detaillierte Ausgabe

**Beispiel:**
```powershell
.\FABRIKAGE-MASTER-COMPLETE-FIX-MATCH.ps1 -DryRun -Verbose
```

### FABRIKAGE-DEPLOY-ALL-REPOS.ps1

- `-DryRun` - Zeigt was deployed würde, ohne es zu tun
- `-SkipTests` - Überspringt Tests vor Deployment

**Beispiel:**
```powershell
.\FABRIKAGE-DEPLOY-ALL-REPOS.ps1 -DryRun
```

### FABRIKAGE-ONLINE-OFFLINE-TEST.ps1

- `-BaseURL` - Basis-URL für Online-Tests (Standard: https://myopenai.github.io)
- `-SkipOnline` - Überspringt Online-Tests
- `-SkipOffline` - Überspringt Offline-Tests

**Beispiel:**
```powershell
.\FABRIKAGE-ONLINE-OFFLINE-TEST.ps1 -BaseURL "https://example.com"
```

---

## 📊 REPORTS

Alle Reports werden gespeichert in:
```
reports/
├── tuev-test-results-YYYYMMDD-HHMMSS.json
├── online-offline-test-YYYYMMDD-HHMMSS.json
├── deployment-report-YYYYMMDD-HHMMSS.json
└── master-fix-match-YYYYMMDD-HHMMSS.json
```

---

## ✅ STANDARDS

Alle Skripte folgen den IBM-Standards:
- ✅ Fehler-Patterns werden konsultiert
- ✅ Modular-Fabrikage wird automatisch aktualisiert
- ✅ UTF-8 Encoding wird geprüft
- ✅ Alle Links werden validiert
- ✅ Fehlende Dokumente werden erstellt

---

## 🔧 FEHLERBEHEBUNG

### Problem: Skript läuft nicht
```powershell
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
```

### Problem: Git-Fehler beim Deployment
- Prüfe ob Git installiert ist
- Prüfe ob Repository initialisiert ist
- Prüfe ob Remote-URLs korrekt sind

### Problem: 404-Fehler
- Führe TÜV-Prüfung aus
- Fehlende Dokumente werden automatisch erstellt

---

## 📝 NÄCHSTE SCHRITTE

1. **Erste Prüfung:**
   ```powershell
   .\FABRIKAGE-MASTER-COMPLETE-FIX-MATCH.ps1 -DryRun
   ```

2. **Echte Ausführung:**
   ```powershell
   .\FABRIKAGE-MASTER-COMPLETE-FIX-MATCH.ps1
   ```

3. **Deployment:**
   ```powershell
   .\FABRIKAGE-DEPLOY-ALL-REPOS.ps1
   ```

---

**BRANDING:** .T. TogetherSystems - ModularFlux Architecture  
**VERSION:** 2.0.0  
**STANDARD:** IBM STANDARD - PERMANENT AKTIV



