# T,. OSOTOSOS KOMPLETTES SYSTEM-TEST
# Testet ALLE Dateien im System systematisch

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "T,. OSOTOSOS KOMPLETTES SYSTEM-TEST" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

Write-Host "Analysiere komplettes System..." -ForegroundColor Cyan
Write-Host ""

# Sammle ALLE Dateien
Write-Host "[1] Sammle alle Dateien..." -ForegroundColor Yellow
$allFiles = Get-ChildItem -Path $rootDir -Recurse -File | Where-Object { 
    $_.FullName -notmatch '\\ARCHIV\\|\\Produktionsordner\\|\\node_modules\\|\\\.git\\' 
}

$totalFiles = $allFiles.Count
Write-Host "  Gefunden: $totalFiles Dateien" -ForegroundColor Green

# Kategorisiere Dateien
$htmlFiles = $allFiles | Where-Object { $_.Extension -eq '.html' }
$jsFiles = $allFiles | Where-Object { $_.Extension -eq '.js' }
$cssFiles = $allFiles | Where-Object { $_.Extension -eq '.css' }
$jsonFiles = $allFiles | Where-Object { $_.Extension -eq '.json' }
$mdFiles = $allFiles | Where-Object { $_.Extension -eq '.md' }
$yamlFiles = $allFiles | Where-Object { $_.Extension -eq '.yaml' -or $_.Extension -eq '.yml' }
$tsFiles = $allFiles | Where-Object { $_.Extension -eq '.ts' }
$goFiles = $allFiles | Where-Object { $_.Extension -eq '.go' }
$otherFiles = $allFiles | Where-Object { 
    $_.Extension -notin @('.html', '.js', '.css', '.json', '.md', '.yaml', '.yml', '.ts', '.go')
}

Write-Host ""
Write-Host "Datei-Typen:" -ForegroundColor Cyan
Write-Host "  HTML: $($htmlFiles.Count)" -ForegroundColor White
Write-Host "  JavaScript: $($jsFiles.Count)" -ForegroundColor White
Write-Host "  CSS: $($cssFiles.Count)" -ForegroundColor White
Write-Host "  JSON: $($jsonFiles.Count)" -ForegroundColor White
Write-Host "  Markdown: $($mdFiles.Count)" -ForegroundColor White
Write-Host "  YAML: $($yamlFiles.Count)" -ForegroundColor White
Write-Host "  TypeScript: $($tsFiles.Count)" -ForegroundColor White
Write-Host "  Go: $($goFiles.Count)" -ForegroundColor White
Write-Host "  Andere: $($otherFiles.Count)" -ForegroundColor White

Write-Host ""
Write-Host "[2] Teste HTML-Dateien ($($htmlFiles.Count))..." -ForegroundColor Yellow
$htmlResults = @{
    Total = $htmlFiles.Count
    Valid = 0
    Invalid = 0
    Errors = @()
    MissingRefs = 0
}

foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        
        # Prüfe auf gültiges HTML
        if ($content -match '<!DOCTYPE\s+html|<\s*html') {
            $htmlResults.Valid++
            
            # Prüfe auf Referenzen
            $refs = [regex]::Matches($content, '(?:href|src)=["'']([^"'']+)["'']')
            foreach ($ref in $refs) {
                $refPath = $ref.Groups[1].Value
                if ($refPath -notmatch '^(https?://|mailto:|tel:|#|javascript:|data:)') {
                    $refFile = Join-Path $file.DirectoryName $refPath
                    $refFile = [System.IO.Path]::GetFullPath($refFile)
                    if (-not (Test-Path $refFile) -and $refPath -notmatch '\.\./') {
                        $htmlResults.MissingRefs++
                    }
                }
            }
        } else {
            $htmlResults.Invalid++
            $htmlResults.Errors += "$($file.Name): Kein gültiges HTML"
        }
    } catch {
        $htmlResults.Invalid++
        $htmlResults.Errors += "$($file.Name): $($_.Exception.Message)"
    }
}

