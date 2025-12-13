# T,. OSOTOSOS Automatisches Umlaut-Monitoring
# Wird bei jedem Build/Test automatisch ausgeführt

$ErrorActionPreference = "Continue"

$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

# Prüfe auf Umlaut-Fehler
$textFiles = Get-ChildItem -Path $rootDir -Recurse -File -Include *.html,*.js,*.css,*.md,*.txt,*.json,*.yaml,*.yml,*.ps1,*.ts | Where-Object {
    $_.FullName -notmatch '\\ARCHIV\\|\\Produktionsordner\\|\\node_modules\\|\\\.git\\|\\icons\\'
}

$errors = 0
foreach ($file in $textFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        
        # Prüfe auf falsche Umlaute
        if ($content -match 'ÃƒÂ¼|ÃƒÂ¤|ÃƒÂ¶|ÃƒÅ¸|ÃƒÅ“|Ãƒâ€ž|Ãƒ–') {
            $errors++
            Write-Warning "Umlaut-Fehler gefunden in: $($file.Name)"
        }
        
        # Prüfe HTML auf charset
        if ($file.Extension -eq '.html' -and $content -match '<html' -and $content -notmatch '<meta\s+charset') {
            $errors++
            Write-Warning "Fehlende charset-Deklaration in: $($file.Name)"
        }
    } catch {
        # Ignoriere Fehler
    }
}

if ($errors -gt 0) {
    Write-Host "FEHLER: $errors Umlaut-Probleme gefunden!" -ForegroundColor Red
    Write-Host "Führe aus: .\FIX-UMLAUT-ERRORS.ps1" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "[OK] Keine Umlaut-Fehler gefunden" -ForegroundColor Green
    exit 0
}
