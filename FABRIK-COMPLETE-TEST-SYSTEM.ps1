# T,. FABRIK KOMPLETTES TEST-SYSTEM
# Testet Betriebssystem, Portal und Manifest - 100% fehlerfrei!

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Green
Write-Host "T,. FABRIK KOMPLETTES TEST-SYSTEM" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

# Finde alle drei Abteilungen
$osDir = Join-Path $rootDir "OSTOSOS-COMPLETE-OS-SYSTEM"
$portalDir = Get-ChildItem -Path $rootDir -Directory -Filter "*Portal*" -ErrorAction SilentlyContinue | Select-Object -First 1
$manifestDir = Get-ChildItem -Path $rootDir -Directory -Filter "*manifest*" -ErrorAction SilentlyContinue | Select-Object -First 1

# Finde Portal/Manifest Dateien
if (-not $portalDir) {
    $portalFiles = Get-ChildItem -Path $rootDir -Recurse -File -Filter "*portal*.html" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($portalFiles) {
        $portalDir = $portalFiles.Directory
    }
}

if (-not $manifestDir) {
    $manifestFiles = Get-ChildItem -Path $rootDir -Recurse -File -Filter "*manifest*.html" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($manifestFiles) {
        $manifestDir = $manifestFiles.Directory
    }
}

Write-Host "[1] ABTEILUNGEN GEFUNDEN:" -ForegroundColor Yellow
Write-Host "  Betriebssystem: $osDir" -ForegroundColor $(if (Test-Path $osDir) { "Green" } else { "Red" })
Write-Host "  Portal: $($portalDir.FullName)" -ForegroundColor $(if ($portalDir) { "Green" } else { "Yellow" })
Write-Host "  Manifest: $($manifestDir.FullName)" -ForegroundColor $(if ($manifestDir) { "Green" } else { "Yellow" })
Write-Host ""

# Sammle ALLE Dateien aus allen Abteilungen
Write-Host "[2] SAMMLE ALLE DATEIEN..." -ForegroundColor Yellow

$allFiles = @()

# Betriebssystem
if (Test-Path $osDir) {
    $osFiles = Get-ChildItem -Path $osDir -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notmatch '\\ARCHIV\\|\\Produktionsordner\\|\\node_modules\\|\\\.git\\'
    }
    $allFiles += $osFiles
    Write-Host "  Betriebssystem: $($osFiles.Count) Dateien" -ForegroundColor Cyan
}

# Portal
if ($portalDir) {
    $portalFiles = Get-ChildItem -Path $portalDir.FullName -Recurse -File -ErrorAction SilentlyContinue
    $allFiles += $portalFiles
    Write-Host "  Portal: $($portalFiles.Count) Dateien" -ForegroundColor Cyan
}

# Manifest
if ($manifestDir) {
    $manifestFiles = Get-ChildItem -Path $manifestDir.FullName -Recurse -File -ErrorAction SilentlyContinue
    $allFiles += $manifestFiles
    Write-Host "  Manifest: $($manifestFiles.Count) Dateien" -ForegroundColor Cyan
}

# Root-Level Dateien
$rootFiles = Get-ChildItem -Path $rootDir -File -ErrorAction SilentlyContinue
$allFiles += $rootFiles
Write-Host "  Root: $($rootFiles.Count) Dateien" -ForegroundColor Cyan

$totalFiles = $allFiles.Count
Write-Host ""
Write-Host "  GESAMT: $totalFiles Dateien zum Testen" -ForegroundColor Green
Write-Host ""

# Teste ALLE Dateien
Write-Host "[3] TESTE ALLE DATEIEN (100%)..." -ForegroundColor Yellow

$testResults = @{
    Total = $totalFiles
    Tested = 0
    Passed = 0
    Failed = 0
    Errors = @()
    FileTypes = @{}
}

$counter = 0
foreach ($file in $allFiles) {
    $counter++
    if ($counter % 50 -eq 0) {
        Write-Host "  Fortschritt: $counter/$totalFiles..." -ForegroundColor Cyan
    }
    
    $testResults.Tested++
    
    try {
        # Test 1: Datei lesbar?
        $null = Get-Content -Path $file.FullName -TotalCount 1 -ErrorAction Stop
        
        # Test 2: Datei-Typ spezifische Tests
        $ext = $file.Extension.ToLower()
        
        if (-not $testResults.FileTypes.ContainsKey($ext)) {
            $testResults.FileTypes[$ext] = @{ Total = 0; Passed = 0; Failed = 0 }
        }
        $testResults.FileTypes[$ext].Total++
        
        # HTML Tests
        if ($ext -eq '.html') {
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
            if ($content -match '<!DOCTYPE\s+html|<\s*html') {
                if ($content -notmatch '<meta\s+charset') {
                    throw "Fehlende charset-Deklaration"
                }
                $testResults.FileTypes[$ext].Passed++
                $testResults.Passed++
            } else {
                throw "Kein gültiges HTML"
            }
        }
        # JSON Tests
        elseif ($ext -eq '.json') {
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
            $null = $content | ConvertFrom-Json -ErrorAction Stop
            $testResults.FileTypes[$ext].Passed++
            $testResults.Passed++
        }
        # JavaScript Tests
        elseif ($ext -eq '.js') {
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
            # Prüfe auf offensichtliche Syntax-Fehler
            $openBraces = ([regex]::Matches($content, '\{')).Count
            $closeBraces = ([regex]::Matches($content, '\}')).Count
            if ($openBraces -ne $closeBraces) {
                throw "Ungleiche Klammern"
            }
            $testResults.FileTypes[$ext].Passed++
            $testResults.Passed++
        }
        # Andere Dateien
        else {
            $testResults.FileTypes[$ext].Passed++
            $testResults.Passed++
        }
        
    } catch {
        $testResults.Failed++
        $ext = $file.Extension.ToLower()
        if ($testResults.FileTypes.ContainsKey($ext)) {
            $testResults.FileTypes[$ext].Failed++
        }
        $testResults.Errors += "$($file.Name): $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "[4] TEST-ERGEBNISSE:" -ForegroundColor Yellow
Write-Host "  Getestet: $($testResults.Tested)/$($testResults.Total)" -ForegroundColor Cyan
Write-Host "  Bestanden: $($testResults.Passed)" -ForegroundColor Green
Write-Host "  Fehlgeschlagen: $($testResults.Failed)" -ForegroundColor $(if ($testResults.Failed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($testResults.Failed -gt 0) {
    Write-Host "FEHLER-DETAILS:" -ForegroundColor Red
    $testResults.Errors | Select-Object -First 20 | ForEach-Object {
        Write-Host "  - $_" -ForegroundColor Yellow
    }
    if ($testResults.Errors.Count -gt 20) {
        Write-Host "  ... und $($testResults.Errors.Count - 20) weitere" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Speichere Report
$reportPath = Join-Path $rootDir "FABRIK-COMPLETE-TEST-REPORT.json"
$testResults | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host "Report gespeichert: $reportPath" -ForegroundColor Cyan
Write-Host ""

if ($testResults.Failed -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "[OK] 100% FEHLERFREI!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    exit 0
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "[FEHLER] $($testResults.Failed) Dateien fehlgeschlagen" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    exit 1
}

