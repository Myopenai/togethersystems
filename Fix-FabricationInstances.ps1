<#
.SYNOPSIS
    Fabrication System Multi-Instance Manager
.DESCRIPTION
    Scans and fixes multiple instances of Fabrication System across the specified directory.
    Handles errors gracefully and provides detailed logging.
.NOTES
    Author: Raymond Demitrio Tel
    Version: 1.1.0
#>

# Configuration
$rootPath = "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)"
$logFile = Join-Path -Path $rootPath -ChildPath "FabricationFixer_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# Start logging
Start-Transcript -Path $logFile -Force
Write-Output "Fabrication System Fixer started at $(Get-Date)"
Write-Output "Root path: $rootPath"

function Write-Status {
    param(
        [string]$Message,
        [string]$Status = "INFO"
    )

    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $statusMap = @{
        "INFO" = @{ Color = "White"; Prefix = "[INFO] " }
        "SUCCESS" = @{ Color = "Green"; Prefix = "[OK] " }
        "WARNING" = @{ Color = "Yellow"; Prefix = "[WARN] " }
        "ERROR" = @{ Color = "Red"; Prefix = "[ERROR] " }
    }

    $statusInfo = $statusMap[$Status]
    if (-not $statusInfo) { $statusInfo = $statusMap["INFO"] }

    $logMessage = "$timestamp $($statusInfo.Prefix)$Message"
    
    # Write to console with color
    $originalColor = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $statusInfo.Color
    Write-Output $logMessage
    $host.UI.RawUI.ForegroundColor = $originalColor
    
    # Also write to transcript
    Write-Output $logMessage
}

# Function to safely get child items with error handling
function SafeGet-ChildItem {
    param(
        [string]$Path,
        [string]$Filter = "*"
    )
    
    try {
        Get-ChildItem -Path $Path -Filter $Filter -ErrorAction Stop
    }
    catch [System.UnauthorizedAccessException] {
        Write-Status "Access denied when accessing: $Path" "WARNING"
    }
    catch [System.IO.DirectoryNotFoundException] {
        Write-Status "Directory not found: $Path" "WARNING"
    }
    catch {
        Write-Status "Error accessing $Path : $_" "WARNING"
    }
    return @()
}