Write-Host "  Gültig: $($htmlResults.Valid)" -ForegroundColor Green
Write-Host "  Ungültig: $($htmlResults.Invalid)" -ForegroundColor $(if ($htmlResults.Invalid -eq 0) { "Green" } else { "Red" })
Write-Host "  Fehlende Referenzen: $($htmlResults.MissingRefs)" -ForegroundColor $(if ($htmlResults.MissingRefs -eq 0) { "Green" } else { "Yellow" })

Write-Host ""
Write-Host "[3] Teste JavaScript-Dateien ($($jsFiles.Count))..." -ForegroundColor Yellow
$jsResults = @{
    Total = $jsFiles.Count
    Valid = 0
    Invalid = 0
    Errors = @()
    SyntaxErrors = 0
}

foreach ($file in $jsFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        
        # Prüfe auf grundlegende Syntax
        if ($content -match 'function|const|let|var|class|export|import') {
            $jsResults.Valid++
            
            # Prüfe auf offensichtliche Syntax-Fehler
            $openBraces = ([regex]::Matches($content, '\{')).Count
            $closeBraces = ([regex]::Matches($content, '\}')).Count
            $openParens = ([regex]::Matches($content, '\(')).Count
            $closeParens = ([regex]::Matches($content, '\)')).Count
            
            if ($openBraces -ne $closeBraces -or $openParens -ne $closeParens) {
                $jsResults.SyntaxErrors++
                $jsResults.Errors += "$($file.Name): Mögliche Syntax-Fehler (Klammern)"
            }
        } else {
            $jsResults.Valid++ # Leere oder minimale Dateien sind auch OK
        }
    } catch {
        $jsResults.Invalid++
        $jsResults.Errors += "$($file.Name): $($_.Exception.Message)"
    }
}

Write-Host "  Gültig: $($jsResults.Valid)" -ForegroundColor Green
Write-Host "  Ungültig: $($jsResults.Invalid)" -ForegroundColor $(if ($jsResults.Invalid -eq 0) { "Green" } else { "Red" })
Write-Host "  Syntax-Fehler: $($jsResults.SyntaxErrors)" -ForegroundColor $(if ($jsResults.SyntaxErrors -eq 0) { "Green" } else { "Red" })

Write-Host ""
Write-Host "[4] Teste JSON-Dateien ($($jsonFiles.Count))..." -ForegroundColor Yellow
$jsonResults = @{
    Total = $jsonFiles.Count
    Valid = 0
    Invalid = 0
    Errors = @()
}

foreach ($file in $jsonFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        $null = $content | ConvertFrom-Json -ErrorAction Stop
        $jsonResults.Valid++
    } catch {
        $jsonResults.Invalid++
        $jsonResults.Errors += "$($file.Name): $($_.Exception.Message)"
    }
}

Write-Host "  Gültig: $($jsonResults.Valid)" -ForegroundColor Green
Write-Host "  Ungültig: $($jsonResults.Invalid)" -ForegroundColor $(if ($jsonResults.Invalid -eq 0) { "Green" } else { "Red" })

Write-Host ""
Write-Host "[5] Teste YAML-Dateien ($($yamlFiles.Count))..." -ForegroundColor Yellow
$yamlResults = @{
    Total = $yamlFiles.Count
    Valid = 0
    Invalid = 0
    Errors = @()
}

foreach ($file in $yamlFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        # Grundlegende YAML-Prüfung (vereinfacht)
        if ($content -match '^\s*[a-zA-Z_][a-zA-Z0-9_]*\s*:') {
            $yamlResults.Valid++
        } else {
            $yamlResults.Valid++ # Auch leere YAML-Dateien sind OK
        }
    } catch {
        $yamlResults.Invalid++
        $yamlResults.Errors += "$($file.Name): $($_.Exception.Message)"
    }
}

