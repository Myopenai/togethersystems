# One-click script for Windows PowerShell
# Scaffold, normalize UTF-8/NFC, checksum, zip, publish (Cloudflare Pages)

$ErrorActionPreference = "Continue"
$ROOT = $PSScriptRoot

Write-Host "==> One-click: scaffold, normalize UTF-8/NFC, checksum, zip, publish (Cloudflare Pages)" -ForegroundColor Cyan
Write-Host ""

# 1) Ensure structure
Write-Host "[1] Ensuring directory structure..." -ForegroundColor Yellow
$dirs = @(
    "public\assets",
    "public\downloads",
    "functions\api\voucher",
    "functions\api\presence",
    "scripts"
)
foreach ($dir in $dirs) {
    $fullPath = Join-Path $ROOT $dir
    if (-not (Test-Path $fullPath)) {
        New-Item -ItemType Directory -Force -Path $fullPath | Out-Null
        Write-Host "  ✅ Created: $dir" -ForegroundColor Green
    }
}

# 2-6) Files already created, skip

# 7) NFC normalize (UTF-8 umlauts)
Write-Host ""
Write-Host "[7] Normalizing UTF-8/NFC..." -ForegroundColor Yellow
function Normalize-File {
    param([string]$FilePath)
    try {
        $content = Get-Content -Path $FilePath -Raw -Encoding UTF8
        $normalized = $content.Normalize([System.Text.NormalizationForm]::FormC)
        Set-Content -Path $FilePath -Value $normalized -Encoding UTF8 -NoNewline
        return $true
    } catch {
        return $false
    }
}

function Walk-Directory {
    param([string]$Directory)
    $extensions = @('.html', '.css', '.js', '.json', '.txt', '.toml')
    Get-ChildItem -Path $Directory -Recurse -File | Where-Object {
        $extensions -contains $_.Extension
    } | ForEach-Object {
        Normalize-File -FilePath $_.FullName | Out-Null
    }
}

Walk-Directory -Directory (Join-Path $ROOT "public")
Walk-Directory -Directory (Join-Path $ROOT "functions")
Write-Host "  ✅ NFC normalization complete" -ForegroundColor Green

# 8) Generate checksums.json and bundle.zip
Write-Host ""
Write-Host "[8] Generating checksums and bundle zip..." -ForegroundColor Yellow
$downloadsPath = Join-Path $ROOT "public\downloads"
Set-Location $downloadsPath

# checksums
Write-Host "  Generating checksums.json..." -ForegroundColor Yellow
$checksums = @{}
Get-ChildItem -File | Where-Object {
    $_.Name -ne "bundle.zip" -and $_.Name -ne "checksums.json"
} | ForEach-Object {
    $hash = Get-FileHash -Path $_.FullName -Algorithm SHA256
    $checksums[$_.Name] = $hash.Hash
}

$checksums | ConvertTo-Json -Depth 10 | Set-Content -Path "checksums.json" -Encoding UTF8
Write-Host "  ✅ checksums.json written" -ForegroundColor Green

# zip bundle
Write-Host "  Creating bundle.zip..." -ForegroundColor Yellow
if (Get-Command Compress-Archive -ErrorAction SilentlyContinue) {
    $filesToZip = Get-ChildItem -File | Where-Object {
        $_.Name -ne "bundle.zip" -and $_.Name -ne "checksums.json"
    }
    if ($filesToZip) {
        Remove-Item -Path "bundle.zip" -ErrorAction SilentlyContinue
        $tempZip = Join-Path $env:TEMP "bundle-temp.zip"
        Compress-Archive -Path $filesToZip -DestinationPath $tempZip -Force
        Move-Item -Path $tempZip -Destination "bundle.zip" -Force
        Write-Host "  ✅ bundle.zip created" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️  Compress-Archive not available, skipping bundle creation" -ForegroundColor Yellow
}

Set-Location $ROOT

Write-Host ""
Write-Host "==> All set. To publish:" -ForegroundColor Green
Write-Host "   1) npm install" -ForegroundColor White
Write-Host "   2) npm run publish" -ForegroundColor White
Write-Host "Local dev (Functions + static): npm run dev" -ForegroundColor White
Write-Host ""
