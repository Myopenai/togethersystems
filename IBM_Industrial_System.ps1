# IBM_Industrial_System.ps1
# Version: 1.0.1 - Fixed missing Write-SystemLog function
# Standards: IFW-001-2025, ISO/IEC 12207, IEC 61508

# Configuration
$SystemConfig = @{
    WorkspaceRoot = $PSScriptRoot
    LogPath = "$PSScriptRoot\Logs\System_$(Get-Date -Format 'yyyyMMdd').log"
    MaxLogSizeMB = 50
    RetentionDays = 30
}

# Logging Function
function Write-SystemLog {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [ValidateSet('INFO','WARNING','ERROR','DEBUG')]
        [string]$Level = "INFO"
    )
    
    # Ensure log directory exists
    $logDir = Split-Path -Path $SystemConfig.LogPath -Parent
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    # Create log entry
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Write to log file
    Add-Content -Path $SystemConfig.LogPath -Value $logEntry
    
    # Color output
    $color = @{
        'INFO' = 'White'
        'WARNING' = 'Yellow'
        'ERROR' = 'Red'
        'DEBUG' = 'Gray'
    }[$Level]
    
    # Write to console
    Write-Host $logEntry -ForegroundColor $color
}

# Initialize System
function Initialize-IndustrialSystem {
    param([string]$Mode = "Active")
    
    # Create required directories
    $dirs = @("Logs", "Config", "Backup", "Templates")
    $dirs | ForEach-Object {
        $path = Join-Path $SystemConfig.WorkspaceRoot $_
        if (-not (Test-Path $path)) {
            New-Item -ItemType Directory -Path $path -Force | Out-Null
        }
    }

    # Set system mode
    $SystemConfig.Mode = $Mode
    Write-SystemLog "System initialized in $Mode mode"
}

# Self-Healing Functions
function Repair-SystemComponents {
    param([string]$Component)
    
    switch ($Component) {
        "FileSystem" {
            Write-SystemLog "Verifying file system structure..." -Level "INFO"
            $requiredDirs = @("Config", "Logs", "Backup", "Templates")
            $requiredDirs | ForEach-Object {
                $path = Join-Path $SystemConfig.WorkspaceRoot $_
                if (-not (Test-Path $path)) {
                    New-Item -ItemType Directory -Path $path -Force | Out-Null
                    Write-SystemLog "Created missing directory: $path" -Level "WARNING"
                }
            }
        }
        "Configuration" {
            Write-SystemLog "Verifying system configuration..." -Level "INFO"
            $defaultConfigs = @{
                "system.json" = @{
                    version = "1.0.0"
                    settings = @{
                        logLevel = "INFO"
                        maxBackups = 30
                    }
                }
            }

            foreach ($file in $defaultConfigs.Keys) {
                $path = Join-Path "$($SystemConfig.WorkspaceRoot)\Config" $file
                if (-not (Test-Path $path)) {
                    $defaultConfigs[$file] | ConvertTo-Json -Depth 5 | Out-File $path
                    Write-SystemLog "Generated default configuration: $file" -Level "WARNING"
                }
            }
        }
    }
}

# Main Execution
try {
    # Initialize system
    Write-Host "=== IBM Industrial System ===" -ForegroundColor Cyan
    Write-Host "Initializing system in: $($SystemConfig.WorkspaceRoot)" -ForegroundColor Cyan
    
    Initialize-IndustrialSystem -Mode "Active"
    
    # Run self-healing checks
    Repair-SystemComponents -Component "FileSystem"
    Repair-SystemComponents -Component "Configuration"
    
    Write-Host "`nSystem initialization complete!" -ForegroundColor Green
    Write-Host "Log file: $($SystemConfig.LogPath)" -ForegroundColor Cyan
    Write-Host "Press Ctrl+C to exit" -ForegroundColor Yellow
    
    # Main system loop
    while ($true) {
        # System monitoring and maintenance tasks here
        Write-SystemLog "System is running in $($SystemConfig.Mode) mode" -Level "INFO"
        Start-Sleep -Seconds 60
    }
}
catch {
    $errorMsg = "System error: $_`n$($_.ScriptStackTrace)"
    Write-Host $errorMsg -ForegroundColor Red
    if (Get-Command -Name Write-SystemLog -ErrorAction SilentlyContinue) {
        Write-SystemLog $errorMsg -Level "ERROR"
    }
    exit 1
}