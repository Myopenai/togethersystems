# T,. Verwendung der Scripts

**Branding:** `T,.&T,,.&T,,,.T.`

---

## ✅ Korrigierte Pfadberechnung

Alle Scripts verwenden jetzt eine korrekte Pfadberechnung:

```powershell
# Berechne Root-Verzeichnis korrekt
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir = Split-Path -Parent (Split-Path -Parent $scriptDir)
```

---

## 🚀 Verwendung

### 1. Ins TogetherSystems-Verzeichnis wechseln

```powershell
cd "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\TogetherSystems"
```

### 2. Scripts ausführen

```powershell
# Make Factory + Alle Tests
.\Fabrikage.AutoExecution\scripts\make-factory-and-test.ps1

# Nur Audit & Reset
.\Fabrikage.AutoExecution\scripts\audit-and-reset.ps1

# Nur Tests
.\Fabrikage.AutoExecution\scripts\run-all-tests.ps1
```

---

## 📁 Verfügbare Scripts

- `make-factory-and-test.ps1` - Make Factory + Alle Tests
- `audit-and-reset.ps1` - System Audit & Reset
- `run-all-tests.ps1` - Alle Tests ausführen
- `generate-dashboard.ps1` - Dashboard generieren
- `ROUTINE-UPDATE-COMPLETE.ps1` - Routine-Update

---

## ✅ Korrekturen

- ✅ Pfadberechnung korrigiert
- ✅ Verzeichnis-Prüfung hinzugefügt
- ✅ Fehlermeldungen verbessert
- ✅ TypeScript-Fehler behoben

---

**T,.&T,,.&T,,,.T.** - Together Systems, Startup Systems

