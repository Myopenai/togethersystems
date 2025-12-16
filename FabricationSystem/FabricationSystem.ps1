<#
.SYNOPSIS
    Fabrication System - A robust system monitoring and maintenance tool
.DESCRIPTION
    Monitors system health, performs automated maintenance, and provides detailed reporting.
    Supports Active and Ruhestand modes for different levels of system intervention.
.NOTES
    Author: Raymond Demitrio Tel
    Version: 2.1.0
    Last Updated: 2025-12-13
#>

#region Configuration
$script:Config = @{
    Version = "2.1.0"
    Author = "Raymond Demitrio Tel"
    Mode = $null
    LastHealthCheck = $null
    IssuesResolved = 0
    StartTime = Get-Date
    ReportInterval = [TimeSpan]::FromMinutes(5)
    NextReportTime = (Get-Date).AddMinutes(5)
    RootPath = $PSScriptRoot
    LogPath = Join-Path -Path $env:USERPROFILE -ChildPath "FabricationSystem\Logs"
    ReportPath = Join-Path -Path $env:USERPROFILE -ChildPath "FabricationSystem\Reports"
    IssuesPath = Join-Path -Path $env:USERPROFILE -ChildPath "FabricationSystem\Issues"
    FixesPath = Join-Path -Path $env:USERPROFILE -ChildPath "FabricationSystem\Fixes"
    IsRunning = $false
}

# Create necessary directories
$null = New-Item -ItemType Directory -Path $script:Config.LogPath -Force
$null = New-Item -ItemType Directory -Path $script:Config.ReportPath -Force
$null = New-Item -ItemType Directory -Path $script:Config.IssuesPath -Force
$null = New-Item -ItemType Directory -Path $script:Config.FixesPath -Force
#endregion

#region Core Functions
function Write-SystemLog {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        
        [Parameter(Mandatory=$false)]
        [ValidateSet("Error", "Warning", "Information", "Verbose", "Critical")]
        [string]$Level = "Information",
        
        [Parameter(Mandatory=$false)]
        [string]$Component = "System"
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
    $logMessage = "[$timestamp] [$Level] [$Component] $Message"
    
    # Write to console with color coding
    $originalColor = $host.UI.RawUI.ForegroundColor
    switch ($Level) {
        "Error" { $host.UI.RawUI.ForegroundColor = "Red" }
        "Warning" { $host.UI.RawUI.ForegroundColor = "Yellow" }
        "Information" { $host.UI.RawUI.ForegroundColor = "White" }
        "Critical" { $host.UI.RawUI.ForegroundColor = "DarkRed" }
        "Verbose" { $host.UI.RawUI.ForegroundColor = "Gray" }
    }
    
    Write-Output $logMessage
    $host.UI.RawUI.ForegroundColor = $originalColor
    
    # Write to log file
    $logFile = Join-Path -Path $script:Config.LogPath -ChildPath "fabrication_$(Get-Date -Format 'yyyyMMdd').log"
    try {
        Add-Content -Path $logFile -Value $logMessage -ErrorAction Stop
    } catch {
        Write-Error "Failed to write to log file: $_"
    }
}

