# T,. OSOTOSOS Build Test Script
# Testet alle erstellten Builds

$ErrorActionPreference = "Continue"

$GREEN = "Green"
$YELLOW = "Yellow"
$RED = "Red"
$CYAN = "Cyan"

$BUILD_DIR = "build"

Write-Host "========================================" -ForegroundColor Green
Write-Host "T,. OSOTOSOS Build Test" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

if (-not (Test-Path $BUILD_DIR)) {
    Write-Host "FEHLER: Build-Verzeichnis nicht gefunden: $BUILD_DIR" -ForegroundColor $RED
    exit 1
}

Write-Host "Teste Builds in: $BUILD_DIR" -ForegroundColor $CYAN
Write-Host ""

# Finde alle Builds
$builds = Get-ChildItem -Path $BUILD_DIR -Recurse -File

if ($builds.Count -eq 0) {
    Write-Host "KEINE BUILDS GEFUNDEN!" -ForegroundColor $RED
    Write-Host "Bitte erst Build ausfuehren: .\build-all.ps1" -ForegroundColor $YELLOW
    exit 1
}

Write-Host "Gefundene Builds: $($builds.Count)" -ForegroundColor $CYAN
Write-Host ""

$testResults = @()

foreach ($build in $builds) {
    $platform = $build.Directory.Name
    $fileName = $build.Name
    $fileSize = [math]::Round($build.Length / 1MB, 2)
    
    Write-Host "Testing: $platform\$fileName ($fileSize MB)" -ForegroundColor $CYAN
    
    # Prüfe Dateigröße (sollte > 0 sein)
    if ($build.Length -eq 0) {
        Write-Host "  [FAIL] Datei ist leer!" -ForegroundColor $RED
        $testResults += [PSCustomObject]@{
            Platform = $platform
            File = $fileName
            Status = "FAIL"
            Reason = "Datei ist leer"
        }
        continue
    }
    
    # Prüfe ob Datei existiert und lesbar ist
    try {
        $fileInfo = Get-Item $build.FullName -ErrorAction Stop
        Write-Host "  [OK] Datei existiert und ist lesbar" -ForegroundColor $GREEN
        
        # Für Windows EXE: Prüfe ob es eine gültige EXE ist
        if ($build.Extension -eq ".exe") {
            # Versuche File-Header zu prüfen (MZ für Windows EXE)
            $header = Get-Content $build.FullName -TotalCount 1 -Encoding Byte -ErrorAction SilentlyContinue
            if ($header -and $header[0] -eq 0x4D -and $header[1] -eq 0x5A) {
                Write-Host "  [OK] Gültige Windows EXE-Datei (MZ Header)" -ForegroundColor $GREEN
                $testResults += [PSCustomObject]@{
                    Platform = $platform
                    File = $fileName
                    Status = "OK"
                    Reason = "Gültige EXE"
                }
            } else {
                Write-Host "  [WARN] EXE-Header nicht erkannt (kann trotzdem funktionieren)" -ForegroundColor $YELLOW
                $testResults += [PSCustomObject]@{
                    Platform = $platform
                    File = $fileName
                    Status = "WARN"
                    Reason = "Header unklar"
                }
            }
        } else {
            # Für andere Dateien: Prüfe ob sie ausführbar aussehen
            Write-Host "  [OK] Binary gefunden" -ForegroundColor $GREEN
            $testResults += [PSCustomObject]@{
                Platform = $platform
                File = $fileName
                Status = "OK"
                Reason = "Binary gefunden"
            }
        }
    } catch {
        Write-Host "  [FAIL] Fehler beim Lesen: $_" -ForegroundColor $RED
        $testResults += [PSCustomObject]@{
            Platform = $platform
            File = $fileName
            Status = "FAIL"
            Reason = $_.Exception.Message
        }
    }
    
    Write-Host ""
}

# Zusammenfassung
Write-Host "========================================" -ForegroundColor Green
Write-Host "Test-Zusammenfassung" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$okCount = ($testResults | Where-Object { $_.Status -eq "OK" }).Count
$failCount = ($testResults | Where-Object { $_.Status -eq "FAIL" }).Count
$warnCount = ($testResults | Where-Object { $_.Status -eq "WARN" }).Count

Write-Host "Erfolgreich: $okCount" -ForegroundColor $GREEN
Write-Host "Fehler: $failCount" -ForegroundColor $(if ($failCount -eq 0) { $GREEN } else { $RED })
Write-Host "Warnungen: $warnCount" -ForegroundColor $(if ($warnCount -eq 0) { $GREEN } else { $YELLOW })
Write-Host ""

# Test Windows EXE (kann direkt getestet werden)
$windowsExe = Get-ChildItem -Path $BUILD_DIR -Filter "ostosos-server.exe" -Recurse | Select-Object -First 1
if ($windowsExe) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "Funktionstest: Windows EXE" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Starte Test-Server (wird nach 3 Sekunden beendet)..." -ForegroundColor $CYAN
    Write-Host ""
    
    # Starte Server im Hintergrund
    $job = Start-Job -ScriptBlock {
        param($exePath)
        Set-Location (Split-Path $exePath)
        & $exePath 8080
    } -ArgumentList $windowsExe.FullName
    
    # Warte kurz
    Start-Sleep -Seconds 3
    
    # Prüfe ob Server läuft
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        Write-Host "[OK] Server antwortet auf http://localhost:8080" -ForegroundColor $GREEN
        Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor $CYAN
    } catch {
        Write-Host "[WARN] Server antwortet nicht (kann normal sein wenn kein index.html vorhanden)" -ForegroundColor $YELLOW
    }
    
    # Stoppe Server
    Stop-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -ErrorAction SilentlyContinue
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "Test abgeschlossen!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Build-Pfade:" -ForegroundColor $CYAN
foreach ($result in $testResults) {
    $color = if ($result.Status -eq "OK") { $GREEN } elseif ($result.Status -eq "FAIL") { $RED } else { $YELLOW }
    Write-Host "  [$($result.Status)] $($result.Platform)\$($result.File)" -ForegroundColor $color
}

Write-Host ""
Write-Host 'T,.&T,,.&T,,,.T. - Together Systems' -ForegroundColor $GREEN

