# Create or update the FabricationSystem.psm1 file
$moduleContent = @'
# Fabrication System Module
# Version 1.1.0
# Last Updated: 2025-12-13

# Define module variables
$script:ModuleVersion = "1.1.0"
$script:ModuleName = "FabricationSystem"
$script:ModuleRoot = $PSScriptRoot

# Import all .ps1 files in the module directory
$functionFolders = @('Public', 'Private', 'Classes')
foreach ($folder in $functionFolders) {
    $folderPath = Join-Path -Path $PSScriptRoot -ChildPath $folder
    if (Test-Path -Path $folderPath) {
        $functions = Get-ChildItem -Path $folderPath -Filter "*.ps1" -Recurse -ErrorAction SilentlyContinue
        foreach ($function in $functions) {
            try {
                . $function.FullName
                Write-Verbose "Imported function: $($function.BaseName)"
            } catch {
                Write-Error "Failed to import function $($function.FullName): $_"
            }
        }
    }
}

# If no functions were imported from subfolders, define them directly
if (-not (Get-Command -Name Start-FabricationSystem -ErrorAction SilentlyContinue)) {
    function Start-FabricationSystem {
        [CmdletBinding()]
        param(
            [ValidateSet('Active', 'Ruhestand')]
            [string]$Mode = 'Active'
        )

        Write-Host "Fabrication System started in $Mode mode at $(Get-Date)"
        # Add your implementation here
    }

    function Get-SystemStatus {
        [CmdletBinding()]
        param()

        try {
            $os = Get-WmiObject Win32_OperatingSystem
            $cpu = Get-WmiObject Win32_Processor | Measure-Object -Property LoadPercentage -Average | Select-Object -ExpandProperty Average
            $disk = Get-WmiObject Win32_LogicalDisk -Filter "DeviceID='C:'" | Select-Object Size, FreeSpace

            $status = @{
                Status = "Operational"
                Timestamp = Get-Date
                Mode = "Active"
                System = @{
                    OS = $os.Caption
                    Uptime = (Get-Date) - $os.ConvertToDateTime($os.LastBootUpTime)
                }
                CPU = @{
                    Load = $cpu
                    Status = if ($null -eq $cpu) { "Unknown" } elseif ($cpu -gt 90) { "High" } else { "Normal" }
                }
                Memory = @{
                    TotalGB = [math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
                    FreeGB = [math]::Round($os.FreePhysicalMemory / 1MB, 2)
                    UsedPercent = [math]::Round(($os.TotalVisibleMemorySize - $os.FreePhysicalMemory) / $os.TotalVisibleMemorySize * 100, 2)
                }
                Disk = @{
                    TotalGB = [math]::Round($disk.Size / 1GB, 2)
                    FreeGB = [math]::Round($disk.FreeSpace / 1GB, 2)
                    UsedPercent = [math]::Round(($disk.Size - $disk.FreeSpace) / $disk.Size * 100, 2)
                }
            }

            return $status
        } catch {
            Write-Error "Failed to get system status: $_"
            return @{
                Status = "Error"
                Message = $_.Exception.Message
                Timestamp = Get-Date
            }
        }
    }

    function Write-SystemLog {
        [CmdletBinding()]
        param(
            [Parameter(Mandatory=$true)]
            [string]$Message,
            
            [Parameter(Mandatory=$false)]
            [ValidateSet("Error", "Warning", "Information", "Verbose", "Debug")]
            [string]$Level = "Information",
            
            [Parameter(Mandatory=$false)]
            [string]$Component = "System"
        )

        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss.fff"
        $logMessage = "[$timestamp] [$Level] [$Component] $Message"
        
        # Ensure log directory exists
        $logDir = Join-Path -Path $script:ModuleRoot -ChildPath "Logs"
        if (-not (Test-Path -Path $logDir)) {
            New-Item -ItemType Directory -Path $logDir -Force | Out-Null
        }
        
        # Write to log file
        $logFile = Join-Path -Path $logDir -ChildPath "fabrication_$(Get-Date -Format 'yyyyMMdd').log"
        try {
            Add-Content -Path $logFile -Value $logMessage -ErrorAction Stop
        } catch {
            Write-Error "Failed to write to log file: $_"
        }
        
        # Write to console with color
        $originalColor = $host.UI.RawUI.ForegroundColor
        switch ($Level) {
            "Error" { $host.UI.RawUI.ForegroundColor = "Red" }
            "Warning" { $host.UI.RawUI.ForegroundColor = "Yellow" }
            "Information" { $host.UI.RawUI.ForegroundColor = "White" }
            "Debug" { $host.UI.RawUI.ForegroundColor = "Gray" }
            "Verbose" { $host.UI.RawUI.ForegroundColor = "Cyan" }
        }
        
        Write-Output $logMessage
        $host.UI.RawUI.ForegroundColor = $originalColor
    }

    # Export module members
    Export-ModuleMember -Function Start-FabricationSystem, Get-SystemStatus, Write-SystemLog
}

# Create the module manifest if it doesn't exist
$manifestPath = Join-Path -Path $PSScriptRoot -ChildPath "FabricationSystem.psd1"
if (-not (Test-Path -Path $manifestPath)) {
    New-ModuleManifest -Path $manifestPath `
        -RootModule "FabricationSystem.psm1" `
        -Author "Raymond Demitrio Tel" `
        -CompanyName "Fabrication Systems" `
        -ModuleVersion "1.1.0" `
        -Description "Fabrication System Module" `
        -PowerShellVersion "5.1" `
        -FunctionsToExport @('Start-FabricationSystem', 'Get-SystemStatus', 'Write-SystemLog') `
        -CmdletsToExport @() `
        -VariablesToExport @() `
        -AliasesToExport @()
}

# Create required directories if they don't exist
$requiredDirs = @("Logs", "Reports", "Issues", "Fixes", "Config")
foreach ($dir in $requiredDirs) {
    $dirPath = Join-Path -Path $PSScriptRoot -ChildPath $dir
    if (-not (Test-Path -Path $dirPath)) {
        New-Item -ItemType Directory -Path $dirPath -Force | Out-Null
    }
}
'@

# Save the module file
$modulePath = Join-Path -Path "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\FabricationSystem" -ChildPath "FabricationSystem.psm1"
$moduleContent | Out-File -FilePath $modulePath -Encoding utf8 -Force

# Create a test script to verify the module
$testScript = @'
# Test Fabrication System Module
Write-Host "Testing Fabrication System Module..." -ForegroundColor Cyan

# Import the module
$modulePath = Join-Path -Path $PSScriptRoot -ChildPath "FabricationSystem.psm1"
if (Test-Path $modulePath) {
    try {
        Import-Module $modulePath -Force -ErrorAction Stop
        Write-Host "Module imported successfully" -ForegroundColor Green
        
        # Test functions
        Write-Host "`nTesting Get-SystemStatus..." -ForegroundColor Cyan
        $status = Get-SystemStatus
        $status | Format-List *
        
        Write-Host "`nTesting Write-SystemLog..." -ForegroundColor Cyan
        Write-SystemLog -Message "This is a test message" -Level Information -Component "Test"
        Write-Host "Log entry written successfully" -ForegroundColor Green
        
        Write-Host "`nTesting Start-FabricationSystem..." -ForegroundColor Cyan
        Start-FabricationSystem -Mode Active
        
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
        Write-Host $_.ScriptStackTrace -ForegroundColor DarkRed
    }
} else {
    Write-Host "Module file not found at: $modulePath" -ForegroundColor Red
}
'@

# Save the test script
$testScriptPath = Join-Path -Path "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\FabricationSystem" -ChildPath "Test-Module.ps1"
$testScript | Out-File -FilePath $testScriptPath -Encoding utf8 -Force

Write-Host "Fabrication System module has been updated and test script created." -ForegroundColor Green
Write-Host "Test the module by running: .\Test-Module.ps1" -ForegroundColor Yellow