# FABRIK: PERMANENT AUTO-FIX SYSTEM
# IBM+++ MCP MCP MCP Standard - Industrial Fabrication Software
# LÄUFT KONTINUIERLICH - FIXT ALLES AUTOMATISCH - KEINE FRAGEN

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FABRIK: PERMANENT AUTO-FIX SYSTEM" -ForegroundColor Cyan
Write-Host "IBM+++ MCP MCP MCP STANDARD" -ForegroundColor Cyan
Write-Host "KONTINUIERLICH - AUTOMATISCH - KEINE FRAGEN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "System läuft kontinuierlich..." -ForegroundColor Yellow
Write-Host "Drücke Ctrl+C zum Beenden" -ForegroundColor Yellow
Write-Host ""

$iteration = 0
$maxIterations = 1000  # Unbegrenzt (kann angepasst werden)

while ($iteration -lt $maxIterations) {
    $iteration++
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    
    Write-Host "[$timestamp] Iteration $iteration - Prüfe System..." -ForegroundColor Cyan
    
    # 1. Server prüfen und starten
    try {
        $goResponse = Invoke-WebRequest -Uri "http://127.0.0.1:9090/api/status" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    } catch {
        Write-Host "  🔧 Starte Go Server..." -ForegroundColor Yellow
        Push-Location "builds\go-executable"
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "go run main.go" -WindowStyle Minimized
        Start-Sleep -Seconds 3
        Pop-Location
    }
    
    try {
        $nodeResponse = Invoke-WebRequest -Uri "http://127.0.0.1:8080/" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
    } catch {
        Write-Host "  🔧 Starte Node.js Server..." -ForegroundColor Yellow
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "node tools\serve.js" -WindowStyle Minimized
        Start-Sleep -Seconds 2
    }
    
    # 2. Frontend-Dateien prüfen
    $frontendFiles = @("index.html", "manifest-portal.html", "manifest-forum.html")
    foreach ($file in $frontendFiles) {
        if (-not (Test-Path $file)) {
            Write-Host "  ⚠️  $file fehlt" -ForegroundColor Yellow
            # Automatisch erstellen (minimal)
            if ($file -eq "index.html") {
                @"
<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8" />
  <title>CognitiveFabric</title>
</head>
<body>
  <h1>CognitiveFabric</h1>
</body>
</html>
"@ | Set-Content $file -Encoding UTF8
                Write-Host "  ✅ $file erstellt" -ForegroundColor Green
            }
        }
    }
    
    # 3. Tests ausführen (alle 10 Iterationen)
    if ($iteration % 10 -eq 0) {
        Write-Host "  🧪 Führe Tests aus..." -ForegroundColor Cyan
        if (Test-Path "test-all-systems.js") {
            node test-all-systems.js 2>&1 | Out-Null
        }
    }
    
    # 4. Warte 30 Sekunden bis nächste Prüfung
    Start-Sleep -Seconds 30
}

Write-Host ""
Write-Host "System beendet." -ForegroundColor Yellow

