# Portal Cleanup Script
# Entfernt nicht benötigte Dateien, behält Backups und Settings

$archiveDir = "archive/cleanup-$(Get-Date -Format 'yyyy-MM-dd-HHmmss')"
New-Item -ItemType Directory -Path $archiveDir -Force | Out-Null

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PORTAL CLEANUP - SYSTEMAUFRÄUMUNG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Geschützte Ordner (NIEMALS löschen)
$protectedFolders = @(
    "Settings",
    "backup",
    "[.FREUNDSCHAFTSGESCHENK.T,.T,,.T,,,.]",
    "css",
    "js",
    "assets",
    "TELADIA",
    "TELBANK",
    "YORDY",
    "ultra",
    "functions",
    "migrations",
    "config",
    "demo-data",
    "powershell-extensions",
    "businessconnecthub-playwright-tests-full",
    "startupsystems-kernel",
    "verification"
)

# Dokumentationsdateien archivieren
Write-Host "Archiviere Dokumentationsdateien..." -ForegroundColor Yellow
$docPatterns = @(
    "ALLE-*.md",
    "FINAL-*.md",
    "IMPLEMENTATION-*.md",
    "DEPLOYMENT-*.md",
    "TEST-*.md",
    "FEHLER-*.md",
    "SYSTEM-*.md",
    "GIT-*.md",
    "GITHUB-*.md",
    "KRITISCHE-*.md",
    "DETAILLIERTE-*.md",
    "EMERGENCY-*.md",
    "QUICK-*.md",
    "START-*.md",
    "RUN-*.md",
    "PHASE-*.md",
    "OPTIONALE-*.md",
    "EINFACHE-*.md",
    "EINSCHÄTZUNG-*.md",
    "EINSTELLUNGSBERICHT-*.md",
    "EMAIL-*.md",
    "ENTWICKLER-*.md",
    "EU-LOGO-*.md",
    "SKIP-TO-*.md",
    "STARTUPSYSTEMS-*.md",
    "STATISTIK-*.md",
    "TELBANK-*.md",
    "PORTAL-REDESIGN-*.md",
    "BURG-MANIFEST.md",
    "BENUTZERHANDBUCH-*.md",
    "BUILDTOOLS-*.md",
    "CMS-*.md",
    "CLOUDFLARE-*.md",
    "COMMUNICATION-*.md",
    "DEVELOPMENT-*.md",
    "GESCHAEFTSMODELLE-*.md",
    "KI-*.md",
    "LINKEDIN-*.md",
    "LOCALHOST-*.md",
    "MASTER-*.md",
    "MIKRO-*.md",
    "NÄCHSTE-*.md",
    "ONLINE-*.md",
    "PUSH-*.md",
    "REPARATUR-*.md",
    "SIGNALING-*.md"
)

foreach ($pattern in $docPatterns) {
    Get-ChildItem -Path . -Filter $pattern -File -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_.Name -ne "README.md") {
            Move-Item -Path $_.FullName -Destination "$archiveDir/docs/" -Force -ErrorAction SilentlyContinue
            Write-Host "  Archiviert: $($_.Name)" -ForegroundColor Gray
        }
    }
}

# Alte Scripts archivieren
Write-Host "Archiviere alte Scripts..." -ForegroundColor Yellow
$oldScriptPatterns = @(
    "auto-*.js",
    "test-*.js",
    "fix-*.js",
    "backup-restore*.js",
    "comprehensive-*.js",
    "simple-*.js",
    "infinite-*.js",
    "live-*.js",
    "autonomous-*.js",
    "production-build-*.js",
    "data-export-*.js",
    "CHECK-*.js",
    "rich-media-*.js",
    "ai-frontend-integration.js",
    "mortgage-api-server.js",
    "presence-api-server.js",
    "signal-server.js",
    "telbank-transfer-server.js"
)

