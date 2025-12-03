# T,. OSOTOSOS Automatische Umlaut-Fehler-Behebung
# Fabrik-Standard: Alle Umlaute müssen korrekt sein!

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "T,. OSOTOSOS Umlaut-Fehler-Behebung" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

Write-Host "[1] Finde alle Dateien mit Umlaut-Problemen..." -ForegroundColor Yellow

# Sammle alle Text-Dateien
$textFiles = Get-ChildItem -Path $rootDir -Recurse -File -Include *.html,*.js,*.css,*.md,*.txt,*.json,*.yaml,*.yml,*.ps1,*.ts | Where-Object {
    $_.FullName -notmatch '\\ARCHIV\\|\\Produktionsordner\\|\\node_modules\\|\\\.git\\|\\icons\\'
}

$fixedFiles = 0
$totalFiles = $textFiles.Count
$errors = @()

Write-Host "  Gefunden: $totalFiles Dateien zum Prüfen" -ForegroundColor Cyan
Write-Host ""

$counter = 0
foreach ($file in $textFiles) {
    $counter++
    if ($counter % 20 -eq 0) {
        Write-Host "  Fortschritt: $counter/$totalFiles..." -ForegroundColor Cyan
    }
    
    try {
        # Lese Datei mit verschiedenen Encodings
        $content = $null
        $encoding = $null
        
        # Versuche UTF-8 zuerst
        try {
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
            $encoding = 'UTF8'
        } catch {
            # Versuche Default Encoding
            try {
                $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
                $encoding = 'Default'
            } catch {
                $errors += "$($file.Name): Konnte nicht lesen"
                continue
            }
        }
        
        if (-not $content) { continue }
        
        $needsFix = $false
        $fixedContent = $content
        
        # Prüfe auf falsche Umlaute (ISO-8859-1/Windows-1252 Fehler)
        $umlautErrors = @{
            'Ã¼' = 'ü'
            'Ã¤' = 'ä'
            'Ã¶' = 'ö'
            'ÃŸ' = 'ß'
            'Ãœ' = 'Ü'
            'Ã„' = 'Ä'
            'Ã–' = 'Ö'
            'Ã©' = 'é'
            'Ã¨' = 'è'
            'Ã ' = 'à'
            'Ã§' = 'ç'
            'Ã±' = 'ñ'
            'Ã­' = 'í'
            'Ã³' = 'ó'
            'Ãº' = 'ú'
        }
        
        foreach ($wrong in $umlautErrors.Keys) {
            if ($fixedContent -match [regex]::Escape($wrong)) {
                $needsFix = $true
                $fixedContent = $fixedContent -replace [regex]::Escape($wrong), $umlautErrors[$wrong]
            }
        }
        
        # Prüfe auf fehlende UTF-8 Meta-Tags in HTML
        if ($file.Extension -eq '.html' -and $fixedContent -match '<html') {
            if ($fixedContent -notmatch '<meta\s+charset=["'']?utf-8["'']?') {
                $needsFix = $true
                # Füge charset meta tag nach <head> ein
                if ($fixedContent -match '<head[^>]*>') {
                    $fixedContent = $fixedContent -replace '(<head[^>]*>)', "`$1`n  <meta charset=`"UTF-8`">"
                } elseif ($fixedContent -match '<html') {
                    $fixedContent = $fixedContent -replace '(<html[^>]*>)', "`$1`n<head>`n  <meta charset=`"UTF-8`">`n</head>"
                }
            }
        }
        
        # Prüfe auf falsche Encoding in PowerShell
        if ($file.Extension -eq '.ps1' -and $encoding -ne 'UTF8') {
            $needsFix = $true
        }
        
        # Speichere wenn Fix nötig
        if ($needsFix) {
            # Speichere immer als UTF-8
            [System.IO.File]::WriteAllText($file.FullName, $fixedContent, [System.Text.Encoding]::UTF8)
            $fixedFiles++
            Write-Host "  [FIX] $($file.Name)" -ForegroundColor Green
        }
        
    } catch {
        $errors += "$($file.Name): $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "[2] Prüfe HTML-Dateien auf fehlende charset-Deklarationen..." -ForegroundColor Yellow

$htmlFiles = Get-ChildItem -Path $rootDir -Recurse -File -Filter *.html | Where-Object {
    $_.FullName -notmatch '\\ARCHIV\\|\\Produktionsordner\\|\\node_modules\\|\\\.git\\'
}

$htmlFixed = 0
foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        
        if ($content -match '<html' -and $content -notmatch '<meta\s+charset') {
            # Füge charset ein
            if ($content -match '<head[^>]*>') {
                $newContent = $content -replace '(<head[^>]*>)', "`$1`n  <meta charset=`"UTF-8`">"
            } elseif ($content -match '<html') {
                $newContent = $content -replace '(<html[^>]*>)', "`$1`n<head>`n  <meta charset=`"UTF-8`">`n</head>"
            } else {
                continue
            }
            
            [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
            $htmlFixed++
            Write-Host "  [FIX] charset hinzugefügt: $($file.Name)" -ForegroundColor Green
        }
    } catch {
        $errors += "$($file.Name): $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "[3] Erstelle automatisches Umlaut-Monitoring..." -ForegroundColor Yellow

# Erstelle automatisches Monitoring-Script
$monitorScript = @"
# T,. OSOTOSOS Automatisches Umlaut-Monitoring
# Wird bei jedem Build/Test automatisch ausgeführt

`$ErrorActionPreference = "Continue"

`$rootDir = `$PSScriptRoot
if (-not `$rootDir) {
    `$rootDir = Get-Location
}

# Prüfe auf Umlaut-Fehler
`$textFiles = Get-ChildItem -Path `$rootDir -Recurse -File -Include *.html,*.js,*.css,*.md,*.txt,*.json,*.yaml,*.yml,*.ps1,*.ts | Where-Object {
    `$_.FullName -notmatch '\\ARCHIV\\|\\Produktionsordner\\|\\node_modules\\|\\\.git\\|\\icons\\'
}

`$errors = 0
foreach (`$file in `$textFiles) {
    try {
        `$content = Get-Content -Path `$file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        
        # Prüfe auf falsche Umlaute
        if (`$content -match 'Ã¼|Ã¤|Ã¶|ÃŸ|Ãœ|Ã„|Ã–') {
            `$errors++
            Write-Warning "Umlaut-Fehler gefunden in: `$(`$file.Name)"
        }
        
        # Prüfe HTML auf charset
        if (`$file.Extension -eq '.html' -and `$content -match '<html' -and `$content -notmatch '<meta\s+charset') {
            `$errors++
            Write-Warning "Fehlende charset-Deklaration in: `$(`$file.Name)"
        }
    } catch {
        # Ignoriere Fehler
    }
}

if (`$errors -gt 0) {
    Write-Host "FEHLER: `$errors Umlaut-Probleme gefunden!" -ForegroundColor Red
    Write-Host "Führe aus: .\FIX-UMLAUT-ERRORS.ps1" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "[OK] Keine Umlaut-Fehler gefunden" -ForegroundColor Green
    exit 0
}
"@

$monitorPath = Join-Path $rootDir "check-umlaut-errors.ps1"
$monitorScript | Out-File -FilePath $monitorPath -Encoding UTF8
Write-Host "  [OK] Monitoring-Script erstellt: $monitorPath" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "ZUSAMMENFASSUNG" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Gepruefte Dateien: $totalFiles" -ForegroundColor Cyan
Write-Host "Behobene Dateien: $fixedFiles" -ForegroundColor Green
Write-Host "HTML charset hinzugefügt: $htmlFixed" -ForegroundColor Green
Write-Host ""

if ($errors.Count -gt 0) {
    Write-Host "Fehler:" -ForegroundColor Red
    $errors | ForEach-Object {
        Write-Host "  - $_" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "Automatisches Monitoring:" -ForegroundColor Cyan
Write-Host "  - check-umlaut-errors.ps1 (prüft bei jedem Build)" -ForegroundColor White
Write-Host "  - FIX-UMLAUT-ERRORS.ps1 (behebt automatisch)" -ForegroundColor White
Write-Host ""
Write-Host "T,.&T,,.&T,,,.T." -ForegroundColor Green

