# T,. OSOTOSOS - Build Matrix (PowerShell)
param(
    [Parameter(Mandatory=$true)]
    [string]$BUILDID,
    
    [Parameter(Mandatory=$true)]
    [string]$TS
)

$ErrorActionPreference = "Stop"

Write-Host "Build Matrix: generating variants"

$VARIANTS = @("pro", "lite")
$DEVICE_TYPES = @("desktop", "laptop", "tablet", "phone", "embedded")
$MODELS = @("elite", "gen2", "gen3", "micro", "max")
$ARCHS = @("x64", "arm64")
$LOCALES = @("de-DE", "en-US", "nl-NL")
$APP = "osotosos"

$TOTAL = 0

foreach ($v in $VARIANTS) {
    foreach ($d in $DEVICE_TYPES) {
        foreach ($m in $MODELS) {
            foreach ($a in $ARCHS) {
                foreach ($l in $LOCALES) {
                    $dir = "build\$v\$d\$m"
                    New-Item -ItemType Directory -Force -Path $dir | Out-Null
                    
                    $content = "$APP-$v-$d-$m-$a-$l-$BUILDID-$TS"
                    
                    # Calculate SHA256 (first 5 chars)
                    $sha = (Get-FileHash -InputStream ([System.IO.MemoryStream]::new([System.Text.Encoding]::UTF8.GetBytes($content))) -Algorithm SHA256).Hash.Substring(0, 5)
                    
                    $file = "$dir\$APP-$v-$d-$m-$a-$l-$BUILDID-$TS-$sha.img"
                    
                    # Create artifact with metadata
                    @"
OSOTOSOS IMAGE
Variant: $v
Device: $d
Model: $m
Arch: $a
Locale: $l
BuildID: $BUILDID
Timestamp: $TS
SHA256: $sha
Content: $content
"@ | Out-File -FilePath $file -Encoding UTF8
                    
                    Write-Host "Artifact $file"
                    $TOTAL++
                }
            }
        }
    }
}

Write-Host "Build Matrix Complete: $TOTAL artifacts created" -ForegroundColor Green

