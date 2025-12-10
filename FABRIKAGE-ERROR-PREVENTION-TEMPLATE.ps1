# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE ERROR PREVENTION TEMPLATE
# Template für neue PowerShell-Scripts - VERHINDERT ALLE BEKANNTEN FEHLER

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

# ============================================
# WICHTIG: Diese Fehler NIEMALS machen!
# ============================================

# ❌ FEHLER 1: Duplikate Hash-Keys durch Encoding-Fehler
# FALSCH:
# $hash = @{
#     'â€"' = '—'
#     'â€"' = '"'  # DUPLIKAT!
# }
# RICHTIG:
$hash = @{
    'emdash' = '—'
    'quote1' = '"'
    'quote2' = '"'
    'ellipsis' = '…'
    'endash' = '–'
    'euro' = '€'
}

# ❌ FEHLER 2: Fehlende schließende Klammern
# FALSCH:
# if ($condition) {
#     # Code ohne }
# RICHTIG:
if ($condition) {
    # Code
} # IMMER schließen!

# ❌ FEHLER 3: Fehlende String-Terminatoren
# FALSCH:
# $text = 'Unterminated string
# RICHTIG:
$text = 'Terminated string'

# ❌ FEHLER 4: Encoding-Fehler in Strings
# FALSCH:
# 'zurÃ¼ck' = 'zurück'
# RICHTIG:
'zurück' = 'zurück'  # UTF-8 Encoding verwenden!

# ❌ FEHLER 5: GitHub Actions falsche Versionen
# FALSCH:
# uses: pwsh/setup-pwsh@v1
# RICHTIG:
# uses: actions/setup-powershell@v5

# ============================================
# BEST PRACTICES
# ============================================

# 1. IMMER UTF-8 Encoding verwenden
# Get-Content $file -Raw -Encoding UTF8

# 2. Hash-Keys IMMER eindeutig machen
# Verwende beschreibende Namen statt Encoding-Fehler

# 3. Klammern IMMER ausbalancieren
# Prüfe: $openBraces -eq $closeBraces

# 4. Strings IMMER terminieren
# Prüfe: $quotes % 2 -eq 0

# 5. GitHub Actions IMMER aktuelle Versionen verwenden
# Prüfe: https://github.com/actions/setup-powershell/releases

# ============================================
# VALIDATION FUNCTION
# ============================================

function Test-ScriptSyntax {
    param($ScriptPath)
    
    $errors = @()
    $content = Get-Content $ScriptPath -Raw -Encoding UTF8
    
    # Prüfe Hash-Duplikate
    $hashMatches = [regex]::Matches($content, "['\""]([^'\""]+)['\""]\s*=")
    $keys = $hashMatches | ForEach-Object { $_.Groups[1].Value }
    $duplicates = $keys | Group-Object | Where-Object { $_.Count -gt 1 }
    if ($duplicates) {
        $errors += "Duplikate Hash-Keys gefunden: $($duplicates.Name -join ', ')"
    }
    
    # Prüfe Klammern
    $openBraces = ([regex]::Matches($content, '\{')).Count
    $closeBraces = ([regex]::Matches($content, '\}')).Count
    if ($openBraces -ne $closeBraces) {
        $errors += "Ungleiche Klammern: $openBraces öffnend, $closeBraces schließend"
    }
    
    # Prüfe String-Terminatoren
    $singleQuotes = ([regex]::Matches($content, "(?<!')'(?!')")).Count
    $doubleQuotes = ([regex]::Matches($content, '(?<!")"(?!")')).Count
    if ($singleQuotes % 2 -ne 0) {
        $errors += "Ungerade Anzahl von Single-Quotes (fehlender Terminator)"
    }
    if ($doubleQuotes % 2 -ne 0) {
        $errors += "Ungerade Anzahl von Double-Quotes (fehlender Terminator)"
    }
    
    # Prüfe Encoding-Fehler
    if ($content -match 'Ã¤|Ã¶|Ã¼|ÃŸ|â€"') {
        $errors += "Encoding-Fehler gefunden (verwende UTF-8)"
    }
    
    return $errors
}

# ============================================
# AUTO-FIX FUNCTION
# ============================================

function Fix-ScriptErrors {
    param($ScriptPath)
    
    $content = Get-Content $ScriptPath -Raw -Encoding UTF8
    $original = $content
    
    # Fix 1: Hash-Duplikate
    $content = $content -replace "'â€\"' = '—'", "'emdash' = '—'"
    $content = $content -replace "'â€\"' = '\""", "'quote1' = '\"""
    $content = $content -replace "'â€\"' = '\""", "'quote2' = '\"""
    $content = $content -replace "'â€\"' = '…'", "'ellipsis' = '…'"
    $content = $content -replace "'â€\"' = '–'", "'endash' = '–'"
    $content = $content -replace "'â€\"' = '€'", "'euro' = '€'"
    
    # Fix 2: Encoding-Fehler
    $content = $content -replace 'Ã¤', 'ä'
    $content = $content -replace 'Ã¶', 'ö'
    $content = $content -replace 'Ã¼', 'ü'
    $content = $content -replace 'ÃŸ', 'ß'
    $content = $content -replace 'zurÃ¼ck', 'zurück'
    
    # Fix 3: Fehlende Klammern
    $openBraces = ([regex]::Matches($content, '\{')).Count
    $closeBraces = ([regex]::Matches($content, '\}')).Count
    if ($openBraces -gt $closeBraces) {
        $missing = $openBraces - $closeBraces
        for ($i = 0; $i -lt $missing; $i++) {
            $content += "`n}"
        }
    }
    
    if ($content -ne $original) {
        $content | Out-File -FilePath $ScriptPath -Encoding UTF8 -NoNewline
        return $true
    }
    return $false
}

# ============================================
# USAGE
# ============================================

# Vor dem Commit:
# $errors = Test-ScriptSyntax ".\mein-script.ps1"
# if ($errors) {
#     Write-Host "Fehler gefunden:" -ForegroundColor Red
#     $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
#     Fix-ScriptErrors ".\mein-script.ps1"
# }
