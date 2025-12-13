# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    # Relaunch as administrator
    $arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$($MyInvocation.MyCommand.Path)`""
    Start-Process powershell -Verb RunAs -ArgumentList $arguments
    exit
}

# Change to the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Start the services
Write-Host "Starting Fabrikage services with administrator privileges..."
Start-Process -FilePath "cmd.exe" -ArgumentList "/c teaching.bat start" -NoNewWindow -Wait

# Show status
Write-Host "`nService Status:"
Start-Process -FilePath "cmd.exe" -ArgumentList "/c teaching.bat status" -NoNewWindow -Wait

# Keep the window open
Write-Host "`nPress any key to stop services and exit..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')

# Stop services when done
Write-Host "`nStopping services..."
Start-Process -FilePath "cmd.exe" -ArgumentList "/c teaching.bat stop" -NoNewWindow -Wait

Write-Host "Services stopped. Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
