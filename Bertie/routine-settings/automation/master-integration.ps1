# ============================================================================
# MASTER-INTEGRATION - Integriert alle Automation-Komponenten
# ============================================================================
# Version: 1.0.0
# Erstellt: 2025-01-27
# Zweck: Zentrale Integration aller Automation-Scripts
# ============================================================================

$ErrorActionPreference = "Stop"

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

function Write-Banner {
    param([string]$Text)
    Write-Host ""
    Write-Host "=" * 80 -ForegroundColor Cyan
    Write-Host $Text -ForegroundColor Cyan
    Write-Host "=" * 80 -ForegroundColor Cyan
    Write-Host ""
}

# ============================================================================
# MENÜ
# ============================================================================

Write-Banner "⭐ USER-FRIENDLY ⭐ VOLLAUTOMATISCHES SYSTEM"
Write-Host ""
Write-Host "Verfügbare Optionen:" -ForegroundColor Yellow
Write-Host "  1. Vollständiges Setup (auto-setup.ps1)" -ForegroundColor White
Write-Host "  2. Setup fortsetzen (auto-continue.ps1)" -ForegroundColor White
Write-Host "  3. Validierung (auto-validate.ps1)" -ForegroundColor White
Write-Host "  4. Brand-Mark Integration (auto-brand-mark.ps1)" -ForegroundColor White
Write-Host "  5. ALLES - Vollständige Integration" -ForegroundColor Green
Write-Host "  0. Beenden" -ForegroundColor Red
Write-Host ""

$choice = Read-Host "Wähle Option (0-5)"

switch ($choice) {
    "1" {
        Write-Banner "OPTION 1: VOLLSTÄNDIGES SETUP"
        & "$PSScriptRoot\auto-setup.ps1"
    }
    "2" {
        Write-Banner "OPTION 2: SETUP FORTSETZEN"
        & "$PSScriptRoot\auto-continue.ps1"
    }
    "3" {
        Write-Banner "OPTION 3: VALIDIERUNG"
        & "$PSScriptRoot\auto-validate.ps1"
    }
    "4" {
        Write-Banner "OPTION 4: BRAND-MARK INTEGRATION"
        & "$PSScriptRoot\auto-brand-mark.ps1"
    }
    "5" {
        Write-Banner "OPTION 5: ALLES - VOLLSTÄNDIGE INTEGRATION"
        
        Write-Step "Schritt 1/4: Vollständiges Setup..." "INFO"
        & "$PSScriptRoot\auto-setup.ps1"
        
        Write-Step "Schritt 2/4: Validierung..." "INFO"
        & "$PSScriptRoot\auto-validate.ps1"
        
        Write-Step "Schritt 3/4: Brand-Mark Integration..." "INFO"
        & "$PSScriptRoot\auto-brand-mark.ps1"
        
        Write-Step "Schritt 4/4: Setup fortsetzen..." "INFO"
        & "$PSScriptRoot\auto-continue.ps1"
        
        Write-Banner "✅ ALLES ERFOLGREICH ABGESCHLOSSEN!"
        Write-Step "⭐ USER-FRIENDLY ⭐ System ist vollständig eingerichtet!" "SUCCESS"
    }
    "0" {
        Write-Step "Auf Wiedersehen!" "INFO"
        exit 0
    }
    default {
        Write-Step "❌ Ungültige Option!" "ERROR"
        exit 1
    }
}
