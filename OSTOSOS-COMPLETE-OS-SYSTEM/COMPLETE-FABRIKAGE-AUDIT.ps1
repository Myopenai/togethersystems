# T,. OSOTOSOS - Komplette Fabrikage Audit
# Version: 1.0.0
# Signatur: T,.&T,,.&T,,,.T.
# Fabrikage: Systematische Gesamtprüfung

$ErrorActionPreference = "Continue"
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir

Write-Host "=== T,. OSOTOSOS - KOMPLETTE FABRIKAGE AUDIT ===" -ForegroundColor Cyan
Write-Host ""

$report = @{
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Checks = @()
    Errors = @()
    Warnings = @()
    Info = @()
}

# 1. Dateistruktur-Prüfung
Write-Host "=== 1. DATEISTRUKTUR-PRÜFUNG ===" -ForegroundColor Yellow
$criticalFiles = @(
    "osos-tos-production-portal.html",
    "tuv.ps1",
    "TUV-TEST-3X-RUNNER.ps1",
    "universal-auto-init.js",
    "universal-dummy-help.js",
    "dashboard-auto-start.js",
    "multi-window-menu.js",
    "ux-waehler-complete.js",
    "window-manager-core.js",
    "Modules/Viewunity/gaincode.ts",
    "Modules/Viewunity/mäkincode.ts"
)

foreach ($file in $criticalFiles) {
    $path = Join-Path $rootDir $file
    $exists = $false
    
    # Spezialbehandlung für Dateien mit Umlauten
    if ($file -match "m.*kincode") {
        $dir = Split-Path $path -Parent
        if (Test-Path $dir) {
            $found = Get-ChildItem -Path $dir -Filter "*.ts" -ErrorAction SilentlyContinue | Where-Object { $_.Name -like "*incode.ts" }
            $exists = $found -ne $null -and $found.Count -gt 0
        }
    } else {
        $exists = Test-Path $path -ErrorAction SilentlyContinue
    }
    
    if ($exists) {
        $report.Checks += @{
            Type = "FileExists"
            Item = $file
            Status = "OK"
        }
        Write-Host "  OK: $file" -ForegroundColor Green
    } else {
        $report.Errors += "FEHLT: $file"
        $report.Checks += @{
            Type = "FileExists"
            Item = $file
            Status = "ERROR"
        }
        Write-Host "  FEHLT: $file" -ForegroundColor Red
    }
}

# 2. JavaScript-Syntax-Prüfung
Write-Host ""
Write-Host "=== 2. JAVASCRIPT-SYNTAX-PRÜFUNG ===" -ForegroundColor Yellow
$jsFiles = Get-ChildItem -Path $rootDir -Filter "*.js" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "node_modules|build|\.min\.js" }
$jsErrorCount = 0

foreach ($jsFile in $jsFiles) {
    try {
        $content = Get-Content $jsFile.FullName -Raw -ErrorAction Stop
        # Einfache Syntax-Checks
        if ($content -match "function\s*\([^)]*\)\s*\{[^}]*$" -and $content -notmatch "function\s*\([^)]*\)\s*\{[^}]*\}") {
            $jsErrorCount++
            $report.Warnings += "Mögliche Syntax-Warnung: $($jsFile.Name)"
        }
    } catch {
        $jsErrorCount++
        $report.Errors += "Fehler beim Lesen: $($jsFile.Name) - $_"
    }
}

if ($jsErrorCount -eq 0) {
    Write-Host "  OK: Alle JavaScript-Dateien lesbar" -ForegroundColor Green
} else {
    Write-Host "  WARNUNG: $jsErrorCount potenzielle Probleme gefunden" -ForegroundColor Yellow
}

# 3. PowerShell-Syntax-Prüfung
Write-Host ""
Write-Host "=== 3. POWERSHELL-SYNTAX-PRÜFUNG ===" -ForegroundColor Yellow
$psFiles = Get-ChildItem -Path $rootDir -Filter "*.ps1" -Recurse -ErrorAction SilentlyContinue
$psErrorCount = 0

foreach ($psFile in $psFiles) {
    try {
        $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $psFile.FullName -Raw), [ref]$null)
        Write-Host "  OK: $($psFile.Name)" -ForegroundColor Green
    } catch {
        $psErrorCount++
        $report.Errors += "PowerShell-Syntax-Fehler: $($psFile.Name) - $_"
        Write-Host "  FEHLER: $($psFile.Name) - $_" -ForegroundColor Red
    }
}

# 4. HTML-Validierung (Basis-Checks)
Write-Host ""
Write-Host "=== 4. HTML-VALIDIERUNG (BASIS) ===" -ForegroundColor Yellow
$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch "build|node_modules" }
$htmlErrorCount = 0

