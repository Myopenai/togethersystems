param(
  [Parameter(Mandatory = $true)]
  [string]$InputPdf,

  [Parameter(Mandatory = $false)]
  [string]$OutputPdf,

  [Parameter(Mandatory = $false)]
  [string]$Config = "config\fabrikage_pdf.config.json"
)

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host "[Fabrikage] $msg" -ForegroundColor Cyan }
function Write-Err($msg)  { Write-Host "[Fabrikage] $msg" -ForegroundColor Red }

if (-not (Test-Path -LiteralPath $InputPdf)) {
  Write-Err "Input PDF not found: $InputPdf"
  exit 1
}

if (-not $OutputPdf -or [string]::IsNullOrWhiteSpace($OutputPdf)) {
  $OutputPdf = [System.IO.Path]::ChangeExtension($InputPdf, ".FABRIKAGE.pdf")
}

# Resolve repo root from this script location (tools\pdf\run_fabrikage.ps1 → repo root is two levels up)
$repoRoot = (Get-Item $PSCommandPath).Directory.Parent.Parent.FullName
Set-Location $repoRoot

if (-not (Test-Path -LiteralPath $Config)) {
  Write-Err "Config not found: $Config (cwd: $repoRoot)"
  exit 1
}

Write-Info "Checking Python 3.12 via py launcher..."
$pyOk = $false
try {
  & py -3.12 -c "import sys; print(sys.version)" | Out-Null
  if ($LASTEXITCODE -eq 0) { $pyOk = $true }
} catch { $pyOk = $false }

if (-not $pyOk) {
  Write-Info "Python 3.12 not found. Trying to install with winget (silent)..."
  try {
    & winget install -e --id Python.Python.3.12 --accept-source-agreements --accept-package-agreements --silent
    Start-Sleep -Seconds 5
    & py -3.12 -c "import sys; print(sys.version)" | Out-Null
    if ($LASTEXITCODE -ne 0) {
      Write-Err "Python 3.12 still not available after installation. Please ensure winget ran elevated and retry."
      exit 1
    }
    Write-Info "Python 3.12 installed."
  } catch {
    Write-Err "winget install failed. Install Python 3.12 manually, then re-run this script."
    exit 1
  }
}

$venvDir = Join-Path $repoRoot ".venv312"
if (-not (Test-Path -LiteralPath $venvDir)) {
  Write-Info "Creating virtual environment: $venvDir"
  & py -3.12 -m venv $venvDir
}

$pyExe = Join-Path $venvDir "Scripts\python.exe"
if (-not (Test-Path -LiteralPath $pyExe)) {
  Write-Err "Virtual environment Python not found: $pyExe"
  exit 1
}

Write-Info "Upgrading pip..."
& $pyExe -m pip install -U pip --disable-pip-version-check

Write-Info "Installing requirements (tools\pdf\requirements.txt)..."
& $pyExe -m pip install --no-cache-dir -r "tools\pdf\requirements.txt"

Write-Info "Running PDF processor..."
& $pyExe "tools\pdf\fabrikage_pdf.py" --input $InputPdf --output $OutputPdf --config $Config

if ($LASTEXITCODE -eq 0) {
  $report = [System.IO.Path]::ChangeExtension($OutputPdf, ".report.json")
  Write-Host ""
  Write-Info "DONE"
  Write-Info "Output PDF : $OutputPdf"
  Write-Info "Report JSON: $report"
  exit 0
} else {
  Write-Err "Processing failed."
  exit 1
}


