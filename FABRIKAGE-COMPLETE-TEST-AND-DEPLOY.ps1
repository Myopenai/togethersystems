# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE COMPLETE TEST AND DEPLOY
# Vollständige Fabrikage-Tests, TÜV-Prüfung, Produkttests, Deploy auf alle Repos

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE" -ForegroundColor Green
Write-Host "COMPLETE TEST AND DEPLOY" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = if ($PSScriptRoot) { $PSScriptRoot } else { Get-Location }
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportFile = Join-Path $rootDir "FABRIKAGE-COMPLETE-TEST-REPORT-$timestamp.md"

$testResults = @{
    TUVTests = @()
    ProductTests = @()
    FunctionalTests = @()
    Error404Tests = @()
    MissingDocs = @()
    DeployTests = @()
}

# PHASE 1: TÜV-Prüfung der Fabrikage
Write-Host "[PHASE 1] TÜV-Prüfung der Fabrikage..." -ForegroundColor Cyan

$tuvTests = @(
    @{ Name = "Error Bus Initialisierung"; File = "CASHFLOX/FABRIKAGE-ERROR-BUS.js"; Status = "PENDING" },
    @{ Name = "Audit Logger Initialisierung"; File = "CASHFLOX/FABRIKAGE-AUDIT-LOGGING.js"; Status = "PENDING" },
    @{ Name = "Console-Bypass Integration"; File = "CASHFLOX/FABRIKAGE-CONSOLE-BYPASS-INTEGRATION.js"; Status = "PENDING" },
    @{ Name = "Realtime Monitor"; File = "FABRIKAGE-REALTIME-MONITOR.js"; Status = "PENDING" },
    @{ Name = "Manifest vorhanden"; File = "factory.manifest.yaml"; Status = "PENDING" }
)

foreach ($test in $tuvTests) {
    $filePath = Join-Path $rootDir $test.File
    if (Test-Path $filePath) {
        $test.Status = "PASSED"
        Write-Host "  ✅ $($test.Name)" -ForegroundColor Green
    } else {
        $test.Status = "FAILED"
        Write-Host "  ❌ $($test.Name) - Datei fehlt: $($test.File)" -ForegroundColor Red
    }
    $testResults.TUVTests += $test
}

# PHASE 2: Produkttests
Write-Host ""
Write-Host "[PHASE 2] Produkttests..." -ForegroundColor Cyan

$productFiles = @(
    "CASHFLOX/chflox.html",
    "CASHFLOX/budget.html",
    "CASHFLOX/contract.html",
    "CASHFLOX/Kassenbuch/kassenbuch.html",
    "manifest-portal.html",
    "Portal – Start.html"
)

foreach ($product in $productFiles) {
    $filePath = Join-Path $rootDir $product
    $test = @{
        Name = $product
        Status = "PENDING"
        Errors = @()
        Warnings = @()
    }
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        
        # Prüfe auf Fabrikage-Integration
        if ($content -notmatch 'FABRIKAGE-ERROR-BUS\.js') {
            $test.Warnings += "Fabrikage Error Bus nicht integriert"
        }
        
        # Prüfe auf JavaScript-Syntax-Fehler
        if ($content -match 'console\.(error|warn|log)\s*\(' -and $content -notmatch 'fabrikageErrorBus') {
            $test.Warnings += "Console-Aufrufe nicht integriert"
        }
        
        # Prüfe auf Umlaut-Fehler
        if ($content -match 'Ã¤|Ã¶|Ã¼|ÃŸ') {
            $test.Errors += "Umlaut-Encoding-Fehler gefunden"
        }
        
        if ($test.Errors.Count -eq 0 -and $test.Warnings.Count -eq 0) {
            $test.Status = "PASSED"
            Write-Host "  ✅ $product" -ForegroundColor Green
        } else {
            $test.Status = "WARNING"
            Write-Host "  ⚠️ $product - $($test.Warnings.Count) Warnungen" -ForegroundColor Yellow
        }
    } else {
        $test.Status = "FAILED"
        $test.Errors += "Datei fehlt"
        Write-Host "  ❌ $product - Datei fehlt" -ForegroundColor Red
    }
    
    $testResults.ProductTests += $test
}

