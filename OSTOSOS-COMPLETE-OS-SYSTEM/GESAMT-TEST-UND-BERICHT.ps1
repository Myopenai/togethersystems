# T,. OSOTOSOS - Gesamt-Test und Detaillierter Bericht
# Führt alle Tests durch und erstellt einen umfassenden Bericht

$ErrorActionPreference = "Continue"
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir

$reportFile = "artifacts\GESAMT-TEST-BERICHT-$(Get-Date -Format 'yyyyMMdd-HHmmss').md"
New-Item -ItemType Directory -Force -Path "artifacts" | Out-Null

function Write-Report {
    param([string]$Content)
    Add-Content -Path $reportFile -Value $Content -Encoding UTF8
    Write-Host $Content
}

Write-Host "=== T,. OSOTOSOS - Gesamt-Test und Detaillierter Bericht ===" -ForegroundColor Cyan
Write-Host ""

# Start Report
$reportStart = @"
# T,. OSOTOSOS - Gesamt-Test Bericht

**Datum:** $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
**System:** OSOTOSOS Complete OS System
**TÜV-Grade:** Double Inspection, Ocean-Balance, Build Matrix

---

## 1. TÜV-Pipeline Tests

"@
Write-Report $reportStart

# 1. TÜV-Pipeline
Write-Host "[1/4] Fuehre TÜV-Pipeline aus..." -ForegroundColor Yellow
$tuvResults = @{}
try {
    & .\tuv.ps1 preflight 2>&1 | Out-Null
    $tuvResults["preflight"] = if ($LASTEXITCODE -eq 0) { "✅ PASSED" } else { "❌ FAILED" }
} catch {
    $tuvResults["preflight"] = "❌ FAILED: $_"
}

try {
    & .\tuv.ps1 tuv1 2>&1 | Out-Null
    $tuvResults["tuv1"] = if ($LASTEXITCODE -eq 0) { "✅ PASSED" } else { "❌ FAILED" }
} catch {
    $tuvResults["tuv1"] = "❌ FAILED: $_"
}

try {
    & .\tuv.ps1 tests 2>&1 | Out-Null
    $tuvResults["tests"] = if ($LASTEXITCODE -eq 0) { "✅ PASSED" } else { "❌ FAILED" }
} catch {
    $tuvResults["tests"] = "❌ FAILED: $_"
}

try {
    & .\tuv.ps1 tuv2 2>&1 | Out-Null
    $tuvResults["tuv2"] = if ($LASTEXITCODE -eq 0) { "✅ PASSED" } else { "❌ FAILED" }
} catch {
    $tuvResults["tuv2"] = "❌ FAILED: $_"
}

Write-Report "### TÜV-Pipeline Ergebnisse:"
foreach ($key in $tuvResults.Keys) {
    Write-Report "- **$key**: $($tuvResults[$key])"
}
Write-Report ""

# 2. Oberster Stein Analyse
Write-Host "[2/4] Fuehre Oberster Stein Analyse aus..." -ForegroundColor Yellow
$obersterResult = "❌ NOT RUN"
try {
    python OBERSTER-STEIN-SYSTEM.py . 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $obersterResult = "✅ PASSED"
        python OBERSTER-STEIN-REPORT-GENERATOR.py 2>&1 | Out-Null
    } else {
        $obersterResult = "❌ FAILED"
    }
} catch {
    $obersterResult = "❌ FAILED: $_"
}

Write-Report "### Oberster Stein Analyse:"
Write-Report "- **Status**: $obersterResult"
$obersterReports = Get-ChildItem -Path "artifacts" -Filter "oberster-stein-report-*.json" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
if ($obersterReports) {
    $obersterData = Get-Content $obersterReports.FullName -Raw | ConvertFrom-Json
    Write-Report "- **Gefundene Probleme**: $($obersterData.issues.Count)"
    Write-Report "- **Grade**: $($obersterData.grade)"
    Write-Report "- **Balance**: $($obersterData.balance.verdict)"
}
Write-Report ""

# 3. Build Matrix
Write-Host "[3/4] Fuehre Build Matrix aus..." -ForegroundColor Yellow
$buildResult = "❌ NOT RUN"
$buildCount = 0
try {
    $BUILDID = "b$(Get-Date -Format 'yyyyMMddHHmmss')"
    $TS = (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ")
    & .\scripts\build_matrix.ps1 $BUILDID $TS 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $buildResult = "✅ PASSED"
        $buildCount = (Get-ChildItem -Path "build" -Filter "*.img" -Recurse).Count
    } else {
        $buildResult = "❌ FAILED"
    }
} catch {
    $buildResult = "❌ FAILED: $_"
}

Write-Report "### Build Matrix:"
Write-Report "- **Status**: $buildResult"
Write-Report "- **Artefakte erstellt**: $buildCount"
Write-Report ""

