# T,. OSOTOSOS - E2E Tests (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "E2E: status API delivers 12 areas"

python scripts/test_e2e.py

if ($LASTEXITCODE -ne 0) {
    exit 1
}