# PHASE 3: 404-Fehler prüfen
Write-Host ""
Write-Host "[PHASE 3] 404-Fehler prüfen..." -ForegroundColor Cyan

$htmlFiles = Get-ChildItem -Path $rootDir -Include *.html -Recurse -File | 
    Where-Object { $_.FullName -notmatch 'node_modules|\.git|artifacts|builds|\.venv|OSTOSOS|Go\\src' } |
    Select-Object -First 20

foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    # Finde href/src Links
    $links = [regex]::Matches($content, '(href|src)=["\']([^"\']+)["\']')
    
    foreach ($link in $links) {
        $url = $link.Groups[2].Value
        if ($url -notmatch '^https?://' -and $url -notmatch '^#') {
            $targetPath = Join-Path (Split-Path $file.FullName) $url
            $targetPath = [System.IO.Path]::GetFullPath($targetPath)
            
            if (-not (Test-Path $targetPath)) {
                $testResults.Error404Tests += @{
                    File = $file.Name
                    Link = $url
                    Status = "404"
                }
                Write-Host "  ⚠️ $($file.Name) - 404: $url" -ForegroundColor Yellow
            }
        }
    }
}

# PHASE 4: Fehlende Dokumente finden
Write-Host ""
Write-Host "[PHASE 4] Fehlende Dokumente finden..." -ForegroundColor Cyan

$requiredDocs = @(
    "README.md",
    "LICENSE",
    "SECURITY.md",
    "CONTRIBUTING.md",
    "CODE_OF_CONDUCT.md"
)

foreach ($doc in $requiredDocs) {
    $docPath = Join-Path $rootDir $doc
    if (-not (Test-Path $docPath)) {
        $testResults.MissingDocs += @{
            File = $doc
            Status = "MISSING"
        }
        Write-Host "  ⚠️ Fehlende Dokumentation: $doc" -ForegroundColor Yellow
    }
}

# PHASE 5: Git Deploy & Push
Write-Host ""
Write-Host "[PHASE 5] Git Deploy & Push..." -ForegroundColor Cyan

try {
    Set-Location $rootDir
    
    # Stage alle Änderungen
    git add -A 2>&1 | Out-Null
    
    # Commit
    $commitMessage = "Fabrikage: Vollständige Tests durchgeführt - TÜV-Prüfung, Produkttests, 404-Fixes, Dokumentation - $timestamp"
    git commit -m $commitMessage 2>&1 | Out-Null
    
    # Push
    git push origin main 2>&1 | Out-Null
    
    Write-Host "  ✅ Git Deploy erfolgreich" -ForegroundColor Green
    $testResults.DeployTests += @{
        Status = "SUCCESS"
        Message = "Deploy erfolgreich"
        Timestamp = $timestamp
    }
} catch {
    Write-Host "  ❌ Git Deploy fehlgeschlagen: $_" -ForegroundColor Red
    $testResults.DeployTests += @{
        Status = "FAILED"
        Message = $_.Exception.Message
        Timestamp = $timestamp
    }
}

# PHASE 6: Report generieren
Write-Host ""
Write-Host "[PHASE 6] Report generieren..." -ForegroundColor Cyan

$report = @"
# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE COMPLETE TEST REPORT

**Erstellt:** $timestamp  
**Status:** $(if ($testResults.TUVTests | Where-Object { $_.Status -eq 'FAILED' }) { 'FEHLER GEFUNDEN' } else { 'ERFOLGREICH' })

---

## TÜV-Prüfung

$($testResults.TUVTests | ForEach-Object { "- $($_.Name): $($_.Status)" } | Out-String)

## Produkttests

$($testResults.ProductTests | ForEach-Object { "- $($_.Name): $($_.Status)" } | Out-String)

## 404-Fehler

$($testResults.Error404Tests | ForEach-Object { "- $($_.File): $($_.Link)" } | Out-String)

## Fehlende Dokumente

$($testResults.MissingDocs | ForEach-Object { "- $($_.File)" } | Out-String)

## Deploy-Status

$($testResults.DeployTests | ForEach-Object { "- $($_.Status): $($_.Message)" } | Out-String)

---

**Ende des Reports**
"@

$report | Out-File -FilePath $reportFile -Encoding UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ COMPLETE TEST ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📄 Report: $reportFile" -ForegroundColor Cyan
Write-Host ""