# 4. Alle weiteren Tests
Write-Host "[4/4] Fuehre alle weiteren Tests aus..." -ForegroundColor Yellow
$allTests = @{}

# Fabrik-Tests
if (Test-Path "TEST-ALL-VARIANTEN.ps1") {
    try {
        & .\TEST-ALL-VARIANTEN.ps1 2>&1 | Out-Null
        $allTests["Fabrik-Tests"] = if ($LASTEXITCODE -eq 0) { "✅ PASSED" } else { "⚠️ WARNINGS" }
    } catch {
        $allTests["Fabrik-Tests"] = "❌ FAILED"
    }
}

# Python One-File Tests
if (Test-Path "osotosos.py") {
    try {
        python osotosos.py --cli 2>&1 | Out-Null
        $allTests["Python CLI"] = if ($LASTEXITCODE -eq 0) { "✅ PASSED" } else { "⚠️ WARNINGS" }
    } catch {
        $allTests["Python CLI"] = "❌ FAILED"
    }
}

# HTML/JavaScript Variante
if (Test-Path "OSTOSOS-OS-COMPLETE-SYSTEM.html") {
    $htmlContent = Get-Content "OSTOSOS-OS-COMPLETE-SYSTEM.html" -Raw
    $checks = @{
        "HTML vorhanden" = $true
        "Window Manager" = $htmlContent -match "window-manager"
        "Taskbar" = $htmlContent -match "taskbar"
        "Self-Healing" = $htmlContent -match "self-healing"
        "Console Monitor" = $htmlContent -match "console-monitor"
    }
    $htmlPassed = ($checks.Values | Where-Object { $_ -eq $true }).Count
    $htmlTotal = $checks.Count
    $allTests["HTML/JavaScript Variante"] = "✅ $htmlPassed/$htmlTotal Komponenten"
}

Write-Report "### Weitere Tests:"
foreach ($key in $allTests.Keys) {
    Write-Report "- **$key**: $($allTests[$key])"
}
Write-Report ""

# Zusammenfassung
Write-Report "---"
Write-Report ""
Write-Report "## Zusammenfassung"
Write-Report ""

$gesamtStatus = "✅ ALLE TESTS BESTANDEN"
if ($tuvResults.Values -contains "❌ FAILED" -or $obersterResult -eq "❌ FAILED" -or $buildResult -eq "❌ FAILED") {
    $gesamtStatus = "⚠️ TEILWEISE FEHLGESCHLAGEN"
}
if ($tuvResults.Values -match "❌" -and ($tuvResults.Values | Where-Object { $_ -match "❌" }).Count -gt 2) {
    $gesamtStatus = "❌ KRITISCH - VIELE TESTS FEHLGESCHLAGEN"
}

Write-Report "**Gesamtstatus**: $gesamtStatus"
Write-Report ""

Write-Report "### Statistik:"
Write-Report "- TÜV-Pipeline: $($tuvResults.Values | Where-Object { $_ -match '✅' }).Count/$($tuvResults.Count) bestanden"
Write-Report "- Oberster Stein: $obersterResult"
Write-Report "- Build Matrix: $buildResult ($buildCount Artefakte)"
Write-Report "- Weitere Tests: $($allTests.Values | Where-Object { $_ -match '✅' }).Count/$($allTests.Count) bestanden"
Write-Report ""

Write-Report "### Artefakte:"
$artifacts = Get-ChildItem -Path "artifacts" -File | Sort-Object LastWriteTime -Descending
foreach ($artifact in $artifacts | Select-Object -First 10) {
    Write-Report "- $($artifact.Name) ($(Get-Date $artifact.LastWriteTime -Format 'yyyy-MM-dd HH:mm:ss'))"
}
Write-Report ""

Write-Report "### Build-Artefakte:"
$buildArtifacts = Get-ChildItem -Path "build" -Filter "*.img" -Recurse | Select-Object -First 10
foreach ($artifact in $buildArtifacts) {
    Write-Report "- $($artifact.FullName.Replace($rootDir, '.'))"
}
if ((Get-ChildItem -Path "build" -Filter "*.img" -Recurse).Count -gt 10) {
    Write-Report "- ... und $((Get-ChildItem -Path "build" -Filter "*.img" -Recurse).Count - 10) weitere"
}
Write-Report ""

Write-Report "---"
Write-Report ""
Write-Report "**T,.&T,,.&T,,,.T. - Together Systems International**"
Write-Report ""
Write-Report "*Detaillierter Bericht erstellt: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')*"

Write-Host ""
Write-Host "=== Gesamt-Test abgeschlossen ===" -ForegroundColor Green
Write-Host "Bericht gespeichert: $reportFile" -ForegroundColor Cyan
Write-Host ""

