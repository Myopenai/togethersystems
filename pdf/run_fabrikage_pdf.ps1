param(
  [Parameter(Mandatory = $true)]
  [string]$Input,
  [Parameter(Mandatory = $true)]
  [string]$Output,
  [string]$Config = "config\fabrikage_pdf.config.json",
  [switch]$ForceInstallPython312
)

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }
function Write-Err ($msg) { Write-Host "[ERR ] $msg" -ForegroundColor Red }

# Resolve repo root (this script lives in tools/pdf)
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot  = Resolve-Path (Join-Path $ScriptDir "..\..")
Set-Location $RepoRoot

if (!(Test-Path $Input)) {
  Write-Err "Input file not found: $Input"
  exit 1
}

if (!(Test-Path $Config)) {
  Write-Warn "Config not found at '$Config'. Using default."
}

function Test-Python312 {
  try {
    & py -3.12 -c "import sys; print(sys.version)" | Out-Null
    return $true
  } catch {
    return $false
  }
}

if ($ForceInstallPython312 -or -not (Test-Python312)) {
  Write-Info "Python 3.12 not detected. Attempting install via winget..."
  try {
    winget install -e --id Python.Python.3.12 --accept-source-agreements --accept-package-agreements --silent | Out-Null
  } catch {
    Write-Err "winget install failed. Install Python 3.12 manually and re-run."
    exit 1
  }

  Start-Sleep -Seconds 3
  if (-not (Test-Python312)) {
    Write-Err "Python 3.12 still not available via 'py -3.12'."
    exit 1
  }
}

$VenvDir = Join-Path $RepoRoot ".venv312"
$PyExe   = Join-Path $VenvDir "Scripts\python.exe"

if (!(Test-Path $PyExe)) {
  Write-Info "Creating virtual environment at $VenvDir ..."
  & py -3.12 -m venv $VenvDir
}

Write-Info "Upgrading pip ..."
& $PyExe -m pip install -U pip

Write-Info "Installing requirements ..."
& $PyExe -m pip install --no-cache-dir -r "tools\pdf\requirements.txt"

Write-Info "Running Fabrikage PDF processor ..."
& $PyExe "tools\pdf\fabrikage_pdf.py" --input $Input --output $Output --config $Config

Write-Info "Done."


