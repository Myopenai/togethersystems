# ============================================================================
# ROOT DISCOVERY AND PATCH SYSTEM
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# Industrielle Softwarefabrik - Vollstandige Root-Verifikation
# ============================================================================

param(
    [string]$RootPath = $PSScriptRoot,
    [switch]$CreatePatches = $true,
    [switch]$ApplyPatches = $false,
    [switch]$FullDiscovery = $true
)

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

# ═══════════════════════════════════════════════════════════════════════════
# KONFIGURATION
# ═══════════════════════════════════════════════════════════════════════════

$Timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
$ReportDir = Join-Path $RootPath "reports"
$PatchesDir = Join-Path $RootPath "patches"
$AuditDir = Join-Path $RootPath "audit"
$SbomDir = Join-Path $RootPath "sbom"
$ProvenanceDir = Join-Path $RootPath "provenance"

# Erstelle Verzeichnisse
@($ReportDir, $PatchesDir, $AuditDir, $SbomDir, $ProvenanceDir) | ForEach-Object {
    if (-not (Test-Path $_)) {
        New-Item -ItemType Directory -Path $_ -Force | Out-Null
    }
}

# ═══════════════════════════════════════════════════════════════════════════
# HASH-FUNKTIONEN
# ═══════════════════════════════════════════════════════════════════════════

function Get-FileHash {
    param([string]$FilePath)
    try {
        $content = Get-Content -Path $FilePath -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if ($null -eq $content) {
            $bytes = [System.IO.File]::ReadAllBytes($FilePath)
            $sha256 = [System.Security.Cryptography.SHA256]::Create()
            $hash = $sha256.ComputeHash($bytes)
            return [BitConverter]::ToString($hash).Replace("-", "").ToLower()
        }
        $utf8 = [System.Text.Encoding]::UTF8
        $bytes = $utf8.GetBytes($content)
        $sha256 = [System.Security.Cryptography.SHA256]::Create()
        $hash = $sha256.ComputeHash($bytes)
        return [BitConverter]::ToString($hash).Replace("-", "").ToLower()
    } catch {
        return "ERROR"
    }
}

function Get-MerkleRoot {
    param([array]$Hashes)
    if ($Hashes.Count -eq 0) { return "" }
    if ($Hashes.Count -eq 1) { return $Hashes[0] }
    
    $combined = $Hashes -join ""
    $utf8 = [System.Text.Encoding]::UTF8
    $bytes = $utf8.GetBytes($combined)
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    $hash = $sha256.ComputeHash($bytes)
    return [BitConverter]::ToString($hash).Replace("-", "").ToLower()
}

# ═══════════════════════════════════════════════════════════════════════════
# ROOT DISCOVERY
# ═══════════════════════════════════════════════════════════════════════════

