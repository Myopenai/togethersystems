# T,. OSOTOSOS - Observability Tests (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "Observability: logs and audit export"

python scripts/test_observability.py

if ($LASTEXITCODE -ne 0) {
    exit 1
}

