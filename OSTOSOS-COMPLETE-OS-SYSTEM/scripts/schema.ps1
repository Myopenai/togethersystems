# T,. OSOTOSOS - Schema Verification (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "Schema: config validation"

python scripts/test_schema.py

if ($LASTEXITCODE -ne 0) {
    exit 1
}

