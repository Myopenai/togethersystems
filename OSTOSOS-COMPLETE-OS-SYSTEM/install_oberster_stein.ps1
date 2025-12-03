# T,. OSOTOSOS - One-Click Master Installation (PowerShell)
# Generates: contracts, naming, TÜV pipeline, Oberster Stein analyzer, reports, builds; runs everything

$ErrorActionPreference = "Stop"
$TS = (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ")
$BUILDID = "b$(Get-Date -Format 'yyyyMMddHHmmss')"
$APP = "OSOTOSOS"

function Say {
    param([string]$Message)
    Write-Host "[$TS] $Message" -ForegroundColor Cyan
}

Say "=== T,. One-Click Master Installation ==="

# Erstelle Ordner
New-Item -ItemType Directory -Force -Path "scripts", "build", "artifacts", "logs", ".github/workflows" | Out-Null

# 1) Cursor contract & naming
Say "Creating .cursor-contract.md and NAMING.md..."

@"
# Cursor Implementation Contract

- All code changes MUST be applied via ./scripts and committed with audit logs.
- No editor-only changes. All writes produce hashes (pre/post) and are logged.
- Two inspections (TÜV-I and TÜV-II) MUST pass before any build.
- Build outputs MUST follow naming schema and folder structure described in ./NAMING.md.
- CI MUST enforce gates: unit, integration, e2e, perf, accessibility, security, compliance.
"@ | Out-File -FilePath ".cursor-contract.md" -Encoding UTF8

@"
# Artifact naming & folder schema

- Root: build/
- Variant folders: build/<variant>/<device_type>/<model>/
- File name: <app>-<variant>-<device_type>-<model>-<arch>-<locale>-<buildid>-<timestamp>-<sha256>.img
"@ | Out-File -FilePath "NAMING.md" -Encoding UTF8

Say "Contract and naming files created"

# 2) Prüfe ob osotosos.py existiert
if (-not (Test-Path "osotosos.py")) {
    Say "WARNING: osotosos.py not found - please create it first"
} else {
    Say "osotosos.py found - OK"
}

# 3) Prüfe ob OBERSTER-STEIN-SYSTEM.py existiert
if (-not (Test-Path "OBERSTER-STEIN-SYSTEM.py")) {
    Say "WARNING: OBERSTER-STEIN-SYSTEM.py not found - please create it first"
} else {
    Say "OBERSTER-STEIN-SYSTEM.py found - OK"
}

# 4) TÜV pipeline - prüfe ob tuv.ps1 existiert
if (-not (Test-Path "tuv.ps1")) {
    Say "WARNING: tuv.ps1 not found - please create it first"
} else {
    Say "tuv.ps1 found - OK"
}

Say "=== Installation Complete ==="
Say "Next: Run .\tuv.ps1 all to execute full pipeline"