# Function to initialize a new Fabrication System instance
function Initialize-FabricationSystem {
    param(
        [string]$Path
    )

    try {
        Write-Status "Initializing new Fabrication System at: $Path" "INFO"
        
        # Create the directory if it doesn't exist
        if (-not (Test-Path -Path $Path)) {
            $null = New-Item -ItemType Directory -Path $Path -Force
            Write-Status "Created directory: $Path" "SUCCESS"
        }

        # Create required files
        $files = @{
            "FabricationSystem.ps1" = @"
# Fabrication System Main Script
# Version 1.0.0
# Auto-generated on $(Get-Date)

# Import the module
`$modulePath = Join-Path -Path `$PSScriptRoot -ChildPath "FabricationSystem.psm1"
if (Test-Path `$modulePath) {
    Import-Module `$modulePath -Force
    Start-FabricationSystem -Mode Active
} else {
    Write-Error "Fabrication System module not found at: `$modulePath"
    exit 1
}
"@

            "FabricationSystem.psm1" = @"
# Fabrication System Module
# Version 1.0.0
# Auto-generated on $(Get-Date)

function Start-FabricationSystem {
    [CmdletBinding()]
    param(
        [ValidateSet('Active', 'Ruhestand')]
        [string]`$Mode = 'Active'
    )

    Write-Host "Fabrication System started in `$Mode mode at $(Get-Date)"
    # Add your implementation here
}

function Get-SystemStatus {
    [CmdletBinding()]
    param()

    return @{
        Status = "Operational"
        Timestamp = Get-Date
        Mode = "Active"
    }
}

function Write-SystemLog {
    [CmdletBinding()]
    param(
        [string]`$Message,
        [ValidateSet("Error", "Warning", "Information", "Verbose", "Debug")]
        [string]`$Level = "Information",
        [string]`$Component = "System"
    )

    `$logMessage = "[`$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [`$Level] [`$Component] `$Message"
    Write-Output `$logMessage
}

Export-ModuleMember -Function Start-FabricationSystem, Get-SystemStatus, Write-SystemLog
"@

            "FabricationSystem.psd1" = @"
@{
    ModuleVersion = '1.0.0'
    GUID = '$(New-Guid)'
    Author = 'Raymond Demitrio Tel'
    CompanyName = 'Fabrication Systems'
    Copyright = 'Copyright (c) 2025'
    Description = 'Fabrication System Module'
    PowerShellVersion = '5.1'
    FunctionsToExport = @('Start-FabricationSystem', 'Get-SystemStatus', 'Write-SystemLog')
    CmdletsToExport = @()
    VariablesToExport = @()
    AliasesToExport = @()
    PrivateData = @{
        PSData = @{
            Tags = @('Fabrication', 'System', 'Maintenance')
            LicenseUri = ''
            ProjectUri = ''
            ReleaseNotes = ''
        }
    }
}
"@
        }

        # Create required directories
        $directories = @("Logs", "Reports", "Issues", "Fixes", "Config")
        foreach ($dir in $directories) {
            $dirPath = Join-Path -Path $Path -ChildPath $dir
            if (-not (Test-Path -Path $dirPath)) {
                $null = New-Item -ItemType Directory -Path $dirPath -Force
                Write-Status "Created directory: $dirPath" "SUCCESS"
            }
        }

        # Create files
        foreach ($file in $files.GetEnumerator()) {
            $filePath = Join-Path -Path $Path -ChildPath $file.Key
            if (-not (Test-Path -Path $filePath)) {
                $file.Value | Out-File -FilePath $filePath -Encoding utf8
                Write-Status "Created file: $filePath" "SUCCESS"
            }
        }

        # Create a basic config file
        $configPath = Join-Path -Path $Path -ChildPath "Config\config.json"
        if (-not (Test-Path -Path $configPath)) {
            @{
                Version = "1.0.0"
                Author = "Raymond Demitrio Tel"
                LastUpdated = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
                Settings = @{
                    LogLevel = "Information"
                    ReportInterval = 300
                    MaxLogFiles = 30
                    AutoFix = $true
                }
            } | ConvertTo-Json -Depth 3 | Out-File -FilePath $configPath -Encoding utf8
            Write-Status "Created configuration file: $configPath" "SUCCESS"
        }

        return $true
    }
    catch {
        Write-Status "Error initializing Fabrication System at $Path : $_" "ERROR"
        return $false
    }
}

# Main execution
try {
    Write-Status "Starting Fabrication System Multi-Instance Manager" "INFO"
    Write-Status "Root directory: $rootPath" "INFO"

    # Check if root directory exists
    if (-not (Test-Path -Path $rootPath)) {
        Write-Status "Root directory does not exist: $rootPath" "ERROR"
        exit 1
    }

    # Find all Fabrication System instances
    $instances = @()
    
    # Look for module files
    $moduleFiles = SafeGet-ChildItem -Path $rootPath -Filter "FabricationSystem.ps*" -Recurse
    
    foreach ($file in $moduleFiles) {
        $instancePath = $file.Directory.FullName
        if ($instances -notcontains $instancePath) {
            $instances += $instancePath
        }
    }

    # If no instances found, initialize one in the root
    if ($instances.Count -eq 0) {
        Write-Status "No Fabrication System instances found. Initializing new instance in root directory." "WARNING"
        $initializeResult = Initialize-FabricationSystem -Path (Join-Path -Path $rootPath -ChildPath "FabricationSystem")
        if ($initializeResult) {
            $instances += (Join-Path -Path $rootPath -ChildPath "FabricationSystem")
            Write-Status "Successfully initialized new Fabrication System instance" "SUCCESS"
        } else {
            Write-Status "Failed to initialize new Fabrication System instance" "ERROR"
        }
    }

    # Process each found instance
    foreach ($instancePath in $instances) {
        Write-Status "`nProcessing instance: $instancePath" "INFO"
        
        # Check if instance is valid
        $isValid = $true
        $missingFiles = @()
        
        # Check for required files
        $requiredFiles = @("FabricationSystem.ps1", "FabricationSystem.psm1", "FabricationSystem.psd1")
        foreach ($file in $requiredFiles) {
            $filePath = Join-Path -Path $instancePath -ChildPath $file
            if (-not (Test-Path -Path $filePath)) {
                $isValid = $false
                $missingFiles += $file
            }
        }
        
        if (-not $isValid) {
            Write-Status "Instance is incomplete. Missing files: $($missingFiles -join ', ')" "WARNING"
            $initializeResult = Initialize-FabricationSystem -Path $instancePath
            if ($initializeResult) {
                Write-Status "Successfully repaired instance" "SUCCESS"
            } else {
                Write-Status "Failed to repair instance" "ERROR"
                continue
            }
        } else {
            Write-Status "Instance is valid" "SUCCESS"
        }
        
        # Check and create required directories
        $requiredDirs = @("Logs", "Reports", "Issues", "Fixes", "Config")
        foreach ($dir in $requiredDirs) {
            $dirPath = Join-Path -Path $instancePath -ChildPath $dir
            if (-not (Test-Path -Path $dirPath)) {
                $null = New-Item -ItemType Directory -Path $dirPath -Force
                Write-Status "Created directory: $dirPath" "SUCCESS"
            }
        }
        
        # Verify module can be imported
        try {
            $modulePath = Join-Path -Path $instancePath -ChildPath "FabricationSystem.psm1"
            Import-Module $modulePath -Force -ErrorAction Stop
            Write-Status "Successfully imported module" "SUCCESS"
            
            # Test basic functionality
            try {
                $status = Get-SystemStatus -ErrorAction Stop
                Write-Status "System status: $($status.Status)" "INFO"
            } catch {
                Write-Status "Warning: Could not get system status: $_" "WARNING"
            }
            
            Remove-Module -Name (Get-Item $modulePath).BaseName -Force -ErrorAction SilentlyContinue
        } catch {
            Write-Status "Error importing module: $_" "ERROR"
            Write-Status "Attempting to repair module..." "WARNING"
            
            # Try to repair the module
            $repairResult = Initialize-FabricationSystem -Path $instancePath
            if ($repairResult) {
                Write-Status "Successfully repaired module" "SUCCESS"
            } else {
                Write-Status "Failed to repair module" "ERROR"
            }
        }
    }

    Write-Status "`nProcessing complete. Found and processed $($instances.Count) instance(s)." "SUCCESS"
}
catch {
    Write-Status "Fatal error: $_" "ERROR"
    Write-Status $_.ScriptStackTrace "ERROR"
    exit 1
}
finally {
    # Clean up
    Write-Status "Fabrication System Fixer completed at $(Get-Date)" "INFO"
    Stop-Transcript
}