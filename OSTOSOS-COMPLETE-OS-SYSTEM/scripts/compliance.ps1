# T,. OSOTOSOS - Compliance Tests (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "Compliance: baseline pass (extend with ISO/CEPT/DSGVO)"

python scripts/test_compliance.py

if ($LASTEXITCODE -ne 0) {
    exit 1
}

