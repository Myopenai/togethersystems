# T,. OSOTOSOS - Accessibility Tests (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "Accessibility: basic elements present"

python scripts/test_accessibility.py

if ($LASTEXITCODE -ne 0) {
    exit 1
}