foreach ($pattern in $oldScriptPatterns) {
    Get-ChildItem -Path . -Filter $pattern -File -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_.Name -ne "autofix-client.js") {
            Move-Item -Path $_.FullName -Destination "$archiveDir/scripts/" -Force -ErrorAction SilentlyContinue
            Write-Host "  Archiviert: $($_.Name)" -ForegroundColor Gray
        }
    }
}

# Alte PowerShell-Scripts archivieren
Write-Host "Archiviere alte PowerShell-Scripts..." -ForegroundColor Yellow
Get-ChildItem -Path . -Filter "*.ps1" -File -ErrorAction SilentlyContinue | ForEach-Object {
    if ($_.Name -notin @("commit-and-push.ps1", "deploy-all-servers-ibm-real.ps1")) {
        if ($_.DirectoryName -notlike "*backup*") {
            Move-Item -Path $_.FullName -Destination "$archiveDir/scripts/" -Force -ErrorAction SilentlyContinue
            Write-Host "  Archiviert: $($_.Name)" -ForegroundColor Gray
        }
    }
}

# Alte HTML-Dateien archivieren
Write-Host "Archiviere alte HTML-Dateien..." -ForegroundColor Yellow
$oldHTML = @(
    "Developer Portal - Together Systems.html",
    "Job-Angebot - Together Systems Developer.html",
    "Portal – Start.html",
    "TogetherSystems · Enterprise Universe Licensed Space T,.&T,,. · Upload Portal.html",
    "TTT-UPLOAD-STORY-INTERACTIVE.html",
    "suppliers-story.html",
    "FINANZIERUNGSERSCHEN-VIEWUNITY-TOGETHERSYSTEMS.html"
)

foreach ($file in $oldHTML) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "$archiveDir/html/" -Force -ErrorAction SilentlyContinue
        Write-Host "  Archiviert: $file" -ForegroundColor Gray
    }
}

# Alte Dateien archivieren
Write-Host "Archiviere alte Dateien..." -ForegroundColor Yellow
$oldFiles = @(
    "*.zip",
    "*.yaml",
    "*.png",
    "*.jpg",
    "dummy",
    "cloudflare-complete.zip",
    "help-manifest.zip",
    "settings.zip",
    "portal-static-upload.zip"
)

foreach ($pattern in $oldFiles) {
    Get-ChildItem -Path . -Filter $pattern -File -ErrorAction SilentlyContinue | ForEach-Object {
        if ($_.Name -ne "icon.png") {
            Move-Item -Path $_.FullName -Destination "$archiveDir/files/" -Force -ErrorAction SilentlyContinue
            Write-Host "  Archiviert: $($_.Name)" -ForegroundColor Gray
        }
    }
}

# Alte Ordner archivieren
Write-Host "Archiviere alte Ordner..." -ForegroundColor Yellow
$oldFolders = @(
    "archive",
    "online",
    "Produktionsordner",
    "portal-entry-notice",
    "Developer Portal - Together Systems_files",
    "Job-Angebot - Together Systems Developer_files",
    "together-systems-meta-transaktionsportal-report",
    "CURSOR-COM"
)

foreach ($folder in $oldFolders) {
    if (Test-Path $folder) {
        Move-Item -Path $folder -Destination "$archiveDir/folders/" -Force -ErrorAction SilentlyContinue
        Write-Host "  Archiviert: $folder" -ForegroundColor Gray
    }
}

# SQL-Dateien archivieren (außer in geschützten Ordnern)
Write-Host "Archiviere SQL-Dateien..." -ForegroundColor Yellow
Get-ChildItem -Path . -Filter "*.sql" -File -ErrorAction SilentlyContinue | ForEach-Object {
    $isProtected = $false
    foreach ($protected in $protectedFolders) {
        if ($_.FullName -like "*\$protected\*") {
            $isProtected = $true
            break
        }
    }
    if (-not $isProtected) {
        Move-Item -Path $_.FullName -Destination "$archiveDir/sql/" -Force -ErrorAction SilentlyContinue
        Write-Host "  Archiviert: $($_.Name)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "CLEANUP ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Archiv: $archiveDir" -ForegroundColor White
Write-Host ""

