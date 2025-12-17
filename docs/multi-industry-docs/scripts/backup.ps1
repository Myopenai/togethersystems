# Backup Script
# Creates timestamped backups of the project

param(
    [string]$BackupPath = "$PSScriptRoot\..\backups",
    [switch]$AutoCleanup,
    [int]$KeepDays = 30
)

# Create backup directory if it doesn't exist
if (-not (Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
}

# Generate timestamp for backup folder
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "$BackupPath\backup_$timestamp"

# List of directories to include in backup
$directoriesToBackup = @(
    "src",
    "public",
    "config",
    "scripts"
)

# List of files to include in backup
$filesToBackup = @(
    "package.json",
    "package-lock.json",
    ".env",
    "README.md"
)

try {
    Write-Host "Creating backup at: $backupDir" -ForegroundColor Cyan
    
    # Create backup directory
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    # Copy directories
    foreach ($dir in $directoriesToBackup) {
        if (Test-Path $dir) {
            $destDir = "$backupDir\$dir"
            New-Item -ItemType Directory -Path (Split-Path $destDir -Parent) -Force | Out-Null
            Copy-Item -Path $dir -Destination $destDir -Recurse -Force
            Write-Host "Backed up directory: $dir" -ForegroundColor Green
        }
    }
    
    # Copy files
    foreach ($file in $filesToBackup) {
        if (Test-Path $file) {
            $destFile = "$backupDir\$file"
            New-Item -ItemType Directory -Path (Split-Path $destFile -Parent) -Force | Out-Null
            Copy-Item -Path $file -Destination $destFile -Force
            Write-Host "Backed up file: $file" -ForegroundColor Green
        }
    }
    
    # Create a manifest of the backup
    $manifest = @{
        "BackupDate" = (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
        "SourcePath" = $PSScriptRoot
        "IncludedDirectories" = $directoriesToBackup
        "IncludedFiles" = $filesToBackup
    }
    
    $manifest | ConvertTo-Json -Depth 5 | Out-File "$backupDir\backup_manifest.json" -Encoding utf8
    
    # Auto-cleanup old backups if enabled
    if ($AutoCleanup) {
        Write-Host "Cleaning up backups older than $KeepDays days..." -ForegroundColor Cyan
        $cutoffDate = (Get-Date).AddDays(-$KeepDays)
        $backupFolders = Get-ChildItem -Path $BackupPath -Directory -Filter "backup_*"
        
        foreach ($folder in $backupFolders) {
            if ($folder.LastWriteTime -lt $cutoffDate) {
                Remove-Item -Path $folder.FullName -Recurse -Force
                Write-Host "Removed old backup: $($folder.Name)" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host "Backup completed successfully!" -ForegroundColor Green
    Write-Host "Backup location: $backupDir" -ForegroundColor Cyan
    
    # Calculate and display backup size
    $backupSize = (Get-ChildItem -Path $backupDir -Recurse | Measure-Object -Property Length -Sum).Sum
    $backupSizeMB = [math]::Round(($backupSize / 1MB), 2)
    Write-Host "Backup size: $backupSizeMB MB" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error during backup: $_" -ForegroundColor Red
    exit 1
}
