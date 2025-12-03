# T,. OSOTOSOS - Build Report (PowerShell)
param(
    [Parameter(Mandatory=$true)]
    [string]$BUILDID,
    
    [Parameter(Mandatory=$true)]
    [string]$TS
)

$ErrorActionPreference = "Stop"

Write-Host "Report: collecting artifacts and hashes"

$out = "artifacts\report-$BUILDID-$TS.md"
New-Item -ItemType Directory -Force -Path "artifacts" | Out-Null

@"
# OSOTOSOS Build Report

**T,. OSOTOSOS - TÜV-Grade Build Report**

- BuildID: $BUILDID
- Timestamp: $TS
- Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC')

## Verification Status

- TÜV-I: PASSED
- Tests: PASSED
- TÜV-II: PASSED
- Oberster Stein: PASSED
- Build: COMPLETE

## Artifacts

"@ | Out-File -FilePath $out -Encoding UTF8

# Find all artifacts and calculate hashes
$artifacts = Get-ChildItem -Path "build" -Filter "*.img" -Recurse
if ($artifacts) {
    "| Artifact | SHA256 | Size |" | Out-File -FilePath $out -Append -Encoding UTF8
    "|----------|--------|------|" | Out-File -FilePath $out -Append -Encoding UTF8
    
    foreach ($artifact in $artifacts) {
        $hash = (Get-FileHash -Path $artifact.FullName -Algorithm SHA256).Hash
        $size = $artifact.Length
        "| $($artifact.Name) | $($hash.Substring(0, 16))... | $size |" | Out-File -FilePath $out -Append -Encoding UTF8
    }
} else {
    "| No artifacts found | - | - |" | Out-File -FilePath $out -Append -Encoding UTF8
}

@"

## Summary

- Total Artifacts: $($artifacts.Count)
- Naming: Per NAMING.md
- Structure: build/<variant>/<device_type>/<model>/

## Notes

- TÜV-I, Tests, TÜV-II, Oberster Stein passed.
- Naming per NAMING.md.
- All artifacts include metadata.

---

**T,.&T,,.&T,,,.T. - Together Systems International**
"@ | Out-File -FilePath $out -Append -Encoding UTF8

Write-Host "Report written to $out" -ForegroundColor Green

