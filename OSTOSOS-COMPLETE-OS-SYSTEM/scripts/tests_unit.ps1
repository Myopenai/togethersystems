# T,. OSOTOSOS - Unit Tests (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "Unit: core functions"

python scripts/test_unit.py

if ($LASTEXITCODE -ne 0) {
    exit 1
}

