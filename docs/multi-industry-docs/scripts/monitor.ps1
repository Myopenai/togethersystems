# File System Monitor Script
# Monitors file system changes and triggers actions

param(
    [string]$WatchPath = "$PSScriptRoot\..\src",
    [string]$LogFile = "$PSScriptRoot\..\logs\file_monitor.log",
    [string[]]$Include = @("*.js", "*.css", "*.html", "*.json"),
    [string[]]$Exclude = @("node_modules\", ".git\", "dist\"),
    [switch]$EnableLogging = $true
)

# Create logs directory if it doesn't exist
$logDir = Split-Path -Path $LogFile -Parent
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Function to write log messages
function Write-Log {
    param(
        [string]$Message,
        [ValidateSet("INFO", "WARNING", "ERROR")]
        [string]$Level = "INFO"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    
    if ($EnableLogging) {
        Add-Content -Path $LogFile -Value $logMessage -Encoding UTF8
    }
    
    switch ($Level) {
        "ERROR" { Write-Host $logMessage -ForegroundColor Red }
        "WARNING" { Write-Host $logMessage -ForegroundColor Yellow }
        default { Write-Host $logMessage -ForegroundColor White }
    }
}

# Function to handle file system changes
function On-FileSystemChange {
    param(
        [System.IO.FileSystemEventArgs]$Event
    )
    
    $changeType = $Event.ChangeType
    $filePath = $Event.FullPath
    $fileName = Split-Path -Path $filePath -Leaf
    
    # Skip if file is in excluded directories
    foreach ($exclude in $Exclude) {
        if ($filePath -like "*$exclude*") {
            return
        }
    }
    
    # Check if file extension is included
    $extension = [System.IO.Path]::GetExtension($fileName)
    $isIncluded = $false
    
    foreach ($inc in $Include) {
        if ($inc.StWith("*.") -and $extension -eq $inc.TrimStart('*')) {
            $isIncluded = $true
            break
        } elseif ($fileName -like $inc) {
            $isIncluded = $true
            break
        }
    }
    
    if (-not $isIncluded) {
        return
    }
    
    # Log the change
    $relativePath = [System.IO.Path]::GetRelativePath((Get-Location).Path, $filePath)
    Write-Log "File $changeType`: $relativePath" -Level "INFO"
    
    # Add your custom actions here based on file changes
    switch ($changeType) {
        "Changed" {
            # Example: Run tests when test files change
            if ($relativePath -like "*test*" -or $relativePath -like "*.spec.*") {
                Write-Log "Test file changed. Running tests..." -Level "INFO"
                npm test
            }
            # Example: Auto-format JavaScript files
            elseif ($extension -eq ".js") {
                # You can add code formatting here if needed
                # For example: npx standard --fix $relativePath
            }
        }
        "Created" {
            # Handle new file creation
            Write-Log "New file detected: $relativePath" -Level "INFO"
        }
        "Deleted" {
            # Handle file deletion
            Write-Log "File deleted: $relativePath" -Level "WARNING"
        }
        "Renamed" {
            # Handle file rename
            $oldName = Split-Path -Path $Event.OldFullPath -Leaf
            Write-Log "File renamed from $oldName to $fileName" -Level "INFO"
        }
    }
}

# Main script execution
Write-Host "=== File System Monitor ===" -ForegroundColor Cyan
Write-Host "Watching: $WatchPath" -ForegroundColor Cyan
Write-Host "Included patterns: $($Include -join ', ')" -ForegroundColor Cyan
Write-Host "Excluded patterns: $($Exclude -join ', ')" -ForegroundColor Cyan
Write-Host "Log file: $LogFile" -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop monitoring..." -ForegroundColor Yellow

# Create a file system watcher
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $WatchPath
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true

# Register event handlers
Register-ObjectEvent -InputObject $watcher -EventName Changed -Action { On-FileSystemChange -Event $EventArgs } | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName Created -Action { On-FileSystemChange -Event $EventArgs } | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName Deleted -Action { On-FileSystemChange -Event $EventArgs } | Out-Null
Register-ObjectEvent -InputObject $watcher -EventName Renamed -Action { On-FileSystemChange -Event $EventArgs } | Out-Null

# Keep the script running until Ctrl+C is pressed
try {
    Write-Log "Monitoring started at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -Level "INFO"
    while ($true) {
        # Keep the script running
        Start-Sleep -Seconds 1
    }
}
finally {
    # Cleanup on exit
    $watcher.EnableRaisingEvents = $false
    $watcher.Dispose()
    Write-Log "Monitoring stopped at $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -Level "INFO"
}
