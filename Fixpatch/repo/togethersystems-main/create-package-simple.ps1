# Simple Production Package Creator
$prod = "PRODUCTION-PACKAGE"
$deploy = "DEPLOY-PACKAGE"

if (Test-Path $prod) { Remove-Item $prod -Recurse -Force }
if (Test-Path $deploy) { Remove-Item $deploy -Recurse -Force }

New-Item -ItemType Directory -Path $prod -Force | Out-Null
New-Item -ItemType Directory -Path $deploy -Force | Out-Null

Write-Host "Erstelle Production Package..." -ForegroundColor Cyan

# HTML Files
$html = @("index.html","manifest-portal.html","manifest-forum.html","honeycomb.html","legal-hub.html","admin.html","admin-monitoring.html","business-admin.html","cms-dashboard.html","production-dashboard.html","neural-network-console.html","SETTINGS-MASTER-DASHBOARD.html","Microsoft-Account-Android-Erklaerung.html","ostos-branding.html","OSTOSOS-ANKUENDIGUNG.html","settings-graph-explorer.html","bank-contact-universe.html","JJC-SUPERVISOR-GATE.html","JOB-ANGEBOT-ENTWICKLER.html","OS-GERAETE-UND-PLATTFORMEN.html","duurzaam-bouwen-nederland.html","404.html")
foreach ($f in $html) { if (Test-Path $f) { Copy-Item $f "$prod/" -Force; Copy-Item $f "$deploy/" -Force; Write-Host "  $f" -ForegroundColor Gray } }
Get-ChildItem -Filter "help-*.html" | ForEach-Object { Copy-Item $_.FullName "$prod/" -Force; Copy-Item $_.FullName "$deploy/" -Force; Write-Host "  $($_.Name)" -ForegroundColor Gray }

# Folders
if (Test-Path "css") { Copy-Item "css" "$prod/css" -Recurse -Force; Copy-Item "css" "$deploy/css" -Recurse -Force; Write-Host "  css/" -ForegroundColor Gray }
if (Test-Path "js") { Copy-Item "js" "$prod/js" -Recurse -Force; Copy-Item "js" "$deploy/js" -Recurse -Force; Write-Host "  js/" -ForegroundColor Gray }
if (Test-Path "assets") { Copy-Item "assets" "$prod/assets" -Recurse -Force; Copy-Item "assets" "$deploy/assets" -Recurse -Force; Write-Host "  assets/" -ForegroundColor Gray }
if (Test-Path "TELADIA") { Copy-Item "TELADIA" "$prod/TELADIA" -Recurse -Force; Copy-Item "TELADIA" "$deploy/TELADIA" -Recurse -Force; Write-Host "  TELADIA/" -ForegroundColor Gray }
if (Test-Path "TELBANK") { Copy-Item "TELBANK" "$prod/TELBANK" -Recurse -Force; Copy-Item "TELBANK" "$deploy/TELBANK" -Recurse -Force; Write-Host "  TELBANK/" -ForegroundColor Gray }
if (Test-Path "YORDY") { Copy-Item "YORDY" "$prod/YORDY" -Recurse -Force; Copy-Item "YORDY" "$deploy/YORDY" -Recurse -Force; Write-Host "  YORDY/" -ForegroundColor Gray }
if (Test-Path "ultra") { Copy-Item "ultra" "$prod/ultra" -Recurse -Force; Copy-Item "ultra" "$deploy/ultra" -Recurse -Force; Write-Host "  ultra/" -ForegroundColor Gray }
if (Test-Path "functions") { Copy-Item "functions" "$prod/functions" -Recurse -Force; Copy-Item "functions" "$deploy/functions" -Recurse -Force; Write-Host "  functions/" -ForegroundColor Gray }
if (Test-Path "demo-data") { Copy-Item "demo-data" "$prod/demo-data" -Recurse -Force; Copy-Item "demo-data" "$deploy/demo-data" -Recurse -Force; Write-Host "  demo-data/" -ForegroundColor Gray }

# Settings (important only)
if (Test-Path "Settings") {
    New-Item -ItemType Directory -Path "$prod/Settings" -Force | Out-Null
    New-Item -ItemType Directory -Path "$deploy/Settings" -Force | Out-Null
    $set = @("settings-manifest.json","CONSOLE-MONITORING-SYSTEM.json","HTTP-RESOURCE-MONITOR-ROUTINE.json","IBM-STANDARD.json","INDUSTRIAL-FABRICATION-ROUTINE.json","PRE-CODE-VERIFICATION-SYSTEM.json","404-errors.json")
    foreach ($s in $set) { if (Test-Path "Settings/$s") { Copy-Item "Settings/$s" "$prod/Settings/" -Force; Copy-Item "Settings/$s" "$deploy/Settings/" -Force; Write-Host "  Settings/$s" -ForegroundColor Gray } }
    if (Test-Path "Settings/core") { Copy-Item "Settings/core" "$prod/Settings/core" -Recurse -Force; Copy-Item "Settings/core" "$deploy/Settings/core" -Recurse -Force; Write-Host "  Settings/core/" -ForegroundColor Gray }
}

# Config Files
$cfg = @("icon.png","manifest-portal.webmanifest","manifest.webmanifest","sw.js","package.json","package-lock.json","README.md")
foreach ($c in $cfg) { if (Test-Path $c) { Copy-Item $c "$prod/" -Force; Copy-Item $c "$deploy/" -Force; Write-Host "  $c" -ForegroundColor Gray } }

# Root JS Files
$rootjs = @("autofix-client.js","console-monitor.js","console-404-detector.js","http-resource-monitor-browser.js","router.js","mot-core.js","room-image-carousel.js")
foreach ($r in $rootjs) { if (Test-Path $r) { Copy-Item $r "$prod/js/" -Force; Copy-Item $r "$deploy/js/" -Force; Write-Host "  $r" -ForegroundColor Gray } }

# Size Calculation
$prodSize = (Get-ChildItem -Path $prod -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
$deploySize = (Get-ChildItem -Path $deploy -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
$prodMB = [math]::Round($prodSize / 1MB, 2)
$deployMB = [math]::Round($deploySize / 1MB, 2)

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "PACKAGE ERSTELLT" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Production: $prodMB MB" -ForegroundColor White
Write-Host "Deploy: $deployMB MB" -ForegroundColor White
Write-Host ""