function Start-RootDiscovery {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "ROOT DISCOVERY - VOLLSTÄNDIGE INVENTARISIERUNG" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $discovery = @{
        timestamp = $Timestamp
        rootPath = $RootPath
        files = @()
        directories = @()
        patches = @()
        fixes = @()
        configs = @()
        settings = @()
        schemas = @()
        policies = @()
        pipelines = @()
        generators = @()
        bootstrap = @()
        provenance = @()
        sbom = @()
        reports = @()
        statistics = @{}
    }
    
    # Scanne alle Dateien
    Write-Host "[SCAN] Scanne Dateien..." -ForegroundColor Yellow
    $allFiles = Get-ChildItem -Path $RootPath -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notmatch '\\node_modules\\|\\\.git\\|\\\.vscode\\|\\backup\\|\\archive\\|SCHROTTPLATZ'
    }
    
    $fileCount = 0
    $totalFiles = $allFiles.Count
    
    foreach ($file in $allFiles) {
        $fileCount++
        if ($fileCount % 100 -eq 0) {
            Write-Progress -Activity "Dateien scannen" -Status "$fileCount / $totalFiles" -PercentComplete (($fileCount / $totalFiles) * 100)
        }
        
        $relativePath = $file.FullName.Replace($RootPath, "").TrimStart("\")
        $hash = Get-FileHash -FilePath $file.FullName
        
        $fileExtension = if ($file.Extension) { $file.Extension } else { "" }
        
        $fileInfo = @{
            path = $relativePath
            fullPath = $file.FullName
            name = $file.Name
            extension = $fileExtension
            size = $file.Length
            lastModified = $file.LastWriteTime.ToString("yyyy-MM-ddTHH:mm:ssZ")
            hash = $hash
            mimeType = "unknown"
        }
        
        # MIME-Type bestimmen
        switch ($file.Extension.ToLower()) {
            ".json" { $fileInfo.mimeType = "application/json" }
            ".yaml" { $fileInfo.mimeType = "application/x-yaml" }
            ".yml" { $fileInfo.mimeType = "application/x-yaml" }
            ".js" { $fileInfo.mimeType = "application/javascript" }
            ".ts" { $fileInfo.mimeType = "application/typescript" }
            ".ps1" { $fileInfo.mimeType = "application/x-powershell" }
            ".md" { $fileInfo.mimeType = "text/markdown" }
            ".html" { $fileInfo.mimeType = "text/html" }
            ".css" { $fileInfo.mimeType = "text/css" }
            ".go" { $fileInfo.mimeType = "text/x-go" }
        }
        
        # Kategorisierung
        if ($relativePath -match "\\patches\\|\\patch\\|patch-") {
            $discovery.patches += $fileInfo
        }
        if ($relativePath -match "\\fixes\\|\\fix\\|fix-|auto-fix") {
            $discovery.fixes += $fileInfo
        }
        if ($relativePath -match "\\config\\|\\settings\\|config\.|settings\.") {
            $discovery.configs += $fileInfo
        }
        if ($relativePath -match "\\Settings\\") {
            $discovery.settings += $fileInfo
        }
        if ($relativePath -match "\\schemas\\|\.schema\.") {
            $discovery.schemas += $fileInfo
        }
        if ($relativePath -match "\\policies\\|policy\.") {
            $discovery.policies += $fileInfo
        }
        if ($relativePath -match "\\pipelines\\|pipeline\.") {
            $discovery.pipelines += $fileInfo
        }
        if ($relativePath -match "\\generators\\|generator\.") {
            $discovery.generators += $fileInfo
        }
        if ($relativePath -match "\\bootstrap\\|a-start") {
            $discovery.bootstrap += $fileInfo
        }
        if ($relativePath -match "\\provenance\\|provenance\.") {
            $discovery.provenance += $fileInfo
        }
        if ($relativePath -match "\\sbom\\|sbom\.") {
            $discovery.sbom += $fileInfo
        }
        if ($relativePath -match "\\reports\\|report\.") {
            $discovery.reports += $fileInfo
        }
        
        $discovery.files += $fileInfo
    }
    
    Write-Progress -Activity "Dateien scannen" -Completed
    
    # Scanne Verzeichnisse
    Write-Host "[SCAN] Scanne Verzeichnisse..." -ForegroundColor Yellow
    $allDirs = Get-ChildItem -Path $RootPath -Recurse -Directory -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notmatch "\\node_modules\\|\\\.git\\|\\\.vscode\\|\\backup\\|\\archive\\|SCHROTTPLATZ"
    }
    
    foreach ($dir in $allDirs) {
        $relativePath = $dir.FullName.Replace($RootPath, "").TrimStart("\")
        $discovery.directories += @{
            path = $relativePath
            fullPath = $dir.FullName
            name = $dir.Name
        }
    }
    
    # Statistiken
    $discovery.statistics = @{
        totalFiles = $discovery.files.Count
        totalDirectories = $discovery.directories.Count
        totalSize = ($discovery.files | Measure-Object -Property size -Sum).Sum
        byExtension = $discovery.files | Group-Object extension | ForEach-Object {
            @{
                extension = $_.Name
                count = $_.Count
                totalSize = ($_.Group | Measure-Object -Property size -Sum).Sum
            }
        }
        patchesCount = $discovery.patches.Count
        fixesCount = $discovery.fixes.Count
        configsCount = $discovery.configs.Count
        settingsCount = $discovery.settings.Count
        schemasCount = $discovery.schemas.Count
        policiesCount = $discovery.policies.Count
        pipelinesCount = $discovery.pipelines.Count
        generatorsCount = $discovery.generators.Count
        bootstrapCount = $discovery.bootstrap.Count
    }
    
    # Merkle Root berechnen
    Write-Host "[HASH] Berechne Merkle Root..." -ForegroundColor Yellow
    $hashes = $discovery.files | Where-Object { $_.hash -ne "ERROR" } | ForEach-Object { $_.hash }
    $discovery.merkleRoot = Get-MerkleRoot -Hashes $hashes
    
    # Speichere Discovery-Report
    $safeTimestamp = $Timestamp -replace ":", "-"
    $reportPath = Join-Path $ReportDir "root-discovery-$safeTimestamp.json"
    $discovery | ConvertTo-Json -Depth 10 | Set-Content -Path $reportPath -Encoding UTF8
    
    Write-Host ""
    Write-Host "[OK] Root Discovery abgeschlossen!" -ForegroundColor Green
    Write-Host "   Report: $reportPath" -ForegroundColor Cyan
    Write-Host "   Dateien: $($discovery.files.Count)" -ForegroundColor White
    Write-Host "   Verzeichnisse: $($discovery.directories.Count)" -ForegroundColor White
    Write-Host "   Merkle Root: $($discovery.merkleRoot.Substring(0, 16))..." -ForegroundColor White
    Write-Host ""
    
    return $discovery
}

