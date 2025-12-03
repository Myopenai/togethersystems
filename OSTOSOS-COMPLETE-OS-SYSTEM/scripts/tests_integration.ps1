# T,. OSOTOSOS - Integration Tests (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "Integration: HTTP server responds"

python scripts/test_integration.py

if ($LASTEXITCODE -ne 0) {
    exit 1
}