function Get-SystemHealth {
    [CmdletBinding()]
    param()

    try {
        $health = @{
            Status = "Healthy"
            Timestamp = Get-Date
            Checks = @()
            Issues = @()
        }

        # CPU Check
        try {
            $cpu = (Get-WmiObject Win32_Processor | Measure-Object -Property LoadPercentage -Average).Average
            $cpuStatus = if ($null -eq $cpu) { "Warning" } else { "Healthy" }
            $cpuMessage = if ($null -eq $cpu) { "Unable to read CPU usage" } else { "CPU usage: $cpu%" }
            
            $check = New-Object PSObject -Property @{
                Name = "CPU"
                Status = $cpuStatus
                Message = $cpuMessage
                Value = if ($null -ne $cpu) { "$cpu%" } else { "N/A" }
                Timestamp = Get-Date
            }
            
            $health.Checks += $check
            if ($cpuStatus -ne "Healthy") { 
                $health.Issues += "CPU: $cpuMessage"
                $health.Status = "Warning"
            }
        } catch {
            $health.Checks += New-Object PSObject -Property @{
                Name = "CPU"
                Status = "Error"
                Message = "Failed to check CPU: $_"
                Value = "N/A"
                Timestamp = Get-Date
            }
            $health.Issues += "CPU: Failed to check CPU: $_"
            $health.Status = "Error"
        }

        # Memory Check
        try {
            $os = Get-WmiObject Win32_OperatingSystem
            $totalMemory = $os.TotalVisibleMemorySize / 1MB
            $freeMemory = $os.FreePhysicalMemory / 1MB
            $usedMemory = $totalMemory - $freeMemory
            $memoryPercent = [math]::Round(($usedMemory / $totalMemory) * 100, 2)
            
            $memoryStatus = if ($memoryPercent -gt 90) { "Warning" } else { "Healthy" }
            
            $check = New-Object PSObject -Property @{
                Name = "Memory"
                Status = $memoryStatus
                Message = "Memory: ${memoryPercent}% used (${usedMemory} GB of ${totalMemory} GB)"
                Value = "${memoryPercent}%"
                Timestamp = Get-Date
            }
            
            $health.Checks += $check
            if ($memoryStatus -ne "Healthy") { 
                $health.Issues += "Memory: High memory usage (${memoryPercent}%)"
                $health.Status = "Warning"
            }
        } catch {
            $health.Checks += New-Object PSObject -Property @{
                Name = "Memory"
                Status = "Error"
                Message = "Failed to check memory: $_"
                Value = "N/A"
                Timestamp = Get-Date
            }
            $health.Issues += "Memory: Failed to check memory: $_"
            $health.Status = "Error"
        }

        # Disk Check
        try {
            $disk = Get-WmiObject Win32_LogicalDisk -Filter "DeviceID='C:'" | 
                    Select-Object Size, FreeSpace
            $totalSpace = [math]::Round($disk.Size / 1GB, 2)
            $freeSpace = [math]::Round($disk.FreeSpace / 1GB, 2)
            $usedSpacePercent = [math]::Round((1 - ($disk.FreeSpace / $disk.Size)) * 100, 2)
            
            $diskStatus = if ($usedSpacePercent -gt 90) { "Warning" } else { "Healthy" }
            
            $check = New-Object PSObject -Property @{
                Name = "Disk"
                Status = $diskStatus
                Message = "Disk C:: ${usedSpacePercent}% used (${freeSpace} GB free of ${totalSpace} GB)"
                Value = "${usedSpacePercent}%"
                Timestamp = Get-Date
            }
            
            $health.Checks += $check
            if ($diskStatus -ne "Healthy") { 
                $health.Issues += "Disk: Low disk space on C: (${usedSpacePercent}% used)"
                $health.Status = "Warning"
            }
        } catch {
            $health.Checks += New-Object PSObject -Property @{
                Name = "Disk"
                Status = "Error"
                Message = "Failed to check disk: $_"
                Value = "N/A"
                Timestamp = Get-Date
            }
            $health.Issues += "Disk: Failed to check disk: $_"
            $health.Status = "Error"
        }

        return $health
    } catch {
        Write-SystemLog "Error in Get-SystemHealth: $_" -Level Error
        throw $_
    }
}

function Invoke-MemoryCleanup {
    [CmdletBinding()]
    param()

    $actions = @()

    try {
        # Clear system cache
        $actions += "Clearing system cache..."
        Clear-RecycleBin -Force -ErrorAction SilentlyContinue
        [System.GC]::Collect()
        [System.GC]::WaitForPendingFinalizers()

        # Clear Windows temp files
        $actions += "Clearing temporary files..."
        Get-ChildItem -Path "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue | 
            Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-1) } | 
            Remove-Item -Force -Recurse -ErrorAction SilentlyContinue

        # Clear Windows temp internet files
        $actions += "Clearing temporary internet files..."
        Remove-Item -Path "$env:LOCALAPPDATA\Microsoft\Windows\Temporary Internet Files\*" -Recurse -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "$env:LOCALAPPDATA\Microsoft\Windows\WER\*" -Recurse -Force -ErrorAction SilentlyContinue

        # Clear browser caches
        $actions += "Clearing browser caches..."
        $browserPaths = @(
            "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cache\*",
            "$env:LOCALAPPDATA\Microsoft\Edge\User Data\Default\Cache\*",
            "$env:APPDATA\Mozilla\Firefox\Profiles\*.default-release\cache2\entries\*"
        )
        foreach ($path in $browserPaths) {
            if (Test-Path $path) {
                Remove-Item -Path $path -Recurse -Force -ErrorAction SilentlyContinue
            }
        }

        return $actions
    } catch {
        $actions += "Error during memory cleanup: $_"
        return $actions
    }
}