# ═══════════════════════════════════════════════════════════════════════════
# PATCH-ERKENNUNG UND -ERSTELLUNG
# ═══════════════════════════════════════════════════════════════════════════

function Create-Patches {
    param([object]$Discovery)
    
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "PATCH-ERSTELLUNG" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $patches = @()
    
    # Erkenne veränderte Einstellungen
    Write-Host "[PATCH] Erkenne veranderte Einstellungen..." -ForegroundColor Yellow
    
    # Settings-Ordner Patches
    $settingsFiles = $Discovery.settings | Where-Object {
        $_.path -match "\.json$|\.yaml$|\.yml$"
    }
    
    foreach ($file in $settingsFiles) {
        $dateStr = Get-Date -Format "yyyyMMddHHmmss"
        $randomNum = Get-Random -Minimum 1000 -Maximum 9999
        $patchId = "PATCH-$dateStr-$randomNum"
        $patch = @{
            id = $patchId
            timestamp = $Timestamp
            type = "settings-update"
            target = $file.path
            targetHash = $file.hash
            description = "Settings-Update für $($file.name)"
            changes = @()
            status = "pending"
        }
        
        # Lese Datei und analysiere
        try {
            $content = Get-Content -Path $file.fullPath -Raw -Encoding UTF8
            if ($content -match "version|Version|VERSION") {
                $patch.changes += "Version-Update erkannt"
            }
            if ($content -match "lastUpdated|last_updated|last-updated") {
                $patch.changes += "Zeitstempel-Update erkannt"
            }
        } catch {
            $patch.changes += "Datei konnte nicht gelesen werden"
        }
        
        $patches += $patch
    }
    
    # Config-Patches
    $configFiles = $Discovery.configs | Where-Object {
        $_.path -match "config\.json$|config\.yaml$|config\.yml$"
    }
    
    foreach ($file in $configFiles) {
        $dateStr = Get-Date -Format "yyyyMMddHHmmss"
        $randomNum = Get-Random -Minimum 1000 -Maximum 9999
        $patchId = "PATCH-$dateStr-$randomNum"
        $patch = @{
            id = $patchId
            timestamp = $Timestamp
            type = "config-update"
            target = $file.path
            targetHash = $file.hash
            description = "Config-Update für $($file.name)"
            changes = @()
            status = "pending"
        }
        
        $patches += $patch
    }
    
    # Speichere Patches
    $safeTimestamp = $Timestamp -replace ":", "-"
    $patchesFile = Join-Path $PatchesDir "patches-$safeTimestamp.json"
    $patches | ConvertTo-Json -Depth 10 | Set-Content -Path $patchesFile -Encoding UTF8
    
    Write-Host ""
    Write-Host "[OK] Patches erstellt!" -ForegroundColor Green
    Write-Host "   Anzahl: $($patches.Count)" -ForegroundColor White
    Write-Host "   Datei: $patchesFile" -ForegroundColor Cyan
    Write-Host ""
    
    return $patches
}

# ═══════════════════════════════════════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════════════════

try {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "ROOT DISCOVERY AND PATCH SYSTEM" -ForegroundColor Green
    Write-Host "TOGETHERSYSTEMS. INTERNATIONAL TTT" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Root Discovery
    $discovery = Start-RootDiscovery
    
    # Patch-Erstellung
    if ($CreatePatches) {
        $patches = Create-Patches -Discovery $discovery
    }
    
    Write-Host ""
    Write-Host "[OK] ALLE OPERATIONEN ABGESCHLOSSEN!" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "[ERROR] FEHLER:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    exit 1
}