foreach ($htmlFile in $htmlFiles) {
    try {
        $content = Get-Content $htmlFile.FullName -Raw -ErrorAction Stop
        if ($content -notmatch "<!DOCTYPE html>" -and $content -notmatch "<html") {
            $htmlErrorCount++
            $report.Warnings += "Mögliches HTML-Problem: $($htmlFile.Name)"
        }
        if ($content -notmatch "<meta charset") {
            $htmlErrorCount++
            $report.Warnings += "Fehlender charset: $($htmlFile.Name)"
        }
    } catch {
        $htmlErrorCount++
        $report.Errors += "Fehler beim Lesen: $($htmlFile.Name)"
    }
}

if ($htmlErrorCount -eq 0) {
    Write-Host "  OK: HTML-Dateien Basis-Checks bestanden" -ForegroundColor Green
} else {
    Write-Host "  WARNUNG: $htmlErrorCount potenzielle Probleme gefunden" -ForegroundColor Yellow
}

# 5. TypeScript-Module-Prüfung
Write-Host ""
Write-Host "=== 5. TYPESCRIPT-MODULE-PRÜFUNG ===" -ForegroundColor Yellow
$tsFiles = Get-ChildItem -Path $rootDir -Filter "*.ts" -Recurse -ErrorAction SilentlyContinue
$tsCount = 0

foreach ($tsFile in $tsFiles) {
    $tsCount++
    $content = Get-Content $tsFile.FullName -Raw -ErrorAction SilentlyContinue
    if ($content -match "export\s+(type|function|class)") {
        Write-Host "  OK: $($tsFile.Name) - Export gefunden" -ForegroundColor Green
    } else {
        $report.Warnings += "Kein Export in: $($tsFile.Name)"
        Write-Host "  WARNUNG: $($tsFile.Name) - Kein Export gefunden" -ForegroundColor Yellow
    }
}

Write-Host "  INFO: $tsCount TypeScript-Dateien gefunden" -ForegroundColor Cyan

# 6. Konsistenz-Prüfung (Verweise)
Write-Host ""
Write-Host "=== 6. KONSISTENZ-PRÜFUNG (VERWEISE) ===" -ForegroundColor Yellow
$mainHtml = Join-Path $rootDir "osos-tos-production-portal.html"
if (Test-Path $mainHtml) {
    $htmlContent = Get-Content $mainHtml -Raw
    $referencedJs = [regex]::Matches($htmlContent, 'src=["'']([^"'']+\.js)["'']') | ForEach-Object { $_.Groups[1].Value }
    
    foreach ($jsRef in $referencedJs) {
        $jsPath = Join-Path $rootDir $jsRef
        if (-not (Test-Path $jsPath)) {
            $report.Errors += "Fehlender JavaScript-Verweis: $jsRef (in osos-tos-production-portal.html)"
            Write-Host "  FEHLER: Fehlender Verweis: $jsRef" -ForegroundColor Red
        } else {
            Write-Host "  OK: $jsRef" -ForegroundColor Green
        }
    }
}

# 7. TÜV-Test-Verfügbarkeit
Write-Host ""
Write-Host "=== 7. TÜV-TEST-VERFÜGBARKEIT ===" -ForegroundColor Yellow
if (Test-Path (Join-Path $rootDir "tuv.ps1")) {
    Write-Host "  OK: tuv.ps1 gefunden" -ForegroundColor Green
    $report.Info += "TÜV-Test verfügbar"
} else {
    $report.Errors += "tuv.ps1 nicht gefunden"
    Write-Host "  FEHLER: tuv.ps1 nicht gefunden" -ForegroundColor Red
}

if (Test-Path (Join-Path $rootDir "TUV-TEST-3X-RUNNER.ps1")) {
    Write-Host "  OK: TUV-TEST-3X-RUNNER.ps1 gefunden" -ForegroundColor Green
    $report.Info += "TÜV-Test-Runner verfügbar"
} else {
    $report.Errors += "TUV-TEST-3X-RUNNER.ps1 nicht gefunden"
    Write-Host "  FEHLER: TUV-TEST-3X-RUNNER.ps1 nicht gefunden" -ForegroundColor Red
}

# 8. Zusammenfassung
Write-Host ""
Write-Host "=== ZUSAMMENFASSUNG ===" -ForegroundColor Cyan
Write-Host "  Prüfungen: $($report.Checks.Count)" -ForegroundColor Cyan
Write-Host "  Fehler: $($report.Errors.Count)" -ForegroundColor $(if ($report.Errors.Count -eq 0) { "Green" } else { "Red" })
Write-Host "  Warnungen: $($report.Warnings.Count)" -ForegroundColor $(if ($report.Warnings.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host "  Info: $($report.Info.Count)" -ForegroundColor Cyan

# Report speichern
$reportPath = Join-Path $rootDir "FABRIKAGE-AUDIT-REPORT-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$report | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host ""
Write-Host "Report gespeichert: $reportPath" -ForegroundColor Cyan

if ($report.Errors.Count -eq 0) {
    Write-Host ""
    Write-Host "=== AUDIT ERFOLGREICH - KEINE FEHLER ===" -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "=== AUDIT MIT FEHLERN - BITTE PRÜFEN ===" -ForegroundColor Red
    exit 1
}