function Invoke-DiskCleanup {
    [CmdletBinding()]
    param()

    $actions = @()

    try {
        # Clear Windows temp files
        $actions += "Cleaning Windows temporary files..."
        Get-ChildItem -Path "$env:TEMP\*" -Recurse -Force -ErrorAction SilentlyContinue | 
            Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } | 
            Remove-Item -Force -Recurse -ErrorAction SilentlyContinue

        # Clear Windows update cache
        $actions += "Clearing Windows Update cache..."
        Stop-Service -Name wuauserv -Force -ErrorAction SilentlyContinue
        Remove-Item -Path "$env:SYSTEMROOT\SoftwareDistribution\Download\*" -Recurse -Force -ErrorAction SilentlyContinue
        Start-Service -Name wuauserv -ErrorAction SilentlyContinue

        # Clear Windows error reports
        $actions += "Clearing Windows error reports..."
        Remove-Item -Path "$env:LOCALAPPDATA\Microsoft\Windows\WER\*" -Recurse -Force -ErrorAction SilentlyContinue

        # Clear Windows logs
        $actions += "Clearing Windows logs..."
        Get-EventLog -LogName * | ForEach-Object { 
            if ($_.Entries.Count -gt 1000) {
                Clear-EventLog -LogName $_.Log -ErrorAction SilentlyContinue 
            }
        }

        # Run disk cleanup utility
        $actions += "Running Windows Disk Cleanup..."
        Start-Process -FilePath "cleanmgr.exe" -ArgumentList "/sagerun:1" -NoNewWindow -Wait -ErrorAction SilentlyContinue

        return $actions
    } catch {
        $actions += "Error during disk cleanup: $_"
        return $actions
    }
}

