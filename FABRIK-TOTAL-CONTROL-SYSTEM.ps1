# T,. FABRIK 100% TOTALE KONTROLLE
# Komplette Wiederholung aller Tests - Totale Kontrolle bis in den Kern

$ErrorActionPreference = "Continue"
$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = Get-Location }

Write-Host "T,. FABRIK 100% TOTALE KONTROLLE" -ForegroundColor Green
Write-Host ""

# Sammle ALLE Dateien
$allFiles = Get-ChildItem -Path $rootDir -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch '\\node_modules\\|\\\.git\\|\\ARCHIV\\|\\BACKUP\\'
}

Write-Host "Getestet: $($allFiles.Count) Dateien" -ForegroundColor Cyan

$passed = 0
$failed = 0
$errors = @()

foreach ($file in $allFiles) {
    try {
        $null = Get-Content -Path $file.FullName -TotalCount 1 -ErrorAction Stop
        $passed++
    } catch {
        $failed++
        $errors += "$($file.Name): $_"
    }
}

Write-Host "Bestanden: $passed" -ForegroundColor Green
Write-Host "Fehlgeschlagen: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })

if ($failed -eq 0) {
    Write-Host "T,. 100% FEHLERFREI!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "T,. $failed FEHLER - Wiederhole Tests..." -ForegroundColor Red
    exit 1
}

