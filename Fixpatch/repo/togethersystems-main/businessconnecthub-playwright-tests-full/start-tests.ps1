# Playwright Tests für TELCOMPETIOION automatisch starten
# Startet Webserver und führt Tests aus

$ErrorActionPreference = "Stop"

Write-Host "Starte Playwright-Tests für TELCOMPETIOION..." -ForegroundColor Green

# Pfade
$rootPath = "D:\TELCOMPETIOION"
$testPath = "D:\TELBOUISNINESSTESTS\businessconnecthub-playwright-tests-full"
$port = 9323

# Prüfe ob Root-Verzeichnis existiert
if (-not (Test-Path $rootPath)) {
    Write-Host "Fehler: TELCOMPETIOION Root-Verzeichnis nicht gefunden: $rootPath" -ForegroundColor Red
    exit 1
}

# Prüfe ob Test-Verzeichnis existiert
if (-not (Test-Path $testPath)) {
    Write-Host "Fehler: Test-Verzeichnis nicht gefunden: $testPath" -ForegroundColor Red
    exit 1
}

# Prüfe ob Server bereits läuft
$serverRunning = $false
try {
    $null = Invoke-WebRequest -Uri "http://localhost:$port/" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    Write-Host "Server läuft bereits auf Port $port" -ForegroundColor Green
    $serverRunning = $true
} catch {
    # Server läuft nicht, wird später gestartet
    $serverRunning = $false
}

# Starte Webserver falls nicht bereits läuft
$serverJob = $null
if (-not $serverRunning) {
    Write-Host "Starte Webserver auf Port $port..." -ForegroundColor Cyan
    
    # Python-Check
    $python = Get-Command python -ErrorAction SilentlyContinue
    if (-not $python) {
        Write-Host "Fehler: Python nicht gefunden. Bitte installiere Python oder starte Server manuell." -ForegroundColor Red
        exit 1
    }
    
    # Starte Server im Hintergrund
    $serverJob = Start-Job -ScriptBlock {
        param($root, $port)
        Set-Location $root
        python -m http.server $port
    } -ArgumentList $rootPath, $port
    
    Write-Host "Warte auf Server-Start..." -ForegroundColor Yellow
    
    # Warte bis Server läuft (max 10 Sekunden)
    $timeout = 10
    $elapsed = 0
    while ($elapsed -lt $timeout) {
        Start-Sleep -Seconds 1
        $elapsed++
        try {
            $null = Invoke-WebRequest -Uri "http://localhost:$port/" -TimeoutSec 1 -UseBasicParsing -ErrorAction Stop
            Write-Host "Server läuft auf http://localhost:$port/" -ForegroundColor Green
            $serverRunning = $true
            break
        } catch {
            Write-Host "." -NoNewline -ForegroundColor Gray
        }
    }
    Write-Host ""
    
    if (-not $serverRunning) {
        Write-Host "Fehler: Server konnte nicht gestartet werden (Timeout)" -ForegroundColor Red
        if ($serverJob) {
            Stop-Job $serverJob -ErrorAction SilentlyContinue
            Remove-Job $serverJob -ErrorAction SilentlyContinue
        }
        exit 1
    }
}

# Wechsle ins Test-Verzeichnis
Set-Location $testPath

Write-Host "Führe Playwright-Tests aus..." -ForegroundColor Cyan
Write-Host ""

# Führe Tests aus
try {
    npx playwright test --project=Chromium --reporter=list
    $testExitCode = $LASTEXITCODE
} catch {
    Write-Host "Fehler beim Ausführen der Tests: $_" -ForegroundColor Red
    $testExitCode = 1
}

Write-Host ""
Write-Host "Tests abgeschlossen" -ForegroundColor Cyan

# Stoppe Server falls wir ihn gestartet haben
if ($serverJob) {
    Write-Host "Stoppe Webserver..." -ForegroundColor Yellow
    Stop-Job $serverJob -ErrorAction SilentlyContinue
    Remove-Job $serverJob -Force -ErrorAction SilentlyContinue
    Write-Host "Webserver gestoppt" -ForegroundColor Green
}

# Exit-Code zurückgeben
exit $testExitCode
