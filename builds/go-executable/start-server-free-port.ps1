# Startet Server auf freiem Port automatisch

$ErrorActionPreference = "Continue"

Write-Host "Suche freien Port..." -ForegroundColor Cyan

# Finde freien Port (8080-8090)
$port = 8080
$found = $false

for ($p = 8080; $p -le 8090; $p++) {
    $connection = Get-NetTCPConnection -LocalPort $p -ErrorAction SilentlyContinue
    if (-not $connection) {
        $port = $p
        $found = $true
        break
    }
}

if (-not $found) {
    Write-Host "FEHLER: Kein freier Port gefunden (8080-8090)" -ForegroundColor Red
    exit 1
}

Write-Host "Freier Port gefunden: $port" -ForegroundColor Green
Write-Host ""

# Starte Server
$exePath = "build\windows-amd64\ostosos-server.exe"

if (-not (Test-Path $exePath)) {
    Write-Host "FEHLER: EXE nicht gefunden: $exePath" -ForegroundColor Red
    exit 1
}

Write-Host "Starte Server auf Port $port..." -ForegroundColor Cyan
Write-Host "Server URL: http://localhost:$port" -ForegroundColor Yellow
Write-Host "Zum Beenden: Ctrl+C" -ForegroundColor Yellow
Write-Host ""

& $exePath $port

