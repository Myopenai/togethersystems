# ============================================================================
# AUTO-VALIDATE - Automatische Validierung
# ============================================================================
# Version: 1.0.0
# Erstellt: 2025-01-27
# Zweck: Automatische Validierung aller Komponenten
# ============================================================================

$ErrorActionPreference = "Continue"
$TotalChecks = 0
$PassedChecks = 0
$FailedChecks = 0

function Write-Step {
    param([string]$Message, [string]$Status = "INFO")
    $color = switch ($Status) {
        "SUCCESS" { "Green" }
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        "INFO" { "Cyan" }
        default { "White" }
    }
    Write-Host "[$Status] $Message" -ForegroundColor $color
}

function Check-Item {
    param([string]$Name, [scriptblock]$Check, [bool]$Required = $true)
    $TotalChecks++
    Write-Step "Prüfe: $Name..." "INFO"
    try {
        $result = & $Check
        if ($result) {
            Write-Step "✅ $Name - OK" "SUCCESS"
            $script:PassedChecks++
            return $true
        } else {
            if ($Required) {
                Write-Step "❌ $Name - FEHLER" "ERROR"
                $script:FailedChecks++
                return $false
            } else {
                Write-Step "⚠️  $Name - WARNUNG" "WARNING"
                return $false
            }
        }
    } catch {
        Write-Step "❌ $Name - FEHLER: $_" "ERROR"
        if ($Required) {
            $script:FailedChecks++
        }
        return $false
    }
}

Write-Step "=" * 80 "INFO"
Write-Step "STARTE AUTOMATISCHE VALIDIERUNG" "INFO"
Write-Step "=" * 80 "INFO"
Write-Step ""

# Projekt-Struktur prüfen
Write-Step "📁 Prüfe Projekt-Struktur..." "INFO"
Check-Item "Projekt-Verzeichnis existiert" { Test-Path "." }
Check-Item "src/ Verzeichnis" { Test-Path "src" }
Check-Item "tests/ Verzeichnis" { Test-Path "tests" }
Check-Item "migrations/ Verzeichnis" { Test-Path "migrations" }
Check-Item "docs/ Verzeichnis" { Test-Path "docs" } -Required $false

# Konfigurationsdateien prüfen
Write-Step "⚙️  Prüfe Konfigurationsdateien..." "INFO"
Check-Item "package.json existiert" { Test-Path "package.json" }
Check-Item ".env.example existiert" { Test-Path ".env.example" }
Check-Item ".gitignore existiert" { Test-Path ".gitignore" } -Required $false

# Code-Dateien prüfen
Write-Step "💻 Prüfe Code-Dateien..." "INFO"
Check-Item "src/index.js existiert" { Test-Path "src/index.js" }
Check-Item "src/config/index.js existiert" { Test-Path "src/config/index.js" }
Check-Item "src/utils/logger.js existiert" { Test-Path "src/utils/logger.js" }

# Datenbank-Schema prüfen
Write-Step "🗄️  Prüfe Datenbank-Schema..." "INFO"
Check-Item "Datenbank-Schema existiert" { Test-Path "migrations/001_initial_schema.sql" }

# Dependencies prüfen
Write-Step "📦 Prüfe Dependencies..." "INFO"
if (Test-Path "package.json") {
    Check-Item "package.json ist gültig JSON" {
        try {
            Get-Content "package.json" | ConvertFrom-Json | Out-Null
            $true
        } catch {
            $false
        }
    }
    
    if (Test-Path "node_modules") {
        Write-Step "✅ node_modules existiert" "SUCCESS"
    } else {
        Write-Step "⚠️  node_modules nicht gefunden. Führe 'npm install' aus." "WARNING"
    }
}

# Dokumentation prüfen
Write-Step "📚 Prüfe Dokumentation..." "INFO"
if (Test-Path "routine-settings") {
    Check-Item "README.md existiert" { Test-Path "routine-settings/README.md" } -Required $false
    Check-Item "Spezifikation existiert" { Test-Path "routine-settings/specifications" } -Required $false
    Check-Item "Beispiele existieren" { Test-Path "routine-settings/examples" } -Required $false
}

# Zusammenfassung
Write-Step "" "INFO"
Write-Step "=" * 80 "INFO"
Write-Step "VALIDIERUNGS-ZUSAMMENFASSUNG" "INFO"
Write-Step "=" * 80 "INFO"
Write-Step ""
Write-Step "Gesamt-Prüfungen: $TotalChecks" "INFO"
Write-Step "✅ Bestanden: $PassedChecks" "SUCCESS"
Write-Step "❌ Fehlgeschlagen: $FailedChecks" $(if ($FailedChecks -eq 0) { "SUCCESS" } else { "ERROR" })
Write-Step ""

if ($FailedChecks -eq 0) {
    Write-Step "✅ ALLE PRÜFUNGEN BESTANDEN!" "SUCCESS"
    exit 0
} else {
    Write-Step "❌ EINIGE PRÜFUNGEN SIND FEHLGESCHLAGEN" "ERROR"
    exit 1
}
