# FABRIKAGE MASTER COMPLETE FIX-MATCH
# Komplette Standards-Prüfung, Tests, Fixes und Deployment für alle Repos
# VERSION: 2.0.0
# STATUS: 🔴 PERMANENT AKTIV - IBM STANDARD

param(
    [switch]$SkipTests = $false,
    [switch]$SkipDeploy = $false,
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"
$newline = [Environment]::NewLine

# ============================================================================
# KONFIGURATION
# ============================================================================

$script:RootPath = $PSScriptRoot
$script:ReportsPath = Join-Path $RootPath "reports"
$script:MasterReportPath = Join-Path $ReportsPath "master-fix-match-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"

$script:Results = @{
    Timestamp = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    Standards = @{}
    TUEV = @{}
    OnlineOffline = @{}
    Deployment = @{}
    Fixes = @()
    Errors = @()
    Warnings = @()
}

# ============================================================================
# PHASE 1: STANDARDS-PRÜFUNG
# ============================================================================

function Phase1-Standards {
    Write-Host $newline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  PHASE 1: STANDARDS-PRÜFUNG" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    if (Test-Path "FABRIKAGE-TUEV-COMPLETE-TEST-AND-FIX.ps1") {
        Write-Host "🔍 Führe Standards-Prüfung durch..." -ForegroundColor Cyan
        $output = & ".\FABRIKAGE-TUEV-COMPLETE-TEST-AND-FIX.ps1" -SkipDeploy 2>&1
        $script:Results.Standards = @{
            Executed = $true
            Output = $output
        }
        Write-Host "✅ Standards-Prüfung abgeschlossen" -ForegroundColor Green
    } else {
        $script:Results.Errors += "FABRIKAGE-TUEV-COMPLETE-TEST-AND-FIX.ps1 nicht gefunden"
        Write-Host "❌ TÜV-Skript nicht gefunden" -ForegroundColor Red
    }
}

# ============================================================================
# PHASE 2: TÜV-PRÜFUNG
# ============================================================================

function Phase2-TUEV {
    if ($SkipTests) {
        Write-Host "⏭️  TÜV-Prüfung übersprungen" -ForegroundColor Yellow
        return
    }
    
    Write-Host $newline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  PHASE 2: TÜV-PRÜFUNG" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    Write-Host "🔍 Führe TÜV-Prüfung durch..." -ForegroundColor Cyan
    
    # TÜV-Tests ausführen
    if (Test-Path "FABRIKAGE-TUEV-COMPLETE-TEST-AND-FIX.ps1") {
        $output = & ".\FABRIKAGE-TUEV-COMPLETE-TEST-AND-FIX.ps1" 2>&1
        $script:Results.TUEV = @{
            Executed = $true
            Output = $output
        }
        Write-Host "✅ TÜV-Prüfung abgeschlossen" -ForegroundColor Green
    } else {
        $script:Results.Errors += "TÜV-Skript nicht gefunden"
        Write-Host "❌ TÜV-Skript nicht gefunden" -ForegroundColor Red
    }
}

# ============================================================================
# PHASE 3: ONLINE/OFFLINE-TESTS
# ============================================================================

function Phase3-OnlineOffline {
    if ($SkipTests) {
        Write-Host "⏭️  Online/Offline-Tests übersprungen" -ForegroundColor Yellow
        return
    }
    
    Write-Host $newline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  PHASE 3: ONLINE/OFFLINE-TESTS" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    Write-Host "🔍 Führe Online/Offline-Tests durch..." -ForegroundColor Cyan
    
    if (Test-Path "FABRIKAGE-ONLINE-OFFLINE-TEST.ps1") {
        $output = & ".\FABRIKAGE-ONLINE-OFFLINE-TEST.ps1" 2>&1
        $script:Results.OnlineOffline = @{
            Executed = $true
            Output = $output
        }
        Write-Host "✅ Online/Offline-Tests abgeschlossen" -ForegroundColor Green
    } else {
        $script:Results.Errors += "Online/Offline-Test-Skript nicht gefunden"
        Write-Host "❌ Online/Offline-Test-Skript nicht gefunden" -ForegroundColor Red
    }
}

# ============================================================================
# PHASE 4: DEPLOYMENT
# ============================================================================

function Phase4-Deployment {
    if ($SkipDeploy) {
        Write-Host "⏭️  Deployment übersprungen" -ForegroundColor Yellow
        return
    }
    
    Write-Host $newline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  PHASE 4: DEPLOYMENT" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    Write-Host "🚀 Deploye zu allen Repositories..." -ForegroundColor Cyan
    
    if (Test-Path "FABRIKAGE-DEPLOY-ALL-REPOS.ps1") {
        $params = @{}
        if ($DryRun) { $params.DryRun = $true }
        
        $output = & ".\FABRIKAGE-DEPLOY-ALL-REPOS.ps1" @params 2>&1
        $script:Results.Deployment = @{
            Executed = $true
            DryRun = $DryRun
            Output = $output
        }
        Write-Host "✅ Deployment abgeschlossen" -ForegroundColor Green
    } else {
        $script:Results.Errors += "Deployment-Skript nicht gefunden"
        Write-Host "❌ Deployment-Skript nicht gefunden" -ForegroundColor Red
    }
}

