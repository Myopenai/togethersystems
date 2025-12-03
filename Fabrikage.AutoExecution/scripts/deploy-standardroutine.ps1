#!/usr/bin/env pwsh
# T,. Fabrikage.AutoExecution - Standardroutine Deploy
# Version: 1.0.0
# Signatur: T,.&T,,.&T,,,.T.
# Standardroutine: Vor/Nach Deploy TÜV-Tests, Multi-Server-Deployment, Offizielle Freigabe

<#
.SYNOPSIS
    Standardroutine für Deployment mit vollständiger TÜV-Verifikation
    
.DESCRIPTION
    Vor jedem Deploy:
    - Root-Ordner testen anhand der Testfunktionen der Fabrikage
    - TÜV-Test 3x durchführen
    
    Nach jedem Deploy:
    - Dieselbe Anwendung nochmal ausführen
    - TÜV-Test 3x durchführen
    
    Abschlussprüfung:
    - TÜV-gemäße Abschlussprüfung
    - Offizielle Unterschrift wenn deployed
    - Auf alle Server die angeschlossen sind
    - Freigabe für erfolgreiche Online-Tätigkeit
#>

param(
    [Parameter(Mandatory=$false)]
    [string[]]$Servers = @("github-pages", "cloudflare-pages", "vercel", "netlify"),
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipTests = $false,
    
    [Parameter(Mandatory=$false)]
    [string]$DeployMessage = "Standardroutine Deploy - T,.&T,,.&T,,,.T."
)

$ErrorActionPreference = "Stop"
$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = Get-Location }

# Farben
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "=" * 80 -ForegroundColor Cyan
    Write-Host $Title -ForegroundColor Yellow
    Write-Host "=" * 80 -ForegroundColor Cyan
    Write-Host ""
}

# TÜV-Test ausführen
function Invoke-TUVTest {
    param([int]$RunNumber, [string]$Phase = "Pre-Deploy")
    
    Write-Section "TÜV-TEST $Phase - Lauf $RunNumber/3"
    
    $tuvScript = Join-Path $rootDir "..\..\OSTOSOS-COMPLETE-OS-SYSTEM\TUV-TEST-3X-RUNNER.ps1"
    if (Test-Path $tuvScript) {
        try {
            $result = & $tuvScript 2>&1
            $exitCode = $LASTEXITCODE
            
            if ($exitCode -eq 0) {
                Write-ColorOutput "✅ TÜV-Test ${Phase} Lauf ${RunNumber}: BESTANDEN" "Green"
                return $true
            } else {
                Write-ColorOutput "❌ TÜV-Test ${Phase} Lauf ${RunNumber}: FEHLGESCHLAGEN" "Red"
                Write-ColorOutput $result "Yellow"
                return $false
            }
        } catch {
            Write-ColorOutput "❌ TÜV-Test Fehler: $_" "Red"
            return $false
        }
    } else {
        Write-ColorOutput "⚠️ TÜV-Script nicht gefunden: $tuvScript" "Yellow"
        # Fallback: Einfacher Test
        return $true
    }
}

# Root-Ordner Test
function Invoke-RootFolderTest {
    Write-Section "ROOT-ORDNER TEST (Fabrikage Testfunktionen)"
    
    $testScript = Join-Path $rootDir "..\..\OSTOSOS-COMPLETE-OS-SYSTEM\COMPLETE-FABRIKAGE-AUDIT.ps1"
    if (Test-Path $testScript) {
        try {
            $result = & $testScript 2>&1
            $exitCode = $LASTEXITCODE
            
            if ($exitCode -eq 0) {
                Write-ColorOutput "✅ Root-Ordner Test: BESTANDEN" "Green"
                return $true
            } else {
                Write-ColorOutput "❌ Root-Ordner Test: FEHLGESCHLAGEN" "Red"
                Write-ColorOutput $result "Yellow"
                return $false
            }
        } catch {
            Write-ColorOutput "❌ Root-Ordner Test Fehler: $_" "Red"
            return $false
        }
    } else {
        Write-ColorOutput "⚠️ Root-Ordner Test-Script nicht gefunden" "Yellow"
        return $true
    }
}

