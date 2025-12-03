# T,. OSOTOSOS - Performance Tests (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "Perf: index page under 300ms"

python scripts/test_perf.py

if ($LASTEXITCODE -ne 0) {
    exit 1
}

