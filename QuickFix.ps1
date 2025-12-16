<#
.SYNOPSIS
    Fabrication System Quick Fix
.DESCRIPTION
    A simple script to check and fix the Fabrication System
#>

# Configuration
$rootPath = "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\FabricationSystem"
$logFile = Join-Path -Path $rootPath -ChildPath "FabricationFix_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# Start logging
Start-Transcript -Path $logFile -Force
Write-Host "=== Fabrication System Quick Fix ===" -ForegroundColor Cyan
Write-Host "Started at: $(Get-Date)" -ForegroundColor Cyan
Write-Host "Root path: $rootPath" -ForegroundColor Cyan

# Function to write status
function Write-Status {
    param($Message, $Color = "White")
    $timestamp = Get-Date -Format "HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

# 1. Check if the module exists
$modulePath = Join-Path -Path $rootPath -ChildPath "FabricationSystem.psm1"
if (-not (Test-Path -Path $modulePath)) {
    Write-Status "Error: FabricationSystem module not found at $modulePath" "Red"
    exit 1
}

# 2. Import the module
try {
    Import-Module $modulePath -Force -ErrorAction Stop
    Write-Status "Successfully imported FabricationSystem module" "Green"
} catch {
    Write-Status "Failed to import module: $_" "Red"
    exit 1
}

# 3. Check system status
try {
    Write-Status "Checking system status..." "Cyan"
    $status = Get-SystemStatus -ErrorAction Stop
    $status | Format-List *
} catch {
    Write-Status "Failed to get system status: $_" "Red"
}

# 4. Start the system in Active mode
try {
    Write-Status "Starting Fabrication System in Active mode..." "Cyan"
    Start-FabricationSystem -Mode Active -ErrorAction Stop
} catch {
    Write-Status "Failed to start Fabrication System: $_" "Red"
}

# 5. Show completion message
Write-Host "`n=== Fix Complete ===" -ForegroundColor Cyan
Write-Host "Log file: $logFile" -ForegroundColor White
Write-Host "The system should now be running in Active mode." -ForegroundColor Green

Stop-Transcript