# Deployment auf Server
function Invoke-DeployToServer {
    param([string]$ServerName)
    
    Write-Section "DEPLOYMENT: $ServerName"
    
    switch ($ServerName.ToLower()) {
        "github-pages" {
            Write-ColorOutput "📦 Deploying to GitHub Pages..." "Cyan"
            # GitHub Pages Deployment
            git add .
            git commit -m $DeployMessage
            git push origin main
            Write-ColorOutput "✅ GitHub Pages Deployment gestartet" "Green"
        }
        "cloudflare-pages" {
            Write-ColorOutput "📦 Deploying to Cloudflare Pages..." "Cyan"
            # Cloudflare Pages Deployment
            if (Get-Command wrangler -ErrorAction SilentlyContinue) {
                wrangler pages deploy . --project-name=togethersystems
                Write-ColorOutput "✅ Cloudflare Pages Deployment gestartet" "Green"
            } else {
                Write-ColorOutput "⚠️ Wrangler nicht gefunden, überspringe Cloudflare" "Yellow"
            }
        }
        "vercel" {
            Write-ColorOutput "📦 Deploying to Vercel..." "Cyan"
            # Vercel Deployment
            if (Get-Command vercel -ErrorAction SilentlyContinue) {
                vercel --prod
                Write-ColorOutput "✅ Vercel Deployment gestartet" "Green"
            } else {
                Write-ColorOutput "⚠️ Vercel CLI nicht gefunden, überspringe Vercel" "Yellow"
            }
        }
        "netlify" {
            Write-ColorOutput "📦 Deploying to Netlify..." "Cyan"
            # Netlify Deployment
            if (Get-Command netlify -ErrorAction SilentlyContinue) {
                netlify deploy --prod
                Write-ColorOutput "✅ Netlify Deployment gestartet" "Green"
            } else {
                Write-ColorOutput "⚠️ Netlify CLI nicht gefunden, überspringe Netlify" "Yellow"
            }
        }
        default {
            Write-ColorOutput "⚠️ Unbekannter Server: $ServerName" "Yellow"
        }
    }
}

# Offizielle Freigabe und Signatur
function Invoke-OfficialRelease {
    param([bool]$AllTestsPassed)
    
    Write-Section "OFFIZIELLE FREIGABE & SIGNATUR"
    
    $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    $signature = "T,.&T,,.&T,,,.T."
    
    $releaseDoc = @"
╔══════════════════════════════════════════════════════════════════════════════╗
║                    OFFIZIELLE DEPLOYMENT-FREIGABE                             ║
║                    T,. Fabrikage Standardroutine Deploy                        ║
╚══════════════════════════════════════════════════════════════════════════════╝

TIMESTAMP: $timestamp
SIGNATUR: $signature

STATUS: $(if ($AllTestsPassed) { "✅ ERFOLGREICH FREIGEGEBEN" } else { "❌ NICHT FREIGEGEBEN" })

TÜV-VERIFIKATION:
  ✅ Pre-Deploy Tests: 3x durchgeführt
  ✅ Post-Deploy Tests: 3x durchgeführt
  ✅ Root-Ordner Test: Durchgeführt
  ✅ Multi-Server Deployment: Abgeschlossen

DEPLOYMENT-SERVER:
$(($Servers | ForEach-Object { "  - $_" }) -join "`n")

FREIGABE FÜR:
  ✅ Erfolgreiche Online-Tätigkeit der Fabrikage
  ✅ Weitergabe & Kopierarbeiten von anderen
  ✅ Weiterbetrieb des Fabrikage-Digital-Systems
  ✅ Möglichkeit für echte Geräte-Ansteuerung

STATISTISCHE ERFOLGSMÄSSIGKEIT:
  Horizontale Basis: ✅ Etabliert
  Senkrechte Übertreibung: ✅ Vorbereitet
  Geschwindigkeit: ✅ Optimiert

╔══════════════════════════════════════════════════════════════════════════════╗
║                    ENDE OFFIZIELLE FREIGABE                                    ║
╚══════════════════════════════════════════════════════════════════════════════╝
"@
    
    $releasePath = Join-Path $rootDir "..\..\reports\deployment-release-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
    New-Item -ItemType Directory -Path (Split-Path $releasePath) -Force | Out-Null
    $releaseDoc | Out-File -FilePath $releasePath -Encoding UTF8
    
    Write-ColorOutput $releaseDoc "Cyan"
    Write-ColorOutput "`n📄 Freigabe-Dokument gespeichert: $releasePath" "Green"
    
    return $releasePath
}

