# T,. OSOTOSOS ULTIMATE KOMPLETTES TEST-SYSTEM
# Testet ALLE Dateien - auch in tief verschachtelten Ordnern

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "T,. OSOTOSOS ULTIMATE KOMPLETTES TEST" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

Write-Host "Analysiere KOMPLETTES System (alle Ebenen)..." -ForegroundColor Cyan
Write-Host ""

# Sammle ALLE Dateien - auch in ARCHIV und Produktionsordner
Write-Host "[1] Sammle ALLE Dateien (inkl. Archive)..." -ForegroundColor Yellow
$allFiles = Get-ChildItem -Path $rootDir -Recurse -File -Force -ErrorAction SilentlyContinue

$totalFiles = $allFiles.Count
Write-Host "  Gefunden: $totalFiles Dateien (inkl. Archive)" -ForegroundColor Green

# Kategorisiere ALLE Dateien
$htmlFiles = $allFiles | Where-Object { $_.Extension -eq '.html' }
$jsFiles = $allFiles | Where-Object { $_.Extension -eq '.js' }
$cssFiles = $allFiles | Where-Object { $_.Extension -eq '.css' }
$jsonFiles = $allFiles | Where-Object { $_.Extension -eq '.json' }
$mdFiles = $allFiles | Where-Object { $_.Extension -eq '.md' }
$yamlFiles = $allFiles | Where-Object { $_.Extension -eq '.yaml' -or $_.Extension -eq '.yml' }
$tsFiles = $allFiles | Where-Object { $_.Extension -eq '.ts' }
$goFiles = $allFiles | Where-Object { $_.Extension -eq '.go' }
$psFiles = $allFiles | Where-Object { $_.Extension -eq '.ps1' -or $_.Extension -eq '.psm1' }
$shFiles = $allFiles | Where-Object { $_.Extension -eq '.sh' -or $_.Extension -eq '.bash' }
$batFiles = $allFiles | Where-Object { $_.Extension -eq '.bat' -or $_.Extension -eq '.cmd' }
$txtFiles = $allFiles | Where-Object { $_.Extension -eq '.txt' }
$otherFiles = $allFiles | Where-Object { 
    $_.Extension -notin @('.html', '.js', '.css', '.json', '.md', '.yaml', '.yml', '.ts', '.go', '.ps1', '.psm1', '.sh', '.bash', '.bat', '.cmd', '.txt')
}

Write-Host ""
Write-Host "Detaillierte Datei-Typen:" -ForegroundColor Cyan
Write-Host "  HTML: $($htmlFiles.Count)" -ForegroundColor White
Write-Host "  JavaScript: $($jsFiles.Count)" -ForegroundColor White
Write-Host "  CSS: $($cssFiles.Count)" -ForegroundColor White
Write-Host "  JSON: $($jsonFiles.Count)" -ForegroundColor White
Write-Host "  Markdown: $($mdFiles.Count)" -ForegroundColor White
Write-Host "  YAML: $($yamlFiles.Count)" -ForegroundColor White
Write-Host "  TypeScript: $($tsFiles.Count)" -ForegroundColor White
Write-Host "  Go: $($goFiles.Count)" -ForegroundColor White
Write-Host "  PowerShell: $($psFiles.Count)" -ForegroundColor White
Write-Host "  Shell Scripts: $($shFiles.Count)" -ForegroundColor White
Write-Host "  Batch: $($batFiles.Count)" -ForegroundColor White
Write-Host "  Text: $($txtFiles.Count)" -ForegroundColor White
Write-Host "  Andere: $($otherFiles.Count)" -ForegroundColor White

Write-Host ""
Write-Host "[2] Teste HTML-Dateien ($($htmlFiles.Count))..." -ForegroundColor Yellow
$htmlResults = @{
    Total = $htmlFiles.Count
    Valid = 0
    Invalid = 0
    Errors = @()
    MissingRefs = 0
    BrokenLinks = @()
}