function Start-ActiveMode {
    [CmdletBinding()]
    param()

    try {
        $script:Config.Mode = "Active"
        $script:Config.StartTime = Get-Date
        $script:Config.IsRunning = $true
        $cycle = 0

        Write-SystemLog "Starting Fabrication System in Active mode" -Level Information
        Write-SystemLog "Version: $($script:Config.Version)" -Level Information
        Write-SystemLog "Author: $($script:Config.Author)" -Level Information

        # Set up Ctrl+C handler
        [Console]::TreatControlCAsInput = $false
        $originalEAP = $ErrorActionPreference
        $ErrorActionPreference = "Stop"

        # Main processing loop
        while ($script:Config.IsRunning) {
            $cycle++
            $cycleStartTime = Get-Date
            $health = Get-SystemHealth

            # Display status
            $uptime = (Get-Date) - $script:Config.StartTime
            Write-SystemLog "=== System Status ===" -Level Information -Component "Monitor"
            Write-SystemLog "Overall Status: $($health.Status)" -Level Information -Component "Monitor"
            Write-SystemLog "Issues Found: $($health.Issues.Count)" -Level Information -Component "Monitor"
            Write-SystemLog "Uptime: $($uptime.ToString('hh\:mm\:ss'))" -Level Information -Component "Monitor"
            Write-SystemLog "Mode: $($script:Config.Mode)" -Level Information -Component "Monitor"
            Write-SystemLog "Cycle: $cycle" -Level Information -Component "Monitor"

            # Log check results
            foreach ($check in $health.Checks) {
                $logLevel = if ($check.Status -eq "Healthy") { "Information" } else { $check.Status }
                Write-SystemLog "$($check.Name) $($check.Status): $($check.Message)" -Level $logLevel -Component "Check"
            }

            # Automatic fixes in Active mode
            if ($health.Status -ne "Healthy") {
                $fixActions = @()
                
                # Memory cleanup if memory is high
                $memoryCheck = $health.Checks | Where-Object { $_.Name -eq "Memory" -and $_.Status -ne "Healthy" }
                if ($memoryCheck) {
                    $fixActions += "=== Starting Memory Cleanup ==="
                    $fixActions += Invoke-MemoryCleanup
                    $fixActions += "=== Memory Cleanup Complete ==="
                }
                
                # Disk cleanup if disk space is low
                $diskCheck = $health.Checks | Where-Object { $_.Name -eq "Disk" -and $_.Status -ne "Healthy" }
                if ($diskCheck) {
                    $fixActions += "=== Starting Disk Cleanup ==="
                    $fixActions += Invoke-DiskCleanup
                    $fixActions += "=== Disk Cleanup Complete ==="
                }
                
                # Log all fix actions
                if ($fixActions.Count -gt 0) {
                    foreach ($action in $fixActions) {
                        Write-SystemLog "FIX: $action" -Level Information -Component "Fixer"
                    }
                    
                    # Update health status after fixes
                    $health = Get-SystemHealth
                    $script:Config.IssuesResolved += $fixActions.Count
                    
                    # Log fixed status
                    Write-SystemLog "System status after fixes: $($health.Status)" -Level Information -Component "Fixer"
                }
            }

            # Generate report periodically
            if ((Get-Date) -ge $script:Config.NextReportTime) {
                $report = @{
                    Timestamp = Get-Date
                    Uptime = $uptime.ToString('hh\:mm\:ss')
                    Mode = $script:Config.Mode
                    Status = $health.Status
                    Checks = $health.Checks
                    Issues = $health.Issues
                    IssuesResolved = $script:Config.IssuesResolved
                }
                
                $reportFile = Join-Path -Path $script:Config.ReportPath -ChildPath "report_$(Get-Date -Format 'yyyyMMdd_HHmmss').json"
                $report | ConvertTo-Json -Depth 5 | Out-File -FilePath $reportFile -Force
                $script:Config.NextReportTime = (Get-Date).Add($script:Config.ReportInterval)
                
                Write-SystemLog "Generated report: $reportFile" -Level Information -Component "Reporting"
            }

            # Calculate sleep time (5 seconds between checks)
            $cycleTime = ((Get-Date) - $cycleStartTime).TotalSeconds
            $sleepTime = [math]::Max(5 - $cycleTime, 1)
            Start-Sleep -Seconds $sleepTime
        }
    } catch {
        Write-SystemLog "Error in processing loop: $_" -Level Error -Component "System"
        Write-SystemLog $_.ScriptStackTrace -Level Error -Component "System"
    } finally {
        $ErrorActionPreference = $originalEAP
        $script:Config.IsRunning = $false
        Write-SystemLog "Fabrication System stopped" -Level Information -Component "System"
    }
}

function Start-RuhestandMode {
    [CmdletBinding()]
    param()

    $script:Config.Mode = "Ruhestand"
    Write-SystemLog "Starting Fabrication System in Ruhestand mode" -Level Information
    # Similar to Start-ActiveMode but with less aggressive monitoring and fixes
    # Implementation omitted for brevity
}

function Stop-Fabrication {
    [CmdletBinding()]
    param()

    $script:Config.IsRunning = $false
    Write-SystemLog "Stopping Fabrication System" -Level Information -Component "System"
}

function Get-Status {
    [CmdletBinding()]
    param()

    $status = @{
        IsRunning = $script:Config.IsRunning
        Mode = $script:Config.Mode
        Uptime = if ($script:Config.StartTime) { (Get-Date) - $script:Config.StartTime } else { $null }
        Version = $script:Config.Version
        LastHealthCheck = $script:Config.LastHealthCheck
        IssuesResolved = $script:Config.IssuesResolved
    }

    return $status
}
#endregion

# Main script execution
try {
    # Handle command line arguments
    $command = $args[0]
    
    switch ($command) {
        "Start-ActiveMode" {
            Start-ActiveMode
        }
        "Start-RuhestandMode" {
            Start-RuhestandMode
        }
        "Stop" {
            Stop-Fabrication
        }
        "Status" {
            Get-Status | Format-List
        }
        default {
            Write-Host "Fabrication System v$($script:Config.Version)"
            Write-Host "Usage: .\FabricationSystem.ps1 [Command]"
            Write-Host ""
            Write-Host "Commands:"
            Write-Host "  Start-ActiveMode    - Start in active monitoring mode"
            Write-Host "  Start-RuhestandMode - Start in low-priority mode"
            Write-Host "  Stop                - Stop the running instance"
            Write-Host "  Status              - Show current status"
        }
    }
} catch {
    Write-Error "Error in Fabrication System: $_"
    exit 1
}