param(
  [Parameter(Mandatory = $false)]
  [string]$Manifest = "factory.manifest.yaml"
)

$ErrorActionPreference = "Stop"
function Info($m){ Write-Host "[Standardroutine] $m" -ForegroundColor Cyan }
function Err ($m){ Write-Host "[Standardroutine] $m" -ForegroundColor Red }

# Repo-Root setzen
Set-Location (Split-Path -Parent $PSCommandPath)

# Gate I: Manifest lesbar
try {
  $yaml = Get-Content -LiteralPath $Manifest -Raw
  $mf = $yaml | ConvertFrom-Yaml
  $gateSchema = $true
} catch {
  $gateSchema = $false
  Err "Manifest konnte nicht gelesen/geparst werden: $Manifest"
}

# Pipeline ausführen (A-Start)
Info "Starte A-Start Pipeline …"
$aStartOk = $false
try {
  & pwsh -NoProfile -ExecutionPolicy Bypass -File "factory\a_start.ps1" -Manifest $Manifest
  $aStartOk = ($LASTEXITCODE -eq 0)
} catch { $aStartOk = $false }

# Report einlesen
$aStartReport = "factory\output\a_start-report.json"
if (-not (Test-Path -LiteralPath $aStartReport)) {
  Err "A-Start Report fehlt: $aStartReport"
  $aData = $null
} else {
  $aData = Get-Content -LiteralPath $aStartReport -Raw | ConvertFrom-Json
}

# Gate II/III/IV: Artefakte prüfen (Existenz, Größe, SHA-Konsistenz)
$items = @()
$okCount = 0; $failCount = 0
if ($aData -and $aData.items) {
  foreach($it in $aData.items){
    $out = $it.output
    $pdfOk = (Test-Path -LiteralPath $out)
    $sizeOk = $false
    $shaOk  = $false
    $repOk  = $false
    $repPath = [System.IO.Path]::ChangeExtension($out, ".report.json")
    if ($pdfOk){
      $len = (Get-Item -LiteralPath $out).Length
      $sizeOk = ($len -gt 0)
    }
    if (Test-Path -LiteralPath $repPath){
      try {
        $r = Get-Content -LiteralPath $repPath -Raw | ConvertFrom-Json
        $repOk = $true
        if ($pdfOk){
          $calc = (Get-FileHash -LiteralPath $out -Algorithm SHA256).Hash.ToLower()
          $shaReported = ($r.stamp.sha256 | ForEach-Object { $_.ToString().ToLower() })
          $shaOk = ($calc -eq $shaReported)
        }
      } catch { $repOk = $false }
    }
    $allOk = ($pdfOk -and $sizeOk -and $repOk -and $shaOk)
    if ($allOk) { $okCount++ } else { $failCount++ }
    $items += [pscustomobject]@{
      input = $it.input
      output = $out
      pdfExists = $pdfOk
      pdfSizeOk = $sizeOk
      reportOk  = $repOk
      shaOk     = $shaOk
      time      = (Get-Date).ToString("s")
    }
  }
}

$summary = [pscustomobject]@{
  meta = @{
    generator = "Fabrikage Standardroutine"
    timestamp = (Get-Date).ToString("s")
  }
  gates = @{
    schema_parse = $gateSchema
    execution_a_start = $aStartOk
    artifacts_exist = ($okCount -gt 0)
    artifacts_valid = ($failCount -eq 0 -and $okCount -gt 0)
  }
  results = @{
    ok = $okCount
    fail = $failCount
  }
  items = $items
}

New-Item -ItemType Directory -Force -Path "factory\output" | Out-Null
$outReport = "factory\output\standardroutine-tuv.json"
$summary | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $outReport -Encoding UTF8

if ($summary.gates.schema_parse -and $summary.gates.execution_a_start -and $summary.gates.artifacts_valid) {
  Info "TÜV-Gates OK. Report: $outReport"
  exit 0
} else {
  Err "TÜV-Gates FEHLER. Report: $outReport"
  exit 2
}


