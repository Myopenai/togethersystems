# Fabrication System Installer
# Version: 1.0.0

# Import the module
$modulePath = Join-Path $PSScriptRoot "FabricationSystem.psm1"
Import-Module $modulePath -Force -ErrorAction Stop

# Check for admin rights
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "This script requires administrative privileges. Please run as Administrator." -ForegroundColor Red
    exit 1
}

# Install the system
Write-Host "Installing Fabrication System..." -ForegroundColor Cyan

# Install required Windows features
$features = @("IIS-WebServerRole", "IIS-WebServer", "IIS-WebServerManagementTools")
foreach ($feature in $features) {
    if (-not (Get-WindowsFeature -Name $feature).Installed) {
        Write-Host "Installing Windows feature: $feature" -ForegroundColor Yellow
        Install-WindowsFeature -Name $feature -IncludeManagementTools
    }
}

# Install the module for all users
$moduleDestination = "$env:ProgramFiles\WindowsPowerShell\Modules\FabricationSystem"
if (-not (Test-Path $moduleDestination)) {
    New-Item -ItemType Directory -Path $moduleDestination -Force | Out-Null
}

# Copy module files
Copy-Item -Path "$PSScriptRoot\FabricationSystem.psm1" -Destination $moduleDestination -Force

# Create scheduled tasks for both modes
$actionActive = New-ScheduledTaskAction -Execute 'PowerShell.exe' -Argument '-NoProfile -ExecutionPolicy Bypass -Command "& {Import-Module FabricationSystem; Start-FabricationActiveMode}"'
$triggerActive = New-ScheduledTaskTrigger -AtStartup
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -DontStopOnIdleEnd -RunOnlyIfNetworkAvailable

# Register scheduled tasks
Register-ScheduledTask -TaskName "FabricationSystem-Active" -Action $actionActive -Trigger $triggerActive -Principal $principal -Settings $settings -Description "Runs Fabrication System in Active Mode" -Force
Register-ScheduledTask -TaskName "FabricationSystem-Ruhestand" -Action $actionActive -Trigger $triggerActive -Principal $principal -Settings $settings -Description "Runs Fabrication System in Ruhestand Mode" -Force

# Create desktop shortcuts
$wshShell = New-Object -ComObject WScript.Shell
$shortcut = $wshShell.CreateShortcut("$env:USERPROFILE\Desktop\Fabrication System Active.lnk")
$shortcut.TargetPath = "powershell.exe"
$shortcut.Arguments = "-NoExit -Command `"& {Import-Module FabricationSystem; Start-FabricationActiveMode}`""
$shortcut.IconLocation = "powershell.exe,1"
$shortcut.Description = "Start Fabrication System in Active Mode"
$shortcut.Save()

$shortcut = $wshShell.CreateShortcut("$env:USERPROFILE\Desktop\Fabrication System Ruhestand.lnk")
$shortcut.TargetPath = "powershell.exe"
$shortcut.Arguments = "-NoExit -Command `"& {Import-Module FabricationSystem; Start-FabricationRuhestandMode}`""
$shortcut.IconLocation = "powershell.exe,1"
$shortcut.Description = "Start Fabrication System in Ruhestand Mode"
$shortcut.Save()

# Start the service
Write-Host "Starting Fabrication System in Active Mode..." -ForegroundColor Green
Start-ScheduledTask -TaskName "FabricationSystem-Active"

Write-Host "`nInstallation completed successfully!" -ForegroundColor Green
Write-Host "Shortcuts have been created on your desktop." -ForegroundColor Green
Write-Host "The system is now running in Active Mode." -ForegroundColor Green
