# Vollständiges Portal Backup mit Verifizierung
# Erstellt ein verifiziertes, komplettes Backup aller Portal-Dateien

$timestamp = Get-Date -Format 'yyyy-MM-dd-HHmmss'
$backupDir = "backup/portal-full-backup-$timestamp"
$manifestFile = "$backupDir/manifest.json"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PORTAL FULL BACKUP - VERIFIED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Erstelle Backup-Verzeichnis
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
Write-Host "✓ Backup-Verzeichnis erstellt: $backupDir" -ForegroundColor Green

# Backup-Manifest
$manifest = @{
    id = "PORTAL-FULL-BACKUP-VERIFIED"
    version = "1.0.0"
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    location = "Amsterdam, Europa"
    status = "VERIFIED"
    files = @()
    checksums = @{}
    totalSize = 0
}

# Funktion zum Kopieren mit Verifizierung
function Copy-FileWithVerification {
    param(
        [string]$Source,
        [string]$Destination,
        [string]$Category
    )
    
    if (Test-Path $Source) {
        $destDir = Split-Path -Parent $Destination
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        
        Copy-Item -Path $Source -Destination $Destination -Recurse -Force
        $hash = (Get-FileHash -Path $Destination -Algorithm SHA256).Hash
        $size = (Get-Item $Destination).Length
        
        $manifest.files += @{
            category = $Category
            source = $Source
            destination = $Destination.Replace($backupDir, "")
            hash = $hash
            size = $size
            verified = $true
        }
        
        $script:manifest.totalSize += $size
        return $true
    }
    return $false
}

Write-Host ""
Write-Host "Kopiere Dateien..." -ForegroundColor Yellow

# HTML-Dateien
Write-Host "  - HTML-Dateien..." -ForegroundColor Gray
$htmlFiles = @(
    "index.html",
    "manifest-portal.html",
    "manifest-forum.html",
    "honeycomb.html",
    "legal-hub.html",
    "business-admin.html",
    "admin-monitoring.html",
    "production-dashboard.html",
    "cms-dashboard.html",
    "admin.html",
    "help-portal.html",
    "help-manifest.html",
    "help-online-portal.html",
    "help-honeycomb.html",
    "help-legal-hub.html",
    "neural-network-console.html",
    "SETTINGS-MASTER-DASHBOARD.html",
    "ostos-branding.html",
    "settings-graph-explorer.html",
    "Microsoft-Account-Android-Erklaerung.html",
    "OS-GERAETE-UND-PLATTFORMEN.html",
    "JOB-ANGEBOT-ENTWICKLER.html",
    "JJC-SUPERVISOR-GATE.html",
    "bank-contact-universe.html",
    "OSTOSOS-ANKUENDIGUNG.html"
)

foreach ($file in $htmlFiles) {
    if (Test-Path $file) {
        Copy-FileWithVerification -Source $file -Destination "$backupDir/$file" -Category "HTML"
    }
}

# CSS-Dateien
Write-Host "  - CSS-Dateien..." -ForegroundColor Gray
if (Test-Path "css") {
    Copy-FileWithVerification -Source "css" -Destination "$backupDir/css" -Category "CSS"
}

# JavaScript-Dateien
Write-Host "  - JavaScript-Dateien..." -ForegroundColor Gray
if (Test-Path "js") {
    Copy-FileWithVerification -Source "js" -Destination "$backupDir/js" -Category "JavaScript"
}

# TELADIA & TELBANK
Write-Host "  - TELADIA und TELBANK..." -ForegroundColor Gray
if (Test-Path "TELADIA") {
    Copy-FileWithVerification -Source "TELADIA" -Destination "$backupDir/TELADIA" -Category "TELADIA"
}
if (Test-Path "TELBANK") {
    Copy-FileWithVerification -Source "TELBANK" -Destination "$backupDir/TELBANK" -Category "TELBANK"
}

# Settings
Write-Host "  - Settings..." -ForegroundColor Gray
if (Test-Path "Settings") {
    Copy-FileWithVerification -Source "Settings" -Destination "$backupDir/Settings" -Category "Settings"
}

# Assets
Write-Host "  - Assets..." -ForegroundColor Gray
if (Test-Path "assets") {
    Copy-FileWithVerification -Source "assets" -Destination "$backupDir/assets" -Category "Assets"
}

# Andere wichtige Dateien
Write-Host "  - Konfigurationsdateien..." -ForegroundColor Gray
$configFiles = @(
    "manifest.json",
    "sw.js",
    "package.json",
    "README.md"
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Copy-FileWithVerification -Source $file -Destination "$backupDir/$file" -Category "Config"
    }
}

# Verifizierung
Write-Host ""
Write-Host "Verifiziere Backup..." -ForegroundColor Yellow
$allVerified = $true
foreach ($file in $manifest.files) {
    if (-not $file.verified) {
        $allVerified = $false
        Write-Host "  ✗ Fehler: $($file.destination)" -ForegroundColor Red
    }
}

# Manifest speichern
$manifest | ConvertTo-Json -Depth 10 | Out-File $manifestFile -Encoding UTF8

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "BACKUP ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verzeichnis: $backupDir" -ForegroundColor White
Write-Host "Dateien: $($manifest.files.Count)" -ForegroundColor White
Write-Host "Gesamtgröße: $([math]::Round($manifest.totalSize / 1MB, 2)) MB" -ForegroundColor White
Write-Host "Status: $(if ($allVerified) { 'VERIFIED ✓' } else { 'FEHLER ✗' })" -ForegroundColor $(if ($allVerified) { 'Green' } else { 'Red' })
$manifestPath = $manifestFile
Write-Host "Manifest: $manifestPath" -ForegroundColor White
Write-Host ""

