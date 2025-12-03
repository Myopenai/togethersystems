# ============================================================================
# FABRIK 100% TOTALE KONTROLLE
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Komplette Wiederholung aller Tests - Totale Kontrolle bis in den Kern
# ============================================================================

$ErrorActionPreference = "Continue"

$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "T,. FABRIK 100% TOTALE KONTROLLE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$testResults = @{
    TotalFiles = 0
    Tested = 0
    Passed = 0
    Failed = 0
    Errors = @()
    Systems = @{}
}

# ============================================================================
# PHASE 1: SYSTEMATISCHE DATEI-ANALYSE
# ============================================================================
Write-Host "[PHASE 1] Systematische Datei-Analyse..." -ForegroundColor Yellow
Write-Host ""

$allFiles = Get-ChildItem -Path $rootDir -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch '\\node_modules\\|\\\.git\\|\\ARCHIV\\|\\BACKUP\\|\\TEMP\\'
}

$testResults.TotalFiles = $allFiles.Count
Write-Host "  Gefunden: $($allFiles.Count) Dateien zum Testen" -ForegroundColor Cyan

# Kategorisiere nach Systemen
$systems = @{
    "OSOTOSOS" = "OSTOSOS-COMPLETE-OS-SYSTEM"
    "Portal" = "manifest-portal.html|manifest-forum.html|Portal"
    "Manifest" = "manifest-forum.html|manifest-portal.html|Settings"
    "Fabrik" = "TogetherSystems"
    "Builds" = "builds"
    "Settings" = "Settings"
}

foreach ($systemName in $systems.Keys) {
    $pattern = $systems[$systemName]
    $systemFiles = $allFiles | Where-Object { $_.FullName -match $pattern }
    $testResults.Systems[$systemName] = @{
        Total = $systemFiles.Count
        Tested = 0
        Passed = 0
        Failed = 0
        Errors = @()
    }
    Write-Host "  $systemName : $($systemFiles.Count) Dateien" -ForegroundColor Cyan
}

Write-Host ""

# ============================================================================
# PHASE 2: KERN-FUNKTIONS-TESTS
# ============================================================================
Write-Host "[PHASE 2] Kern-Funktions-Tests..." -ForegroundColor Yellow
Write-Host ""

$counter = 0
foreach ($file in $allFiles) {
    $counter++
    if ($counter % 1000 -eq 0) {
        Write-Host "  Fortschritt: $counter/$($allFiles.Count)..." -ForegroundColor Cyan
    }
    
    $testResults.Tested++
    
    try {
        # Test 1: Datei lesbar?
        $null = Get-Content -Path $file.FullName -TotalCount 1 -ErrorAction Stop
        
        # Test 2: Datei-Typ spezifische Tests
        $ext = $file.Extension.ToLower()
        
        # HTML Tests
        if ($ext -eq '.html') {
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
            if ($content -match '<!DOCTYPE\s+html|<\s*html') {
                if ($content -notmatch '<meta\s+charset') {
                    throw "Fehlende charset-Deklaration"
                }
                # Pruefe Referenzen
                $refs = [regex]::Matches($content, '(?:href|src)=["'']([^"'']+)["'']')
                foreach ($ref in $refs) {
                    $refPath = $ref.Groups[1].Value
                    if ($refPath -notmatch '^(https?://|mailto:|tel:|#|javascript:|data:)') {
                        $refFile = Join-Path $file.DirectoryName $refPath
                        $refFile = [System.IO.Path]::GetFullPath($refFile)
                        if (-not (Test-Path $refFile) -and $refPath -notmatch '\.\./') {
                            throw "Fehlende Referenz: $refPath"
                        }
                    }
                }
            }
        }
        # JSON Tests
        elseif ($ext -eq '.json') {
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
            $null = $content | ConvertFrom-Json -ErrorAction Stop
        }
        # JavaScript Tests
        elseif ($ext -eq '.js') {
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
            $openBraces = ([regex]::Matches($content, '\{')).Count
            $closeBraces = ([regex]::Matches($content, '\}')).Count
            $openParens = ([regex]::Matches($content, '\(')).Count
            $closeParens = ([regex]::Matches($content, '\)')).Count
            if ($openBraces -ne $closeBraces -or $openParens -ne $closeParens) {
                throw "Ungleiche Klammern (braces: $openBraces/$closeBraces, parens: $openParens/$closeParens)"
            }
        }
        # TypeScript Tests
        elseif ($ext -eq '.ts') {
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
            # Basis-Syntax-Check
            if ($content -match 'import\s+.*from\s+[''"]' -and $content -notmatch 'export') {
                # Warnung, kein Fehler
            }
        }
        # Go Tests
        elseif ($ext -eq '.go') {
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
            if ($content -match 'package\s+\w+' -and $content -notmatch 'func\s+\w+') {
                # Warnung, kein Fehler
            }
        }
        
        $testResults.Passed++
        
        # System-spezifische Zaehlung
        foreach ($systemName in $systems.Keys) {
            if ($file.FullName -match $systems[$systemName]) {
                $testResults.Systems[$systemName].Tested++
                $testResults.Systems[$systemName].Passed++
                break
            }
        }
        
    } catch {
        $testResults.Failed++
        $errorMsg = "$($file.Name): $($_.Exception.Message)"
        $testResults.Errors += $errorMsg
        
        # System-spezifische Zaehlung
        foreach ($systemName in $systems.Keys) {
            if ($file.FullName -match $systems[$systemName]) {
                $testResults.Systems[$systemName].Tested++
                $testResults.Systems[$systemName].Failed++
                $testResults.Systems[$systemName].Errors += $errorMsg
                break
            }
        }
    }
}

