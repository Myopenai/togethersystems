# T,. OSOTOSOS - Komplette Fabrikations-Tests nach Implementierung
# Testet beide Build-Varianten: HTML/JavaScript und Python One-File

$ErrorActionPreference = "Stop"
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir

Write-Host "=== T,. OSOTOSOS - Komplette Fabrikations-Tests ===" -ForegroundColor Cyan
Write-Host "Datum: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

# Test 1: HTML/JavaScript Variante
Write-Host "[TEST 1] HTML/JavaScript Variante" -ForegroundColor Yellow
$htmlFile = Join-Path $rootDir "OSTOSOS-OS-COMPLETE-SYSTEM.html"
if (Test-Path $htmlFile) {
    Write-Host "  [OK] OSTOSOS-OS-COMPLETE-SYSTEM.html vorhanden" -ForegroundColor Green
    
    # Prüfe wichtige Komponenten
    $content = Get-Content $htmlFile -Raw -Encoding UTF8
    $checks = @{
        "Window Manager" = $content -match "window-manager-core.js"
        "Taskbar" = $content -match "taskbar-core.js"
        "Self-Healing" = $content -match "self-healing-core.js"
        "Console Monitor" = $content -match "console-monitor-integration.js"
        "DaVinci Effects" = $content -match "da-vinci-xxxxxl-enterprise-standard.css"
    }
    
    foreach ($check in $checks.GetEnumerator()) {
        if ($check.Value) {
            Write-Host "  [OK] $($check.Key) integriert" -ForegroundColor Green
        } else {
            Write-Host "  [WARNUNG] $($check.Key) nicht gefunden" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "  [FEHLER] OSTOSOS-OS-COMPLETE-SYSTEM.html nicht gefunden" -ForegroundColor Red
}

Write-Host ""

# Test 2: Python One-File Variante
Write-Host "[TEST 2] Python One-File Variante" -ForegroundColor Yellow
$pythonFile = Join-Path $rootDir "osotosos.py"
if (Test-Path $pythonFile) {
    Write-Host "  [OK] osotosos.py vorhanden" -ForegroundColor Green
    
    # Prüfe Python-Syntax
    $pythonCmd = Get-Command python -ErrorAction SilentlyContinue
    if ($pythonCmd) {
        Write-Host "  [OK] Python gefunden: $($pythonCmd.Source)" -ForegroundColor Green
        
        # Teste Python-Script (Syntax-Check)
        Write-Host "  [INFO] Fuehre Python Syntax-Check durch..." -ForegroundColor Gray
        $syntaxCheck = python -m py_compile $pythonFile 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Python-Syntax korrekt" -ForegroundColor Green
        } else {
            Write-Host "  [FEHLER] Python-Syntax-Fehler:" -ForegroundColor Red
            Write-Host $syntaxCheck -ForegroundColor Red
        }
        
        # Teste CLI-Modus
        Write-Host "  [INFO] Teste CLI Dashboard..." -ForegroundColor Gray
        $cliTest = python $pythonFile --cli 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] CLI Dashboard funktioniert" -ForegroundColor Green
        } else {
            Write-Host "  [WARNUNG] CLI Dashboard Test fehlgeschlagen" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  [WARNUNG] Python nicht im PATH gefunden" -ForegroundColor Yellow
        Write-Host "  [INFO] Python-Script vorhanden, aber nicht testbar" -ForegroundColor Gray
    }
} else {
    Write-Host "  [FEHLER] osotosos.py nicht gefunden" -ForegroundColor Red
}

Write-Host ""

# Test 3: Build-Varianten-Auswahl
Write-Host "[TEST 3] Build-Varianten-Auswahl" -ForegroundColor Yellow
$buildSelectionFile = Join-Path $rootDir "BUILD-VARIANTEN-AUSWAHL.html"
if (Test-Path $buildSelectionFile) {
    Write-Host "  [OK] BUILD-VARIANTEN-AUSWAHL.html vorhanden" -ForegroundColor Green
    
    $content = Get-Content $buildSelectionFile -Raw -Encoding UTF8
    if ($content -match "HTML/JavaScript Variante" -and $content -match "Python One-File Variante") {
        Write-Host "  [OK] Beide Varianten in Auswahl vorhanden" -ForegroundColor Green
    } else {
        Write-Host "  [WARNUNG] Nicht alle Varianten in Auswahl gefunden" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [FEHLER] BUILD-VARIANTEN-AUSWAHL.html nicht gefunden" -ForegroundColor Red
}

Write-Host ""

# Test 4: Self-Healing Console
Write-Host "[TEST 4] Self-Healing Console" -ForegroundColor Yellow
$selfHealingFile = Join-Path (Split-Path -Parent $rootDir) "FABRIK-SELF-HEALING-CONSOLE.html"
if (Test-Path $selfHealingFile) {
    Write-Host "  [OK] FABRIK-SELF-HEALING-CONSOLE.html vorhanden" -ForegroundColor Green
} else {
    Write-Host "  [WARNUNG] FABRIK-SELF-HEALING-CONSOLE.html nicht gefunden" -ForegroundColor Yellow
}

Write-Host ""

# Test 5: CLI Dashboard (Bash)
Write-Host "[TEST 5] CLI Dashboard (Bash)" -ForegroundColor Yellow
$cliDashboardFile = Join-Path $rootDir "cli-dashboard-prometheus.sh"
if (Test-Path $cliDashboardFile) {
    Write-Host "  [OK] cli-dashboard-prometheus.sh vorhanden" -ForegroundColor Green
} else {
    Write-Host "  [WARNUNG] cli-dashboard-prometheus.sh nicht gefunden" -ForegroundColor Yellow
}

Write-Host ""

# Test 6: Automatisierte Python-Prüfung
Write-Host "[TEST 6] Automatisierte Python-Prüfung" -ForegroundColor Yellow
$automatedCheckFile = Join-Path $rootDir "automated-check.py"
if (Test-Path $automatedCheckFile) {
    Write-Host "  [OK] automated-check.py vorhanden" -ForegroundColor Green
    
    if ($pythonCmd) {
        Write-Host "  [INFO] Fuehre automatisierte Pruefung aus..." -ForegroundColor Gray
        $checkResult = python $automatedCheckFile 2>&1
        Write-Host $checkResult
    }
} else {
    Write-Host "  [WARNUNG] automated-check.py nicht gefunden" -ForegroundColor Yellow
}

Write-Host ""

# Zusammenfassung
Write-Host "=== Test-Zusammenfassung ===" -ForegroundColor Cyan
Write-Host "Alle Tests abgeschlossen." -ForegroundColor Green
Write-Host ""
Write-Host "Naechste Schritte:" -ForegroundColor Yellow
Write-Host "1. HTML/JavaScript: Oeffne BUILD-VARIANTEN-AUSWAHL.html im Browser" -ForegroundColor White
Write-Host "2. Python One-File: python osotosos.py (Web UI) oder python osotosos.py --cli (CLI)" -ForegroundColor White
Write-Host "3. Build-Auswahl: Waehle deine bevorzugte Variante" -ForegroundColor White
Write-Host ""
Write-Host "T,.&T,,.&T,,,.T. - Together Systems International" -ForegroundColor Cyan