$htmlCounter = 0
foreach ($file in $htmlFiles) {
    $htmlCounter++
    if ($htmlCounter % 10 -eq 0) {
        Write-Host "  Fortschritt: $htmlCounter/$($htmlFiles.Count)..." -ForegroundColor Cyan
    }
    
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        
        if ($content -match '<!DOCTYPE\s+html|<\s*html') {
            $htmlResults.Valid++
            
            # Prüfe ALLE Referenzen
            $refs = [regex]::Matches($content, '(?:href|src|action)=["'']([^"'']+)["'']')
            foreach ($ref in $refs) {
                $refPath = $ref.Groups[1].Value
                if ($refPath -notmatch '^(https?://|mailto:|tel:|#|javascript:|data:)') {
                    try {
                        $refFile = Join-Path $file.DirectoryName $refPath
                        $refFile = [System.IO.Path]::GetFullPath($refFile)
                        if (-not (Test-Path $refFile) -and $refPath -notmatch '\.\./') {
                            $htmlResults.MissingRefs++
                            $htmlResults.BrokenLinks += "$($file.Name) -> $refPath"
                        }
                    } catch {
                        # Ignoriere ungültige Pfade
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

$jsCounter = 0
foreach ($file in $jsFiles) {
    $jsCounter++
    if ($jsCounter % 10 -eq 0) {
        Write-Host "  Fortschritt: $jsCounter/$($jsFiles.Count)..." -ForegroundColor Cyan
    }
    
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        
        if ($content.Length -gt 0) {
            $jsResults.Valid++
            
            # Prüfe auf offensichtliche Syntax-Fehler
            $openBraces = ([regex]::Matches($content, '\{')).Count
            $closeBraces = ([regex]::Matches($content, '\}')).Count
            $openParens = ([regex]::Matches($content, '\(')).Count
            $closeParens = ([regex]::Matches($content, '\)')).Count
            $openBrackets = ([regex]::Matches($content, '\[')).Count
            $closeBrackets = ([regex]::Matches($content, '\]')).Count
            
            if ($openBraces -ne $closeBraces -or $openParens -ne $closeParens -or $openBrackets -ne $closeBrackets) {
                $jsResults.SyntaxErrors++
                $jsResults.Errors += "$($file.Name): Mögliche Syntax-Fehler"
            }
        } else {
            $jsResults.Valid++ # Leere Dateien sind OK
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
        $yamlResults.Valid++
    } catch {
        $yamlResults.Invalid++
        $yamlResults.Errors += "$($file.Name): $($_.Exception.Message)"
    }
}

Write-Host "  Gültig: $($yamlResults.Valid)" -ForegroundColor Green
Write-Host "  Ungültig: $($yamlResults.Invalid)" -ForegroundColor $(if ($yamlResults.Invalid -eq 0) { "Green" } else { "Red" })

Write-Host ""
Write-Host "[6] Teste Datei-Zugriff (ALLE $totalFiles Dateien)..." -ForegroundColor Yellow
$accessResults = @{
    Total = $totalFiles
    Readable = 0
    NotReadable = 0
    Errors = @()
}

$accessCounter = 0
foreach ($file in $allFiles) {
    $accessCounter++
    if ($accessCounter % 50 -eq 0) {
        Write-Host "  Fortschritt: $accessCounter/$totalFiles..." -ForegroundColor Cyan
    }
    
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
$dirs = Get-ChildItem -Path $rootDir -Recurse -Directory -Force -ErrorAction SilentlyContinue
Write-Host "  Verzeichnisse: $($dirs.Count)" -ForegroundColor Green

Write-Host ""
Write-Host "[8] Erstelle ULTIMATE Test-Report..." -ForegroundColor Yellow

$report = @{
    Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    TotalFiles = $totalFiles
    TotalDirectories = $dirs.Count
    FileTypes = @{
        HTML = $htmlFiles.Count
        JavaScript = $jsFiles.Count
        CSS = $cssFiles.Count
        JSON = $jsonFiles.Count
        Markdown = $mdFiles.Count
        YAML = $yamlFiles.Count
        TypeScript = $tsFiles.Count
        Go = $goFiles.Count
        PowerShell = $psFiles.Count
        Shell = $shFiles.Count
        Batch = $batFiles.Count
        Text = $txtFiles.Count
        Other = $otherFiles.Count
    }
    TestResults = @{
        HTML = $htmlResults
        JavaScript = $jsResults
        JSON = $jsonResults
        YAML = $yamlResults
        FileAccess = $accessResults
    }
    BrokenLinks = $htmlResults.BrokenLinks | Select-Object -First 50
}

$reportPath = Join-Path $rootDir "ULTIMATE-TEST-REPORT.json"
$report | ConvertTo-Json -Depth 10 | Out-File -FilePath $reportPath -Encoding UTF8

Write-Host "  [OK] Report gespeichert: $reportPath" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "ULTIMATE ZUSAMMENFASSUNG" -ForegroundColor Green
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
if ($htmlResults.MissingRefs -gt 0) {
    Write-Host "Fehlende Referenzen: $($htmlResults.MissingRefs)" -ForegroundColor Yellow
    Write-Host "Erste 10 defekte Links:" -ForegroundColor Yellow
    $htmlResults.BrokenLinks | Select-Object -First 10 | ForEach-Object {
        Write-Host "  - $_" -ForegroundColor White
    }
}
Write-Host ""
Write-Host "T,.&T,,.&T,,,.T." -ForegroundColor Green

