# T,. OSOTOSOS - Security Tests (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "Security: developer mode off by default"

python scripts/test_security.py

if ($LASTEXITCODE -ne 0) {
    exit 1
}

