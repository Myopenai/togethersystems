# Minimal Production Package - Nur Essentielles
$prod = "PRODUCTION-PACKAGE"
$deploy = "DEPLOY-PACKAGE"

# Lösche alte
if (Test-Path $prod) { Remove-Item $prod -Recurse -Force }
if (Test-Path $deploy) { Remove-Item $deploy -Recurse -Force }
New-Item -ItemType Directory -Path $prod -Force | Out-Null
New-Item -ItemType Directory -Path $deploy -Force | Out-Null

Write-Host "Erstelle MINIMAL Production Package..." -ForegroundColor Cyan

# HTML (nur essentiell)
$html = "index.html","manifest-portal.html","manifest-forum.html","honeycomb.html","legal-hub.html","admin.html","admin-monitoring.html","business-admin.html","cms-dashboard.html","production-dashboard.html","neural-network-console.html","SETTINGS-MASTER-DASHBOARD.html","Microsoft-Account-Android-Erklaerung.html","ostos-branding.html","OSTOSOS-ANKUENDIGUNG.html","settings-graph-explorer.html","bank-contact-universe.html","JJC-SUPERVISOR-GATE.html","JOB-ANGEBOT-ENTWICKLER.html","OS-GERAETE-UND-PLATTFORMEN.html","duurzaam-bouwen-nederland.html","404.html"
foreach ($f in $html) { 
    if (Test-Path $f) { 
        Copy-Item $f "$prod/" -Force
        Copy-Item $f "$deploy/" -Force
        Write-Host "[OK] $f" -ForegroundColor Green
    }
}

# Help HTML
Get-ChildItem -Filter "help-*.html" | ForEach-Object { 
    Copy-Item $_.FullName "$prod/" -Force
    Copy-Item $_.FullName "$deploy/" -Force
    Write-Host "[OK] $($_.Name)" -ForegroundColor Green
}

# Ordner kopieren
$folders = "css","js","assets","TELADIA","TELBANK","YORDY","ultra","functions","demo-data"
foreach ($f in $folders) {
    if (Test-Path $f) {
        Copy-Item $f "$prod/$f" -Recurse -Force
        Copy-Item $f "$deploy/$f" -Recurse -Force
        Write-Host "[OK] $f/" -ForegroundColor Green
    }
}

# Settings (nur wichtigste)
if (Test-Path "Settings") {
    New-Item -ItemType Directory -Path "$prod/Settings" -Force | Out-Null
    New-Item -ItemType Directory -Path "$deploy/Settings" -Force | Out-Null
    $set = "settings-manifest.json","CONSOLE-MONITORING-SYSTEM.json","HTTP-RESOURCE-MONITOR-ROUTINE.json","IBM-STANDARD.json","INDUSTRIAL-FABRICATION-ROUTINE.json","PRE-CODE-VERIFICATION-SYSTEM.json","404-errors.json"
    foreach ($s in $set) { 
        if (Test-Path "Settings/$s") { 
            Copy-Item "Settings/$s" "$prod/Settings/" -Force
            Copy-Item "Settings/$s" "$deploy/Settings/" -Force
            Write-Host "[OK] Settings/$s" -ForegroundColor Green
        }
    }
    if (Test-Path "Settings/core") { 
        Copy-Item "Settings/core" "$prod/Settings/core" -Recurse -Force
        Copy-Item "Settings/core" "$deploy/Settings/core" -Recurse -Force
        Write-Host "[OK] Settings/core/" -ForegroundColor Green
    }
}

# Config
$cfg = "icon.png","manifest-portal.webmanifest","manifest.webmanifest","sw.js","package.json","README.md"
foreach ($c in $cfg) { 
    if (Test-Path $c) { 
        Copy-Item $c "$prod/" -Force
        Copy-Item $c "$deploy/" -Force
        Write-Host "[OK] $c" -ForegroundColor Green
    }
}

# Größe
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

