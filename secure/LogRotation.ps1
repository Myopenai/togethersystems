# LogRotation.ps1
# Scheduled task to rotate and compress old log files
# Recommended to run daily via Task Scheduler

param (
    [string]$LogPath = "D:\\logs\\sftp_transfers",
    [int]$RetentionDays = 30,
    [int]$CompressOlderThanDays = 7,
    [string]$BackupPath = "D:\\logs\\sftp_archive"
)

# Create backup directory if it doesn't exist
if (-not (Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
}

# Get current date for timestamping
$currentDate = Get-Date

# Function to compress logs
function Compress-Logs {
    param (
        [string]$SourceDir,
        [string]$DestinationDir,
        [int]$OlderThanDays
    )
    
    $cutoffDate = $currentDate.AddDays(-$OlderThanDays)
    $filesToCompress = Get-ChildItem -Path $SourceDir -Filter "*.log" | 
                       Where-Object { $_.LastWriteTime -lt $cutoffDate -and $_.Name -notlike "*.zip" }

    foreach ($file in $filesToCompress) {
        $zipFileName = "$($file.BaseName)_$($file.LastWriteTime.ToString('yyyyMMdd')).zip"
        $zipPath = Join-Path -Path $DestinationDir -ChildPath $zipFileName
        
        # Compress the file
        Compress-Archive -Path $file.FullName -DestinationPath $zipPath -CompressionLevel Optimal -Force
        
        # Verify the zip was created and then delete the original
        if (Test-Path $zipPath) {
            Remove-Item -Path $file.FullName -Force
            Write-Host "Compressed and removed: $($file.Name)"
        }
    }
}

# Function to clean up old archives
function Remove-OldArchives {
    param (
        [string]$ArchiveDir,
        [int]$KeepDays
    )
    
    $cutoffDate = $currentDate.AddDays(-$KeepDays)
    $oldArchives = Get-ChildItem -Path $ArchiveDir -Filter "*.zip" | 
                   Where-Object { $_.LastWriteTime -lt $cutoffDate }
    
    foreach ($archive in $oldArchives) {
        Remove-Item -Path $archive.FullName -Force
        Write-Host "Removed old archive: $($archive.Name)"
    }
}

try {
    # Rotate logs
    Write-Host "Starting log rotation at $(Get-Date)"
    
    # Compress logs older than specified days
    if (Test-Path $LogPath) {
        Compress-Logs -SourceDir $LogPath -DestinationDir $BackupPath -OlderThanDays $CompressOlderThanDays
    }
    
    # Clean up old archives beyond retention period
    Remove-OldArchives -ArchiveDir $BackupPath -KeepDays $RetentionDays
    
    # Clean up empty log files
    Get-ChildItem -Path $LogPath -Filter "*.log" -File | 
        Where-Object { $_.Length -eq 0 } | 
        Remove-Item -Force
        
    Write-Host "Log rotation completed successfully at $(Get-Date)"
    exit 0
}
catch {
    Write-Error "Error during log rotation: $_"
    exit 1
}
