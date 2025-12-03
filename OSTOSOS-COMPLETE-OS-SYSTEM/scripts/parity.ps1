# T,. OSOTOSOS - Parity Tests (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "Parity: localhost vs simulated online"

python scripts/test_parity.py

if ($LASTEXITCODE -ne 0) {
    exit 1
}