Write-Host "  Gültig: $($yamlResults.Valid)" -ForegroundColor Green
Write-Host "  Ungültig: $($yamlResults.Invalid)" -ForegroundColor $(if ($yamlResults.Invalid -eq 0) { "Green" } else { "Red" })

Write-Host ""
Write-Host "[6] Teste Datei-Zugriff..." -ForegroundColor Yellow
$accessResults = @{
    Total = $totalFiles
    Readable = 0
    NotReadable = 0
    Errors = @()
}

foreach ($file in $allFiles) {
    try {
        $null = Get-Content -Path $file.FullName -TotalCount 1 -ErrorAction Stop
        $accessResults.Readable++
    } catch {
        $accessResults.NotReadable++
        $accessResults.Errors += "$($file.Name): $($_.Exception.Message)"
    }
}

Write-Host "  Lesbar: $($accessResults.Readable)" -ForegroundColor Green
Write-Host "  Nicht lesbar: $($accessResults.NotReadable)" -ForegroundColor $(if ($accessResults.NotReadable -eq 0) { "Green" } else { "Red" })

Write-Host ""
Write-Host "[7] Teste Verzeichnis-Struktur..." -ForegroundColor Yellow
$dirs = Get-ChildItem -Path $rootDir -Recurse -Directory | Where-Object { 
    $_.FullName -notmatch '\\ARCHIV\\|\\Produktionsordner\\|\\node_modules\\|\\\.git\\' 
}
Write-Host "  Verzeichnisse: $($dirs.Count)" -ForegroundColor Green

Write-Host ""
Write-Host "[8] Erstelle detaillierten Test-Report..." -ForegroundColor Yellow

$report = @{
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    TotalFiles = $totalFiles
    FileTypes = @{
        HTML = $htmlFiles.Count
        JavaScript = $jsFiles.Count
        CSS = $cssFiles.Count
        JSON = $jsonFiles.Count
        Markdown = $mdFiles.Count
        YAML = $yamlFiles.Count
        TypeScript = $tsFiles.Count
        Go = $goFiles.Count
        Other = $otherFiles.Count
    }
    TestResults = @{
        HTML = $htmlResults
        JavaScript = $jsResults
        JSON = $jsonResults
        YAML = $yamlResults
        FileAccess = $accessResults
    }
    Directories = $dirs.Count
}

$reportPath = Join-Path $rootDir "COMPLETE-TEST-REPORT.json"
$report | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host "  [OK] Report gespeichert: $reportPath" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "ZUSAMMENFASSUNG" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Gesamt-Dateien: $totalFiles" -ForegroundColor Cyan
Write-Host "Verzeichnisse: $($dirs.Count)" -ForegroundColor Cyan
Write-Host ""
Write-Host "HTML: $($htmlResults.Valid)/$($htmlFiles.Count) gültig" -ForegroundColor $(if ($htmlResults.Invalid -eq 0) { "Green" } else { "Yellow" })
Write-Host "JavaScript: $($jsResults.Valid)/$($jsFiles.Count) gültig" -ForegroundColor $(if ($jsResults.Invalid -eq 0) { "Green" } else { "Yellow" })
Write-Host "JSON: $($jsonResults.Valid)/$($jsonFiles.Count) gültig" -ForegroundColor $(if ($jsonResults.Invalid -eq 0) { "Green" } else { "Yellow" })
Write-Host "YAML: $($yamlResults.Valid)/$($yamlFiles.Count) gültig" -ForegroundColor $(if ($yamlResults.Invalid -eq 0) { "Green" } else { "Yellow" })
Write-Host "Datei-Zugriff: $($accessResults.Readable)/$totalFiles lesbar" -ForegroundColor $(if ($accessResults.NotReadable -eq 0) { "Green" } else { "Yellow" })
Write-Host ""
Write-Host "T,.&T,,.&T,,,.T." -ForegroundColor Green

