param(
  [Parameter(Mandatory = $false)]
  [string]$Manifest = "factory.manifest.yaml",

  [Parameter(Mandatory = $false)]
  [string[]]$Inputs = @()
)

$ErrorActionPreference = "Stop"
function W($m){ Write-Host "[A-Start] $m" -ForegroundColor Cyan }
function E($m){ Write-Host "[A-Start] $m" -ForegroundColor Red }

Set-Location (Split-Path -Parent $PSCommandPath) | Out-Null
Set-Location .. | Out-Null  # repo root

if (-not (Test-Path -LiteralPath $Manifest)) {
  E "Manifest not found: $Manifest"
  exit 1
}

# PowerShell 7+ has ConvertFrom-Yaml in Microsoft.PowerShell.Utility
$yamlRaw = Get-Content -LiteralPath $Manifest -Raw
$mf = $yamlRaw | ConvertFrom-Yaml

$files = @()
if ($Inputs -and $Inputs.Count -gt 0) {
  foreach($i in $Inputs){ if (Test-Path -LiteralPath $i) { $files += (Resolve-Path $i).Path } }
} else {
  foreach($inp in $mf.inputs){
    $pattern = $inp.pattern
    $roots = @($inp.search_roots)
    foreach($root in $roots){
      if (-not $root) { continue }
      try {
        $found = Get-ChildItem -Path $root -Filter $pattern -Recurse -ErrorAction SilentlyContinue |
                 Select-Object -ExpandProperty FullName
        if ($found){ $files += $found }
      } catch { }
    }
  }
}

if (-not $files -or $files.Count -eq 0) {
  E "No input files found."
  exit 2
}

$outDir = Join-Path (Get-Location) "factory\output"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$tool   = $mf.pipeline[0].tool
$config = $mf.pipeline[0].config
$sufOut = $mf.pipeline[0].output_suffix

$results = @()

foreach($f in $files){
  $out = [System.IO.Path]::ChangeExtension($f, $sufOut)
  W "Processing: $f"
  try {
    & pwsh -NoProfile -ExecutionPolicy Bypass -File $tool -InputPdf $f -OutputPdf $out -Config $config
    $ok = ($LASTEXITCODE -eq 0)
  } catch {
    $ok = $false
  }
  $results += [pscustomobject]@{
    input  = $f
    output = $out
    ok     = $ok
    time   = (Get-Date).ToString("s")
  }
}

$summary = [pscustomobject]@{
  meta = $mf.meta
  count = $results.Count
  ok    = ($results | Where-Object { $_.ok }).Count
  fail  = ($results | Where-Object { -not $_.ok }).Count
  items = $results
}

$json = $summary | ConvertTo-Json -Depth 6
$reportPath = Join-Path $outDir "a_start-report.json"
Set-Content -LiteralPath $reportPath -Value $json -Encoding UTF8

W "Done. Report: $reportPath"
if ($summary.fail -gt 0) { exit 3 } else { exit 0 }