# ============================================================================
# PHASE 5: FINALE VERIFIKATION
# ============================================================================

function Phase5-Verification {
    Write-Host $newline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  PHASE 5: FINALE VERIFIKATION" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    Write-Host "🔍 Führe finale Verifikation durch..." -ForegroundColor Cyan
    
    # Prüfe ob alle kritischen Dateien vorhanden sind
    $criticalFiles = @(
        ".cursorrules",
        "settings\error-patterns.json",
        "modular-fabrikage\index.html",
        "modular-fabrikage\hilfe.html"
    )
    
    $missingFiles = @()
    foreach ($file in $criticalFiles) {
        $filePath = Join-Path $RootPath $file
        if (-not (Test-Path $filePath)) {
            $missingFiles += $file
        }
    }
    
    if ($missingFiles.Count -gt 0) {
        $script:Results.Errors += "Kritische Dateien fehlen: $($missingFiles -join ', ')"
        Write-Host "❌ $($missingFiles.Count) kritische Dateien fehlen" -ForegroundColor Red
    } else {
        Write-Host "✅ Alle kritischen Dateien vorhanden" -ForegroundColor Green
    }
    
    # Prüfe Standards in .cursorrules
    $cursorRulesPath = Join-Path $RootPath ".cursorrules"
    if (Test-Path $cursorRulesPath) {
        $cursorRules = Get-Content $cursorRulesPath -Raw
        $requiredStandards = @(
            "FEHLER-PATTERNS IMMER AKTUELL HALTEN",
            "MODULAR-FABRIKAGE-SYSTEM-AUTOUPDATE"
        )
        
        $missingStandards = @()
        foreach ($standard in $requiredStandards) {
            if ($cursorRules -notmatch [regex]::Escape($standard)) {
                $missingStandards += $standard
            }
        }
        
        if ($missingStandards.Count -gt 0) {
            $script:Results.Warnings += "Standards fehlen in .cursorrules: $($missingStandards -join ', ')"
            Write-Host "⚠️  $($missingStandards.Count) Standards fehlen in .cursorrules" -ForegroundColor Yellow
        } else {
            Write-Host "✅ Alle Standards in .cursorrules vorhanden" -ForegroundColor Green
        }
    }
}

# ============================================================================
# HAUPTFUNKTION
# ============================================================================

function Main {
    Write-Host $newline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host "  FABRIKAGE MASTER COMPLETE FIX-MATCH" -ForegroundColor Magenta
    Write-Host "  VERSION 2.0.0 - IBM STANDARD" -ForegroundColor Magenta
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
    Write-Host $newline
    
    if ($DryRun) {
        Write-Host "⚠️  DRY-RUN MODUS - Keine echten Änderungen" -ForegroundColor Yellow
    }
    
    # Phase 1: Standards
    Phase1-Standards
    
    # Phase 2: TÜV
    Phase2-TUEV
    
    # Phase 3: Online/Offline
    Phase3-OnlineOffline
    
    # Phase 4: Deployment
    Phase4-Deployment
    
    # Phase 5: Verifikation
    Phase5-Verification
    
    # Zusammenfassung
    Write-Host $newline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  ZUSAMMENFASSUNG" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    Write-Host "Fehler: $($script:Results.Errors.Count)" -ForegroundColor $(if ($script:Results.Errors.Count -eq 0) { "Green" } else { "Red" })
    Write-Host "Warnungen: $($script:Results.Warnings.Count)" -ForegroundColor $(if ($script:Results.Warnings.Count -eq 0) { "Green" } else { "Yellow" })
    Write-Host "Fixes: $($script:Results.Fixes.Count)" -ForegroundColor Green
    
    # Master-Report speichern
    if (-not (Test-Path $ReportsPath)) {
        New-Item -ItemType Directory -Path $ReportsPath -Force | Out-Null
    }
    
    $script:Results | ConvertTo-Json -Depth 10 | Set-Content -Path $MasterReportPath -Encoding UTF8
    Write-Host $newline
    Write-Host "✅ Master-Report gespeichert: $MasterReportPath" -ForegroundColor Green
    
    if ($script:Results.Errors.Count -eq 0) {
        Write-Host $newline
        Write-Host "🎉 ALLE PHASEN ERFOLGREICH ABGESCHLOSSEN!" -ForegroundColor Green
        return 0
    } else {
        Write-Host $newline
        Write-Host "⚠️  ES GIBT NOCH FEHLER ZU BEHEBEN" -ForegroundColor Yellow
        return 1
    }
}

# ============================================================================
# AUSFÜHRUNG
# ============================================================================

try {
    $exitCode = Main
    exit $exitCode
} catch {
    Write-Host "❌ KRITISCHER FEHLER: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}



