# T,. OSOTOSOS - Contracts Verification (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "Contracts: verifying core presence"

if (-not (Test-Path "osotosos.py")) {
    Write-Host "Missing osotosos.py" -ForegroundColor Red
    exit 1
}

$content = Get-Content "osotosos.py" -Raw -Encoding UTF8
if ($content -notmatch "OSOTOSOS") {
    Write-Host "Missing app core" -ForegroundColor Red
    exit 1
}

Write-Host "Contracts OK" -ForegroundColor Green

