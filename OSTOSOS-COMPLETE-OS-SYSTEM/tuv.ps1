# T,. OSOTOSOS - TÜV-Grade Verification Pipeline (PowerShell)
param(
    [Parameter(Position=0)]
    [string]$Action = "all"
)

$ErrorActionPreference = "Stop"
$APP = "OSOTOSOS"
$BUILDID = "b$(Get-Date -Format 'yyyyMMddHHmmss')"
$TS = (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ")
$ROOT = $PSScriptRoot

function Log {
    param([string]$Message)
    Write-Host "[$TS] $Message" -ForegroundColor Cyan
}

switch ($Action) {
    "all" {
        Log "=== TÜV-Grade Verification Pipeline ==="
        & $PSScriptRoot\tuv.ps1 preflight
        & $PSScriptRoot\tuv.ps1 tuv1
        & $PSScriptRoot\tuv.ps1 tests
        & $PSScriptRoot\tuv.ps1 tuv2
        & $PSScriptRoot\tuv.ps1 oberster
        & $PSScriptRoot\tuv.ps1 build_all
        & $PSScriptRoot\tuv.ps1 report
        Log "=== Pipeline Complete ==="
    }
    "preflight" {
        Log "Preflight: repo sanity, git status, required files"
        if (-not (Test-Path ".cursor-contract.md")) { Write-Host "Missing .cursor-contract.md" -ForegroundColor Red; exit 1 }
        if (-not (Test-Path "NAMING.md")) { Write-Host "Missing NAMING.md" -ForegroundColor Red; exit 1 }
        if (-not (Test-Path "osotosos.py")) { Write-Host "Missing osotosos.py" -ForegroundColor Red; exit 1 }
        New-Item -ItemType Directory -Force -Path "build", "logs", "artifacts", "scripts" | Out-Null
        Log "Preflight OK"
    }
    "tuv1" {
        Log "TÜV-I: contracts, lint, schema"
        & "$PSScriptRoot\scripts\contracts.ps1"
        if ($LASTEXITCODE -ne 0) { Log "TÜV-I FAILED: contracts"; exit 1 }
        & "$PSScriptRoot\scripts\lint.ps1"
        if ($LASTEXITCODE -ne 0) { Log "TÜV-I FAILED: lint"; exit 1 }
        & "$PSScriptRoot\scripts\schema.ps1"
        if ($LASTEXITCODE -ne 0) { Log "TÜV-I FAILED: schema"; exit 1 }
        Log "TÜV-I PASSED"
    }
    "tests" {
        Log "Tests: unit, integration, e2e, perf, accessibility, security"
        & "$PSScriptRoot\scripts\tests_unit.ps1"
        if ($LASTEXITCODE -ne 0) { Log "Tests FAILED: unit"; exit 1 }
        & "$PSScriptRoot\scripts\tests_integration.ps1"
        if ($LASTEXITCODE -ne 0) { Log "Tests FAILED: integration"; exit 1 }
        & "$PSScriptRoot\scripts\tests_e2e.ps1"
        if ($LASTEXITCODE -ne 0) { Log "Tests FAILED: e2e"; exit 1 }
        & "$PSScriptRoot\scripts\tests_perf.ps1"
        if ($LASTEXITCODE -ne 0) { Log "Tests FAILED: perf"; exit 1 }
        & "$PSScriptRoot\scripts\tests_accessibility.ps1"
        if ($LASTEXITCODE -ne 0) { Log "Tests FAILED: accessibility"; exit 1 }
        & "$PSScriptRoot\scripts\tests_security.ps1"
        if ($LASTEXITCODE -ne 0) { Log "Tests FAILED: security"; exit 1 }
        Log "All Tests PASSED"
    }
    "tuv2" {
        Log "TÜV-II: parity (localhost vs online), observability, compliance"
        & "$PSScriptRoot\scripts\parity.ps1"
        if ($LASTEXITCODE -ne 0) { Log "TÜV-II FAILED: parity"; exit 1 }
        & "$PSScriptRoot\scripts\observability.ps1"
        if ($LASTEXITCODE -ne 0) { Log "TÜV-II FAILED: observability"; exit 1 }
        & "$PSScriptRoot\scripts\compliance.ps1"
        if ($LASTEXITCODE -ne 0) { Log "TÜV-II FAILED: compliance"; exit 1 }
        Log "TÜV-II PASSED"
    }
    "oberster" {
        Log "Oberster Stein audit"
        python "$PSScriptRoot\OBERSTER-STEIN-SYSTEM.py" "$PSScriptRoot"
        if ($LASTEXITCODE -ne 0) { Log "Oberster Stein FAILED"; exit 1 }
        python "$PSScriptRoot\OBERSTER-STEIN-REPORT-GENERATOR.py"
        Log "Oberster Stein PASSED"
    }
    "build_all" {
        Log "Build: enumerating matrix and producing artifacts"
        & "$PSScriptRoot\scripts\build_matrix.ps1" $BUILDID $TS
        if ($LASTEXITCODE -ne 0) { Log "Build FAILED"; exit 1 }
        Log "Build Complete"
    }
    "report" {
        Log "Report: audit summary and hashes"
        & "$PSScriptRoot\scripts\report.ps1" $BUILDID $TS
        if ($LASTEXITCODE -ne 0) { Log "Report FAILED"; exit 1 }
        Log "Report Complete"
    }
    default {
        Write-Host "Usage: .\tuv.ps1 [all|preflight|tuv1|tests|tuv2|build_all|report]" -ForegroundColor Yellow
        exit 1
    }
}