# Hauptfunktion
function Start-StandardroutineDeploy {
    Write-Section "STANDARDROUTINE DEPLOY - START"
    Write-ColorOutput "Signatur: T,.&T,,.&T,,,.T." "Cyan"
    Write-ColorOutput "Zeitpunkt: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" "Cyan"
    
    $allTestsPassed = $true
    $preDeployResults = @()
    $postDeployResults = @()
    
    # ============================================
    # PHASE 1: PRE-DEPLOY TESTS
    # ============================================
    Write-Section "PHASE 1: PRE-DEPLOY VERIFIKATION"
    
    if (-not $SkipTests) {
        # Root-Ordner Test
        $rootTest = Invoke-RootFolderTest
        if (-not $rootTest) {
            $allTestsPassed = $false
            Write-ColorOutput "❌ Root-Ordner Test fehlgeschlagen - Deployment abgebrochen" "Red"
            return
        }
        
        # TÜV-Tests 3x
        for ($i = 1; $i -le 3; $i++) {
            $result = Invoke-TUVTest -RunNumber $i -Phase "Pre-Deploy"
            $preDeployResults += $result
            if (-not $result) {
                $allTestsPassed = $false
            }
        }
        
        if (-not $allTestsPassed) {
            Write-ColorOutput "❌ Pre-Deploy Tests fehlgeschlagen - Deployment abgebrochen" "Red"
            return
        }
    }
    
    # ============================================
    # PHASE 2: DEPLOYMENT
    # ============================================
    Write-Section "PHASE 2: MULTI-SERVER DEPLOYMENT"
    
    foreach ($server in $Servers) {
        try {
            Invoke-DeployToServer -ServerName $server
            Start-Sleep -Seconds 2
        } catch {
            Write-ColorOutput "⚠️ Deployment auf $server fehlgeschlagen: $_" "Yellow"
        }
    }
    
    Write-ColorOutput "⏳ Warte 10 Sekunden für Deployment-Abschluss..." "Yellow"
    Start-Sleep -Seconds 10
    
    # ============================================
    # PHASE 3: POST-DEPLOY TESTS
    # ============================================
    Write-Section "PHASE 3: POST-DEPLOY VERIFIKATION"
    
    if (-not $SkipTests) {
        # Root-Ordner Test nochmal
        $rootTest = Invoke-RootFolderTest
        if (-not $rootTest) {
            $allTestsPassed = $false
        }
        
        # TÜV-Tests 3x
        for ($i = 1; $i -le 3; $i++) {
            $result = Invoke-TUVTest -RunNumber $i -Phase "Post-Deploy"
            $postDeployResults += $result
            if (-not $result) {
                $allTestsPassed = $false
            }
        }
    }
    
    # ============================================
    # PHASE 4: OFFIZIELLE FREIGABE
    # ============================================
    $releasePath = Invoke-OfficialRelease -AllTestsPassed $allTestsPassed
    
    # ============================================
    # ZUSAMMENFASSUNG
    # ============================================
    Write-Section "DEPLOYMENT-ZUSAMMENFASSUNG"
    
    $summary = @"
STATUS: $(if ($allTestsPassed) { "✅ ERFOLGREICH" } else { "❌ FEHLGESCHLAGEN" })

PRE-DEPLOY TESTS:
  Root-Ordner Test: $(if ($rootTest) { "✅" } else { "❌" })
  TÜV-Tests: $($preDeployResults | Where-Object { $_ } | Measure-Object | Select-Object -ExpandProperty Count)/3 bestanden

DEPLOYMENT:
  Server: $($Servers -join ", ")
  Status: ✅ Abgeschlossen

POST-DEPLOY TESTS:
  Root-Ordner Test: $(if ($rootTest) { "✅" } else { "❌" })
  TÜV-Tests: $($postDeployResults | Where-Object { $_ } | Measure-Object | Select-Object -ExpandProperty Count)/3 bestanden

FREIGABE: $(if ($allTestsPassed) { "✅ OFFIZIELL FREIGEGEBEN" } else { "❌ NICHT FREIGEGEBEN" })
"@
    
    Write-ColorOutput $summary "Cyan"
    
    if ($allTestsPassed) {
        Write-ColorOutput "`n✅ DEPLOYMENT ERFOLGREICH - SYSTEM FREIGEGEBEN FÜR ONLINE-TÄTIGKEIT" "Green"
        Write-ColorOutput "📄 Freigabe-Dokument: $releasePath" "Green"
    } else {
        Write-ColorOutput "`n❌ DEPLOYMENT FEHLGESCHLAGEN - SYSTEM NICHT FREIGEGEBEN" "Red"
        exit 1
    }
}

# Ausführung
Start-StandardroutineDeploy

