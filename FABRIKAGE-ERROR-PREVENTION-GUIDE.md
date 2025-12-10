# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE ERROR PREVENTION GUIDE

**Dokumentation: Verhindert alle bekannten Fehler - NIEMALS WIEDER**

---

## ❌ VERBOTENE FEHLER (NIEMALS MEHR!)

### 1. Duplikate Hash-Keys durch Encoding-Fehler

**❌ FALSCH:**
```powershell
$hash = @{
    'â€"' = '—'
    'â€"' = '"'  # DUPLIKAT!
    'â€"' = '…'  # DUPLIKAT!
}
```

**✅ RICHTIG:**
```powershell
$hash = @{
    'emdash' = '—'
    'quote1' = '"'
    'quote2' = '"'
    'ellipsis' = '…'
    'endash' = '–'
    'euro' = '€'
}
```

**Lösung:** Verwende IMMER eindeutige, beschreibende Keys statt Encoding-Fehler.

---

### 2. Fehlende schließende Klammern

**❌ FALSCH:**
```powershell
if ($condition) {
    # Code ohne }
```

**✅ RICHTIG:**
```powershell
if ($condition) {
    # Code
} # IMMER schließen!
```

**Lösung:** Prüfe IMMER: `$openBraces -eq $closeBraces`

---

### 3. Fehlende String-Terminatoren

**❌ FALSCH:**
```powershell
$text = 'Unterminated string
```

**✅ RICHTIG:**
```powershell
$text = 'Terminated string'
```

**Lösung:** Prüfe IMMER: `$quotes % 2 -eq 0`

---

### 4. Encoding-Fehler in Strings

**❌ FALSCH:**
```powershell
'zurÃ¼ck' = 'zurück'
'Ã¤' = 'ä'
```

**✅ RICHTIG:**
```powershell
'zurück' = 'zurück'  # UTF-8 Encoding!
'ä' = 'ä'
```

**Lösung:** Verwende IMMER UTF-8 Encoding: `Get-Content $file -Raw -Encoding UTF8`

---

### 5. GitHub Actions falsche Versionen

**❌ FALSCH:**
```yaml
- uses: pwsh/setup-pwsh@v1
- uses: anchore/syft-action@v0.15.0
- uses: anchore/grype-action@v0.12.0
- uses: trufflesecurity/trufflehog@v3
```

**✅ RICHTIG:**
```yaml
- uses: actions/setup-powershell@v5
- uses: anchore/sbom-action/download-syft@v1
- uses: anchore/grype-action@v1
- uses: trufflesecurity/trufflehog-action@v4
```

**Lösung:** Prüfe IMMER aktuelle Versionen auf GitHub.

---

## ✅ BEST PRACTICES

### 1. Encoding
- **IMMER** UTF-8 verwenden: `Get-Content $file -Raw -Encoding UTF8`
- **NIEMALS** Encoding-Fehler in Hash-Keys verwenden
- **IMMER** normale Umlaute verwenden (ä, ö, ü, ß)

### 2. Hash-Keys
- **IMMER** eindeutige, beschreibende Namen verwenden
- **NIEMALS** Encoding-Fehler als Keys verwenden
- **IMMER** prüfen auf Duplikate vor dem Commit

### 3. Klammern
- **IMMER** ausbalancieren: `$openBraces -eq $closeBraces`
- **IMMER** schließen: `}` für jede `{`
- **IMMER** prüfen vor dem Commit

### 4. Strings
- **IMMER** terminieren: `'text'` oder `"text"`
- **IMMER** prüfen: `$quotes % 2 -eq 0`
- **NIEMALS** untermierte Strings verwenden

### 5. GitHub Actions
- **IMMER** aktuelle Versionen verwenden
- **IMMER** prüfen: https://github.com/actions/setup-powershell/releases
- **NIEMALS** veraltete Actions verwenden

---

## 🔧 AUTOMATISCHE PRÜFUNG

### Vor jedem Commit:

```powershell
# Prüfe Syntax
$errors = Test-ScriptSyntax ".\mein-script.ps1"
if ($errors) {
    Write-Host "Fehler gefunden:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
    
    # Auto-Fix
    Fix-ScriptErrors ".\mein-script.ps1"
}
```

### Automatische Prüfung:

```powershell
# Führe Error Prevention System aus
.\FABRIKAGE-ERROR-PREVENTION-SYSTEM.ps1
```

---

## 📋 CHECKLISTE

Vor jedem Commit prüfen:

- [ ] Keine duplizierten Hash-Keys
- [ ] Alle Klammern ausbalanciert
- [ ] Alle Strings terminiert
- [ ] Keine Encoding-Fehler
- [ ] GitHub Actions aktuelle Versionen
- [ ] UTF-8 Encoding verwendet
- [ ] Syntax-Prüfung bestanden

---

## 🚫 NIEMALS WIEDER

Diese Fehler sind jetzt **SYSTEMATISCH VERBOTEN**:

1. ❌ Duplikate Hash-Keys (`'â€"' = ...`)
2. ❌ Fehlende Klammern (`{` ohne `}`)
3. ❌ Untermierte Strings (`'text` ohne `'`)
4. ❌ Encoding-Fehler (`Ã¤` statt `ä`)
5. ❌ Veraltete GitHub Actions (`pwsh/setup-pwsh@v1`)

---

**Signatur:** [.SYSTEMS.T.SYSTEMS.] FABRIKAGE  
**Version:** 1.0.0  
**Status:** ✅ **FEHLER-PREVENTION AKTIV**
