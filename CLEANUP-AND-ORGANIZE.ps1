# ============================================================================
# CLEANUP AND ORGANIZE
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Raeumt auf und organisiert Dateien
# ============================================================================

$ErrorActionPreference = "Continue"

$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "T,. CLEANUP AND ORGANIZE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Erstelle Organisations-Ordner falls nicht vorhanden
$orgDirs = @{
    "ARCHIV" = "Alte/Archivierte Dateien"
    "TEMP" = "Temporaere Dateien"
    "BACKUP" = "Backups"
    "DOCS" = "Dokumentation"
    "SCRIPTS" = "Scripts"
}

foreach ($dir in $orgDirs.Keys) {
    $path = Join-Path $rootDir $dir
    if (-not (Test-Path $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
        Write-Host "[OK] Erstellt: $dir" -ForegroundColor Green
    }
}

# Verschiebe ueberfluessige Dateien
Write-Host ""
Write-Host "[1] Verschiebe ueberfluessige Dateien..." -ForegroundColor Yellow

# Test-Reports nach BACKUP
$testReports = Get-ChildItem -Path $rootDir -Filter "*TEST-REPORT*.json" -ErrorAction SilentlyContinue
foreach ($file in $testReports) {
    $dest = Join-Path $rootDir "BACKUP" $file.Name
    Move-Item -Path $file.FullName -Destination $dest -Force -ErrorAction SilentlyContinue
    Write-Host "  [VERSCHOBEN] $($file.Name) -> BACKUP/" -ForegroundColor Cyan
}

# Backup-Dateien nach BACKUP
$backups = Get-ChildItem -Path $rootDir -Recurse -Filter "*.backup*" -ErrorAction SilentlyContinue | Where-Object {
    $_.DirectoryName -eq $rootDir
}
foreach ($file in $backups) {
    $dest = Join-Path $rootDir "BACKUP" $file.Name
    Move-Item -Path $file.FullName -Destination $dest -Force -ErrorAction SilentlyContinue
    Write-Host "  [VERSCHOBEN] $($file.Name) -> BACKUP/" -ForegroundColor Cyan
}

# Status-Dokumente nach DOCS
$statusDocs = Get-ChildItem -Path $rootDir -Filter "*STATUS*.md" -ErrorAction SilentlyContinue
foreach ($file in $statusDocs) {
    $dest = Join-Path (Join-Path $rootDir "DOCS") $file.Name
    Move-Item -Path $file.FullName -Destination $dest -Force -ErrorAction SilentlyContinue
    Write-Host "  [VERSCHOBEN] $($file.Name) -> DOCS/" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "T,. CLEANUP ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "T,.&T,,.&T,,,.T." -ForegroundColor Cyan

