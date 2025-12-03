# T,.&T,,.&T,,,. ERSTELLE ALLE AUSFÜHRBARE BUILDS

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ERSTELLE ALLE AUSFÜHRBARE BUILDS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$results = @{
    go = $false
    electron = $false
    docker = $false
    web = $false
}

# 1. GO-EXECUTABLE
Write-Host "1️⃣  GO-EXECUTABLE..." -ForegroundColor Cyan
$goDir = "builds\go-executable"
if (Test-Path "$goDir\main.go") {
    Push-Location $goDir
    try {
        go build -o ostosos-server.exe main.go
        if ($LASTEXITCODE -eq 0 -and (Test-Path "ostosos-server.exe")) {
            $results.go = $true
            $size = (Get-Item "ostosos-server.exe").Length / 1MB
            Write-Host "   ✅ ostosos-server.exe erstellt ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ⚠️  Go-Build Fehler: $_" -ForegroundColor Yellow
    }
    Pop-Location
} else {
    Write-Host "   ⚠️  main.go nicht gefunden" -ForegroundColor Yellow
}

# 2. ELECTRON EXE
Write-Host ""
Write-Host "2️⃣  ELECTRON EXE..." -ForegroundColor Cyan
$electronDir = "builds\electron\windows"
if (Test-Path "$electronDir\package.json") {
    Push-Location $electronDir
    try {
        Write-Host "   📦 Installiere Electron..." -ForegroundColor Yellow
        npm install --silent 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Electron installiert" -ForegroundColor Green
            # Prüfe ob build-Script vorhanden
            $pkg = Get-Content "package.json" | ConvertFrom-Json
            if ($pkg.scripts.build) {
                Write-Host "   🔨 Erstelle EXE..." -ForegroundColor Yellow
                npm run build 2>&1 | Out-Null
                if (Test-Path "dist") {
                    $results.electron = $true
                    Write-Host "   ✅ Electron Build erstellt" -ForegroundColor Green
                }
            } else {
                Write-Host "   ⚠️  build-Script fehlt in package.json" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "   ⚠️  Electron-Build Fehler: $_" -ForegroundColor Yellow
    }
    Pop-Location
} else {
    Write-Host "   ⚠️  Electron package.json nicht gefunden" -ForegroundColor Yellow
}

# 3. DOCKER IMAGE
Write-Host ""
Write-Host "3️⃣  DOCKER IMAGE..." -ForegroundColor Cyan
$dockerDir = "builds\docker"
if (Test-Path "$dockerDir\Dockerfile") {
    Push-Location $dockerDir
    try {
        Write-Host "   🔨 Erstelle Docker Image..." -ForegroundColor Yellow
        docker build -t ostosos:latest . 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $results.docker = $true
            Write-Host "   ✅ Docker Image erstellt: ostosos:latest" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ⚠️  Docker-Build Fehler: $_" -ForegroundColor Yellow
    }
    Pop-Location
} else {
    Write-Host "   ⚠️  Dockerfile nicht gefunden" -ForegroundColor Yellow
}

# 4. WEB PWA LAUNCHER
Write-Host ""
Write-Host "4️⃣  WEB PWA LAUNCHER..." -ForegroundColor Cyan
$pwaDir = "builds\web\pwa"
if (-not (Test-Path $pwaDir)) {
    New-Item -ItemType Directory -Path $pwaDir -Force | Out-Null
}
$batContent = "@echo off`necho Starte OSTOSOS PWA...`nstart http://localhost:8080`necho.`necho Falls kein Server laeuft, oeffne index.html direkt im Browser`npause`n"
$batContent | Out-File -FilePath "$pwaDir\START-OSTOSOS.bat" -Encoding ASCII -NoNewline
if (Test-Path "$pwaDir\START-OSTOSOS.bat") {
    $results.web = $true
    Write-Host "   ✅ START-OSTOSOS.bat erstellt" -ForegroundColor Green
}

# Zusammenfassung
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
$success = ($results.Values | Where-Object { $_ -eq $true }).Count
Write-Host "✅ Erfolgreich: $success/4" -ForegroundColor Green
Write-Host ""
if ($results.go) { Write-Host "   ✅ Go-Executable: builds\go-executable\ostosos-server.exe" -ForegroundColor Green }
if ($results.electron) { Write-Host "   ✅ Electron EXE: builds\electron\windows\dist\" -ForegroundColor Green }
if ($results.docker) { Write-Host "   ✅ Docker Image: ostosos:latest" -ForegroundColor Green }
if ($results.web) { Write-Host "   ✅ Web PWA Launcher: builds\web\pwa\START-OSTOSOS.bat" -ForegroundColor Green }
Write-Host ""