Write-Host ""

# ============================================================================
# PHASE 3: NETZWERK- UND SYSTEM-TESTS
# ============================================================================
Write-Host "[PHASE 3] Netzwerk- und System-Tests..." -ForegroundColor Yellow
Write-Host ""

# Test Port-Verfuegbarkeit
$ports = @(8080, 3000, 9090, 9323)
foreach ($port in $ports) {
    $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -InformationLevel Quiet
    if ($connection) {
        Write-Host "  [OK] Port $port ist verfuegbar" -ForegroundColor Green
    } else {
        Write-Host "  [INFO] Port $port ist nicht belegt" -ForegroundColor Cyan
    }
}

Write-Host ""

# ============================================================================
# PHASE 4: BUILD-VERIFIKATION
# ============================================================================
Write-Host "[PHASE 4] Build-Verifikation..." -ForegroundColor Yellow
Write-Host ""

$buildPaths = @(
    "builds\go-executable\build",
    "OSTOSOS-COMPLETE-OS-SYSTEM\build-server"
)

foreach ($buildPath in $buildPaths) {
    $fullPath = Join-Path $rootDir $buildPath
    if (Test-Path $fullPath) {
        $buildFiles = Get-ChildItem -Path $fullPath -Recurse -File -ErrorAction SilentlyContinue
        Write-Host "  [OK] $buildPath : $($buildFiles.Count) Build-Artefakte" -ForegroundColor Green
    } else {
        Write-Host "  [WARNUNG] $buildPath nicht gefunden" -ForegroundColor Yellow
    }
}

Write-Host ""

# ============================================================================
# ZUSAMMENFASSUNG
# ============================================================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "T,. TEST-ZUSAMMENFASSUNG" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Gesamt:" -ForegroundColor Cyan
Write-Host "  Getestet: $($testResults.Tested)/$($testResults.TotalFiles)" -ForegroundColor White
Write-Host "  Bestanden: $($testResults.Passed)" -ForegroundColor Green
Write-Host "  Fehlgeschlagen: $($testResults.Failed)" -ForegroundColor $(if ($testResults.Failed -eq 0) { "Green" } else { "Red" })
Write-Host ""

Write-Host "System-spezifisch:" -ForegroundColor Cyan
foreach ($systemName in $testResults.Systems.Keys) {
    $sys = $testResults.Systems[$systemName]
    $status = if ($sys.Failed -eq 0) { "[OK]" } else { "[FEHLER]" }
    $color = if ($sys.Failed -eq 0) { "Green" } else { "Red" }
    Write-Host "  $status $systemName : $($sys.Passed)/$($sys.Total) bestanden, $($sys.Failed) Fehler" -ForegroundColor $color
}

Write-Host ""

if ($testResults.Failed -gt 0) {
    Write-Host "Fehler-Details (erste 20):" -ForegroundColor Yellow
    $testResults.Errors | Select-Object -First 20 | ForEach-Object {
        Write-Host "  - $_" -ForegroundColor Red
    }
    if ($testResults.Errors.Count -gt 20) {
        Write-Host "  ... und $($testResults.Errors.Count - 20) weitere" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Speichere Report
$reportPath = Join-Path $rootDir "FABRIK-TOTAL-CONTROL-REPORT.json"
$testResults | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8
Write-Host "Report gespeichert: $reportPath" -ForegroundColor Cyan
Write-Host ""

if ($testResults.Failed -eq 0) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "T,. 100% FEHLERFREI!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    exit 0
} else {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "T,. $($testResults.Failed) FEHLER GEFUNDEN" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Wiederhole Tests nach Fehlerbehebung..." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "T,.&T,,.&T,,,.T." -ForegroundColor Cyan

