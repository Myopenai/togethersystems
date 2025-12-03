# T,. Global Industrial TÜV - One-Click Setup (PowerShell)
# Version: 1.0.0
# Signatur: T,.&T,,.&T,,,.T.

$ErrorActionPreference = "Stop"

function Write-Timestamp {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    Write-Host "[$timestamp] $Message" -ForegroundColor Cyan
}

# Get script directory
$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $SCRIPT_DIR

Write-Timestamp "=== Global Industrial TÜV - One-Click Setup ==="
Write-Host ""

# Check Python 3
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    $python = Get-Command python3 -ErrorAction SilentlyContinue
}

if (-not $python) {
    Write-Host "ERROR: Python not found. Please install Python 3.8+" -ForegroundColor Red
    exit 1
}

$pythonVersion = & $python.Name --version 2>&1
Write-Timestamp "Found Python: $pythonVersion"

# Ensure logs directory exists
New-Item -ItemType Directory -Force -Path "logs" | Out-Null

Write-Host ""
Write-Timestamp "=== Starting Portal and Dashboard ==="

# Kill existing processes on ports 9080 and 9081
$existing = Get-NetTCPConnection -LocalPort 9080,9081 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($existing) {
    $existing | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 1
}

# Start portal server in background
$portalJob = Start-Job -ScriptBlock {
    Set-Location $using:SCRIPT_DIR
    & python portal/server.py 2>&1 | Tee-Object -FilePath "logs/portal.log"
} -Name "GlobalTUEV-Portal"

Write-Timestamp "Portal started (Job: $($portalJob.Id)) on http://127.0.0.1:9080"

# Wait for server to start
Start-Sleep -Seconds 3

# Start dashboard in background
$dashboardJob = Start-Job -ScriptBlock {
    Set-Location $using:SCRIPT_DIR
    & python portal/dashboard.py 2>&1 | Tee-Object -FilePath "logs/dashboard.log"
} -Name "GlobalTUEV-Dashboard"

Write-Timestamp "Dashboard started (Job: $($dashboardJob.Id)) on http://127.0.0.1:9081"

# Wait for dashboard to start
Start-Sleep -Seconds 3

Write-Host ""
Write-Timestamp "=== Running Verification Pipeline ==="

# Run verification on example manifest
if (Test-Path "artifacts/example_update_manifest.json") {
    Get-Content "artifacts/example_update_manifest.json" | & python scripts/verify_pipeline.py
    Write-Timestamp "Verification completed"
} else {
    Write-Host "WARNING: example_update_manifest.json not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Timestamp "=== Submitting Example Manifest ==="

# Submit example manifest to portal
if (Test-Path "artifacts/example_update_manifest.json") {
    try {
        $manifest = Get-Content "artifacts/example_update_manifest.json" -Raw
        $response = Invoke-RestMethod -Uri "http://127.0.0.1:9080/api/updates/submit" `
            -Method Post `
            -ContentType "application/json" `
            -Body $manifest `
            -ErrorAction SilentlyContinue
        Write-Timestamp "Example manifest submitted successfully"
    } catch {
        Write-Host "WARNING: Failed to submit manifest (portal may still be starting)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Timestamp "=== Setup Complete ==="
Write-Host ""
Write-Host "Portal:    http://127.0.0.1:9080" -ForegroundColor Green
Write-Host "Dashboard: http://127.0.0.1:9081" -ForegroundColor Green
Write-Host ""
Write-Host "API Endpoints:" -ForegroundColor Cyan
Write-Host "  GET  http://127.0.0.1:9080/api/updates"
Write-Host "  POST http://127.0.0.1:9080/api/updates/submit"
Write-Host "  GET  http://127.0.0.1:9080/api/devices"
Write-Host "  POST http://127.0.0.1:9080/api/devices/register"
Write-Host "  GET  http://127.0.0.1:9080/api/stats"
Write-Host ""
Write-Host "Logs:" -ForegroundColor Cyan
Write-Host "  Portal:    logs/portal.log"
Write-Host "  Dashboard: logs/dashboard.log"
Write-Host ""
Write-Host "To stop servers:" -ForegroundColor Yellow
Write-Host "  Stop-Job -Id $($portalJob.Id),$($dashboardJob.Id); Remove-Job -Id $($portalJob.Id),$($dashboardJob.Id)"
Write-Host ""
Write-Host "Press Ctrl+C to stop servers and exit" -ForegroundColor Yellow

# Keep script running and show job status
try {
    while ($true) {
        Start-Sleep -Seconds 5
        $portalStatus = Get-Job -Id $portalJob.Id | Select-Object -ExpandProperty State
        $dashboardStatus = Get-Job -Id $dashboardJob.Id | Select-Object -ExpandProperty State
        
        if ($portalStatus -eq "Failed" -or $dashboardStatus -eq "Failed") {
            Write-Host "ERROR: One or more servers failed. Check logs." -ForegroundColor Red
            break
        }
    }
} finally {
    Write-Host ""
    Write-Timestamp "Shutting down..."
    Stop-Job -Id $portalJob.Id,$dashboardJob.Id -ErrorAction SilentlyContinue
    Remove-Job -Id $portalJob.Id,$dashboardJob.Id -ErrorAction SilentlyContinue
}

