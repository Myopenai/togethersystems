# T,. OSOTOSOS Icon-Generierung für alle Builds
# Erstellt Icons für Windows, macOS, Linux, Web, etc.

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "T,. OSOTOSOS Icon-Generierung" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

$iconsDir = Join-Path $rootDir "icons"
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir | Out-Null
}

Write-Host "[1] Erstelle SVG-Icon..." -ForegroundColor Yellow

# SVG Icon (Vektor, skalierbar)
$svgIcon = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#059669;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="80" fill="url(#grad1)"/>
  <text x="256" y="380" font-family="Arial, sans-serif" font-size="320" font-weight="900" fill="white" text-anchor="middle" dominant-baseline="middle">T,.</text>
  <circle cx="400" cy="120" r="40" fill="white" opacity="0.3"/>
  <circle cx="120" cy="400" r="30" fill="white" opacity="0.2"/>
</svg>
"@

$svgPath = Join-Path $iconsDir "ostosos-icon.svg"
$svgIcon | Out-File -FilePath $svgPath -Encoding UTF8
Write-Host "  [OK] SVG-Icon erstellt: $svgPath" -ForegroundColor Green

Write-Host ""
Write-Host "[2] Erstelle HTML-Icon (für Web)..." -ForegroundColor Yellow

# HTML Icon (für Web-Browser)
$htmlIcon = @"
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>T,. OSOTOSOS Icon</title>
<style>
body { margin: 0; padding: 0; background: linear-gradient(135deg, #10b981, #059669); display: flex; justify-content: center; align-items: center; height: 100vh; }
.icon { font-size: 200px; color: white; font-weight: 900; font-family: Arial, sans-serif; }
</style>
</head>
<body>
<div class="icon">T,.</div>
</body>
</html>
"@

$htmlIconPath = Join-Path $iconsDir "ostosos-icon.html"
$htmlIcon | Out-File -FilePath $htmlIconPath -Encoding UTF8
Write-Host "  [OK] HTML-Icon erstellt: $htmlIconPath" -ForegroundColor Green

Write-Host ""
Write-Host "[3] Erstelle Base64-Encoded Icon (für Embedding)..." -ForegroundColor Yellow

# Base64-encoded PNG (vereinfacht - in Produktion würde man ImageMagick/Sharp verwenden)
$base64Icon = "data:image/svg+xml;base64," + [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($svgIcon))
$base64Path = Join-Path $iconsDir "ostosos-icon-base64.txt"
$base64Icon | Out-File -FilePath $base64Path -Encoding UTF8
Write-Host "  [OK] Base64-Icon erstellt: $base64Path" -ForegroundColor Green

Write-Host ""
Write-Host "[4] Erstelle Favicon..." -ForegroundColor Yellow

# Favicon (SVG für moderne Browser)
$favicon = @"
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="15" fill="#10b981"/>
  <text x="50" y="75" font-family="Arial" font-size="60" font-weight="900" fill="white" text-anchor="middle">T,.</text>
</svg>
"@

$faviconPath = Join-Path $rootDir "favicon.svg"
$favicon | Out-File -FilePath $faviconPath -Encoding UTF8
Write-Host "  [OK] Favicon erstellt: $faviconPath" -ForegroundColor Green

# Favicon.ico (HTML-Format für ältere Browser)
$faviconIco = @"
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='15' fill='%2310b981'/><text x='50' y='75' font-family='Arial' font-size='60' font-weight='900' fill='white' text-anchor='middle'>T,.&lt;/text&gt;&lt;/svg&gt;">
"@

Write-Host ""
Write-Host "[5] Erstelle Icon-Manifest..." -ForegroundColor Yellow

# Icon Manifest für PWA
$iconManifest = @{
    "icons" = @(
        @{
            "src" = "icons/ostosos-icon.svg"
            "sizes" = "any"
            "type" = "image/svg+xml"
        },
        @{
            "src" = "icons/ostosos-icon.html"
            "sizes" = "512x512"
            "type" = "text/html"
        }
    )
}

$manifestPath = Join-Path $iconsDir "icon-manifest.json"
$iconManifest | ConvertTo-Json -Depth 10 | Out-File -FilePath $manifestPath -Encoding UTF8
Write-Host "  [OK] Icon-Manifest erstellt: $manifestPath" -ForegroundColor Green

Write-Host ""
Write-Host "[6] Erstelle Build-Icon-Integration..." -ForegroundColor Yellow

# Build-Integration Script
$buildIconScript = @"
# T,. OSOTOSOS Build-Icon-Integration
# Wird automatisch in Builds eingefügt

ICON_SVG='icons/ostosos-icon.svg'
ICON_HTML='icons/ostosos-icon.html'
FAVICON='favicon.svg'

# Für Windows (ICO)
# Benötigt: ImageMagick oder Online-Konverter
# convert icons/ostosos-icon.svg -resize 256x256 icons/ostosos-icon.ico

# Für macOS (ICNS)
# Benötigt: iconutil oder Online-Konverter
# iconutil -c icns icons/ostosos-icon.iconset

# Für Linux (PNG)
# Benötigt: ImageMagick oder Online-Konverter
# convert icons/ostosos-icon.svg -resize 512x512 icons/ostosos-icon.png

echo "Icons für Builds bereit!"
"@

$buildIconPath = Join-Path $iconsDir "build-icon-integration.sh"
$buildIconScript | Out-File -FilePath $buildIconPath -Encoding UTF8
Write-Host "  [OK] Build-Integration erstellt: $buildIconPath" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] Icon-Generierung abgeschlossen!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Icons erstellt in: $iconsDir" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verfügbare Icons:" -ForegroundColor Yellow
Write-Host "  - ostosos-icon.svg (Vektor, skalierbar)" -ForegroundColor White
Write-Host "  - ostosos-icon.html (Web-Icon)" -ForegroundColor White
Write-Host "  - ostosos-icon-base64.txt (Base64 für Embedding)" -ForegroundColor White
Write-Host "  - favicon.svg (Favicon)" -ForegroundColor White
Write-Host ""
Write-Host "Hinweis: Für ICO/ICNS/PNG benötigst du ImageMagick oder Online-Konverter" -ForegroundColor Yellow
Write-Host ""
Write-Host "T,.&T,,.&T,,,.T." -ForegroundColor Green

