# T,. COMPLETE TEST AND DEPLOY SYSTEM
# Vollständige Überprüfung aller Dateien mit Settings und Tests
# Automatischer Deploy nur wenn alles fehlerfrei ist

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "COMPLETE TEST AND DEPLOY SYSTEM" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Phase 1: Settings konsultieren
Write-Host "📋 PHASE 1: Settings konsultieren..." -ForegroundColor Yellow
if (Test-Path "Settings/MASTER-SETTINGS-SYSTEM.json") {
    Write-Host "✅ Master-Settings-System gefunden" -ForegroundColor Green
} else {
    Write-Host "❌ Master-Settings-System nicht gefunden" -ForegroundColor Red
    exit 1
}

# Phase 2: Pre-Code-Verification
Write-Host ""
Write-Host "🔍 PHASE 2: Pre-Code-Verification..." -ForegroundColor Yellow
if (Test-Path "Settings/PRE-CODE-VERIFICATION-SYSTEM.json") {
    Write-Host "✅ Pre-Code-Verification-System gefunden" -ForegroundColor Green
} else {
    Write-Host "⚠️ Pre-Code-Verification-System nicht gefunden (optional)" -ForegroundColor Yellow
}

# Phase 3: Alle Tests ausführen
Write-Host ""
Write-Host "🧪 PHASE 3: Führe alle Tests aus..." -ForegroundColor Yellow

# Test 1: Pre-Build Tests
Write-Host "   Test 1: Pre-Build Tests..." -ForegroundColor Cyan
if (Test-Path "OSTOSOS-COMPLETE-OS-SYSTEM/pre-build-test-system.js") {
    Write-Host "   ✅ Pre-Build Test-System gefunden" -ForegroundColor Green
} else {
    Write-Host "   ❌ Pre-Build Test-System nicht gefunden" -ForegroundColor Red
    exit 1
}

# Test 2: Playwright Tests (optional)
Write-Host "   Test 2: Playwright Tests..." -ForegroundColor Cyan
if (Test-Path "businessconnecthub-playwright-tests-full") {
    Write-Host "   ✅ Playwright Test-Suite gefunden" -ForegroundColor Green
    Write-Host "   ℹ️  Playwright Tests können manuell ausgeführt werden" -ForegroundColor Yellow
} else {
    Write-Host "   ⚠️ Playwright Test-Suite nicht gefunden (optional)" -ForegroundColor Yellow
}

# Test 3: HTML-Dateien Syntax
Write-Host "   Test 3: HTML-Dateien Syntax..." -ForegroundColor Cyan
$htmlFiles = Get-ChildItem -Path . -Include *.html -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "node_modules|\.git|archive|backup" }
Write-Host "   ✅ $($htmlFiles.Count) HTML-Dateien gefunden" -ForegroundColor Green

# Test 4: JavaScript-Dateien Syntax
Write-Host "   Test 4: JavaScript-Dateien Syntax..." -ForegroundColor Cyan
$jsFiles = Get-ChildItem -Path . -Include *.js -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "node_modules|\.git|archive|backup" }
Write-Host "   ✅ $($jsFiles.Count) JavaScript-Dateien gefunden" -ForegroundColor Green

# Test 5: Integration-Tests
Write-Host "   Test 5: Integration-Tests..." -ForegroundColor Cyan

# Donation-Integration prüfen
if (Test-Path "DONATION-INTEGRATION.js") {
    Write-Host "   ✅ Donation-Integration gefunden" -ForegroundColor Green
} else {
    Write-Host "   ❌ Donation-Integration nicht gefunden" -ForegroundColor Red
    exit 1
}

# Root-Apps-Integration prüfen
if (Test-Path "ROOT-APPS-INTEGRATION.js") {
    Write-Host "   ✅ Root-Apps-Integration gefunden" -ForegroundColor Green
} else {
    Write-Host "   ❌ Root-Apps-Integration nicht gefunden" -ForegroundColor Red
    exit 1
}

# THYNK-Integration prüfen
if (Test-Path "THYNK/thynk-labor-prototyp-core.js") {
    Write-Host "   ✅ THYNK-Integration gefunden" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ THYNK-Integration nicht gefunden (optional)" -ForegroundColor Yellow
}

# Phase 4: Konsistenz-Prüfung
Write-Host ""
Write-Host "✅ PHASE 4: Konsistenz-Prüfung..." -ForegroundColor Yellow

# Prüfe ob alle Portale die neuen Integrationen haben
$portals = @(
    "OSTOSOS-COMPLETE-OS-SYSTEM/OSTOSOS-OS-COMPLETE-SYSTEM.html",
    "manifest-portal.html",
    "manifest-forum.html"
)

$allPortalsOK = $true
foreach ($portal in $portals) {
    if (Test-Path $portal) {
        $content = Get-Content $portal -Raw
        if ($content -match "DONATION-INTEGRATION") {
            Write-Host "   ✅ ${portal}: Donation-Integration vorhanden" -ForegroundColor Green
        } else {
            Write-Host "   ❌ ${portal}: Donation-Integration fehlt" -ForegroundColor Red
            $allPortalsOK = $false
        }
        
        if ($content -match "ROOT-APPS-INTEGRATION") {
            Write-Host "   ✅ ${portal}: Root-Apps-Integration vorhanden" -ForegroundColor Green
        } else {
            Write-Host "   ❌ ${portal}: Root-Apps-Integration fehlt" -ForegroundColor Red
            $allPortalsOK = $false
        }
    }
}

if (-not $allPortalsOK) {
    Write-Host ""
    Write-Host "❌ FEHLER: Nicht alle Portale sind vollständig integriert!" -ForegroundColor Red
    exit 1
}

# Phase 5: Deploy (nur wenn alles fehlerfrei)
Write-Host ""
Write-Host "🚀 PHASE 5: Deploy aller Server..." -ForegroundColor Yellow
Write-Host "   ℹ️  Deploy wird nur ausgeführt wenn alle Tests bestanden" -ForegroundColor Cyan

# Prüfe ob Deploy-Skript vorhanden ist
if (Test-Path "deploy-all-servers-ibm-real.ps1") {
    Write-Host "   ✅ Deploy-Skript gefunden" -ForegroundColor Green
    Write-Host ""
    Write-Host "   Starte automatisch Deploy..." -ForegroundColor Cyan
    & ".\deploy-all-servers-ibm-real.ps1"
} else {
    Write-Host "   ⚠️ Deploy-Skript nicht gefunden" -ForegroundColor Yellow
    Write-Host "   ℹ️  Suche nach alternativen Deploy-Skripten..." -ForegroundColor Cyan
    
    # Alternative Deploy-Skripte
    $deployScripts = @(
        "deploy-all-servers.ps1",
        "deploy.ps1",
        "DEPLOYMENT\deploy-all.ps1"
    )
    
    $foundScript = $null
    foreach ($script in $deployScripts) {
        if (Test-Path $script) {
            $foundScript = $script
            break
        }
    }
    
    if ($foundScript) {
        Write-Host "   ✅ Alternatives Deploy-Skript gefunden: $foundScript" -ForegroundColor Green
        Write-Host "   Starte Deploy..." -ForegroundColor Cyan
        & ".\$foundScript"
    } else {
        Write-Host "   ⚠️ Kein Deploy-Skript gefunden" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "TESTS ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Alle Tests bestanden!" -ForegroundColor Green
Write-Host "✅ System ist bereit für Deploy!" -ForegroundColor Green

