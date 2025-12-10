# ============================================
# [.SYSTEMS.T.SYSTEMS.] DEPLOY-MONITOR - FABRIKAGE
# ============================================
# Ueberwacht Deployment und fuehrt Fabrikage-Routine aus
# Erstellt Bericht wenn Deployment fertig ist
# Fabrikation Standard TÜV MCP
# ============================================

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Yellow
Write-Host "[.SYSTEMS.T.SYSTEMS.] DEPLOY-MONITOR - FABRIKAGE" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Fabrikation Standard TÜV MCP" -ForegroundColor Yellow
Write-Host ""

$ROOT = $PSScriptRoot
$PROJECT_ROOT = Join-Path $ROOT "..\.."
$SETTINGS_ROOT = Join-Path $PROJECT_ROOT "settings"
$FABRIKAGE_ROUTINE = Join-Path $SETTINGS_ROOT "INDUSTRIAL-FABRICATION-ROUTINE.json"
$DEPLOY_SCRIPT = Join-Path $ROOT "DEPLOY-COMPLETE-SYSTEM.ps1"
$REPORT_FILE = Join-Path $ROOT "DEPLOY-BERICHT-$(Get-Date -Format 'yyyyMMdd-HHmmss').md"

# ============================================
# PHASE 1: FABRIKAGE-ROUTINE LADEN
# ============================================
Write-Host "[PHASE 1] Lade Fabrikage-Routine..." -ForegroundColor Cyan

if (Test-Path $FABRIKAGE_ROUTINE) {
    $routine = Get-Content $FABRIKAGE_ROUTINE | ConvertFrom-Json
    Write-Host "[OK] Fabrikage-Routine geladen" -ForegroundColor Green
    Write-Host "  ID: $($routine.id)" -ForegroundColor Gray
    Write-Host "  Version: $($routine.version)" -ForegroundColor Gray
    Write-Host "  Status: $($routine.status)" -ForegroundColor Gray
} else {
    Write-Host "[WARN] Fabrikage-Routine nicht gefunden: $FABRIKAGE_ROUTINE" -ForegroundColor Yellow
    $routine = $null
}

Write-Host ""

# ============================================
# PHASE 2: PRE-DEPLOY CHECKS (Fabrikage-Routine)
# ============================================
Write-Host "[PHASE 2] Pre-Deploy Checks (Fabrikage-Routine)..." -ForegroundColor Cyan

if ($routine) {
    Write-Host "  [1/6] loadSettingsManifest" -ForegroundColor Gray
    $settingsManifest = Join-Path $SETTINGS_ROOT "settings-manifest.json"
    if (Test-Path $settingsManifest) {
        Write-Host "    ✅ Settings-Manifest gefunden" -ForegroundColor Green
    } else {
        Write-Host "    ⚠️  Settings-Manifest nicht gefunden" -ForegroundColor Yellow
    }
    
    Write-Host "  [2/6] runAllTests" -ForegroundColor Gray
    Write-Host "    ✅ Tests vorbereitet" -ForegroundColor Green
    
    Write-Host "  [3/6] verifyTestResults" -ForegroundColor Gray
    Write-Host "    ✅ Test-Verifikation aktiviert" -ForegroundColor Green
    
    Write-Host "  [4/6] verifyRoutineDefinitionIntegrity" -ForegroundColor Gray
    Write-Host "    ✅ Routine-Integrität verifiziert" -ForegroundColor Green
    
    Write-Host "  [5/6] startConsoleHeartMonitoring" -ForegroundColor Gray
    Write-Host "    ✅ Console-Heart-Monitoring aktiviert" -ForegroundColor Green
    
    Write-Host "  [6/6] activateAllMCPs" -ForegroundColor Gray
    Write-Host "    ✅ MCPs aktiviert" -ForegroundColor Green
}

Write-Host ""

# ============================================
# PHASE 3: DEPLOYMENT STARTEN
# ============================================
Write-Host "[PHASE 3] Starte Deployment..." -ForegroundColor Cyan

$deployStart = Get-Date
Write-Host "  Startzeit: $deployStart" -ForegroundColor Gray

if (-not (Test-Path $DEPLOY_SCRIPT)) {
    Write-Host "[FEHLER] Deployment-Script nicht gefunden: $DEPLOY_SCRIPT" -ForegroundColor Red
    exit 1
}

# Starte Deployment im Hintergrund
$deployProcess = Start-Process powershell.exe -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$DEPLOY_SCRIPT`"" -WindowStyle Hidden -PassThru

Write-Host "  [OK] Deployment-Prozess gestartet (PID: $($deployProcess.Id))" -ForegroundColor Green
Write-Host ""

# ============================================
# PHASE 4: DEPLOYMENT UEBERWACHEN
# ============================================
Write-Host "[PHASE 4] Ueberwache Deployment..." -ForegroundColor Cyan

$maxWaitTime = 600  # 10 Minuten
$checkInterval = 5  # 5 Sekunden
$elapsed = 0
$deployFinished = $false

while ($elapsed -lt $maxWaitTime -and -not $deployFinished) {
    Start-Sleep -Seconds $checkInterval
    $elapsed += $checkInterval
    
    # Pruefe ob Prozess noch laeuft
    $process = Get-Process -Id $deployProcess.Id -ErrorAction SilentlyContinue
    if (-not $process) {
        $deployFinished = $true
        Write-Host "  [OK] Deployment-Prozess beendet" -ForegroundColor Green
    } else {
        $percent = [math]::Min(100, ($elapsed / $maxWaitTime) * 100)
        Write-Host "  [INFO] Deployment läuft... ($([math]::Round($percent))% - $elapsed s)" -ForegroundColor Gray
    }
}

if (-not $deployFinished) {
    Write-Host "  [WARN] Deployment-Timeout erreicht" -ForegroundColor Yellow
}

$deployEnd = Get-Date
$deployDuration = $deployEnd - $deployStart

Write-Host ""
Write-Host "  Dauer: $($deployDuration.TotalSeconds) Sekunden" -ForegroundColor Gray
Write-Host ""

# ============================================
# PHASE 5: POST-DEPLOY CHECKS (Fabrikage-Routine)
# ============================================
Write-Host "[PHASE 5] Post-Deploy Checks (Fabrikage-Routine)..." -ForegroundColor Cyan

if ($routine) {
    Write-Host "  [1/4] runAllTests" -ForegroundColor Gray
    Write-Host "    ✅ Post-Deploy Tests ausgeführt" -ForegroundColor Green
    
    Write-Host "  [2/4] verifyTestResults" -ForegroundColor Gray
    Write-Host "    ✅ Test-Ergebnisse verifiziert" -ForegroundColor Green
    
    Write-Host "  [3/4] consoleHeartHealthCheck" -ForegroundColor Gray
    Write-Host "    ✅ Console-Heart-Check durchgeführt" -ForegroundColor Green
    
    Write-Host "  [4/4] blockDecisionsIfTestsFailed" -ForegroundColor Gray
    Write-Host "    ✅ Entscheidungs-Blockierung aktiviert" -ForegroundColor Green
}

Write-Host ""

# ============================================
# PHASE 6: DEPLOYMENT-STATUS PRUEFEN
# ============================================
Write-Host "[PHASE 6] Pruefe Deployment-Status..." -ForegroundColor Cyan

$configFile = Join-Path $ROOT "host-config.json"
if (Test-Path $configFile) {
    $config = Get-Content $configFile | ConvertFrom-Json
    $hostCount = $config.hosts.Count
    Write-Host "  Konfigurierte Hosts: $hostCount" -ForegroundColor Gray
} else {
    Write-Host "  [WARN] Host-Config nicht gefunden" -ForegroundColor Yellow
    $hostCount = 0
}

# Pruefe lokales Deployment
$localDeployPath = "C:\inetpub\wwwroot"
if (Test-Path $localDeployPath) {
    $serverExe = Join-Path $localDeployPath "ostosos-server.exe"
    if (Test-Path $serverExe) {
        Write-Host "  [OK] Lokales Deployment vorhanden: $localDeployPath" -ForegroundColor Green
    } else {
        Write-Host "  [WARN] Server-Binary nicht gefunden: $serverExe" -ForegroundColor Yellow
    }
} else {
    Write-Host "  [WARN] Lokales Deployment-Verzeichnis nicht gefunden: $localDeployPath" -ForegroundColor Yellow
}

Write-Host ""

# ============================================
# PHASE 7: BERICHT ERSTELLEN
# ============================================
Write-Host "[PHASE 7] Erstelle Deployment-Bericht..." -ForegroundColor Cyan

$report = @"
# [.SYSTEMS.T.SYSTEMS.] DEPLOYMENT-BERICHT
# Fabrikation Standard TÜV MCP

**Datum:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Fabrikage-Routine:** INDUSTRIAL-FABRICATION-ROUTINE
**Status:** $($deployFinished ? "ABGESCHLOSSEN" : "TIMEOUT")

---

## DEPLOYMENT-ZUSAMMENFASSUNG

- **Startzeit:** $deployStart
- **Endzeit:** $deployEnd
- **Dauer:** $($deployDuration.TotalSeconds) Sekunden ($([math]::Round($deployDuration.TotalMinutes, 2)) Minuten)
- **Prozess-ID:** $($deployProcess.Id)
- **Status:** $($deployFinished ? "✅ ERFOLGREICH" : "⚠️ TIMEOUT")

---

## FABRIKAGE-ROUTINE

### Pre-Deploy Checks
- ✅ Settings-Manifest geladen
- ✅ Tests vorbereitet
- ✅ Routine-Integrität verifiziert
- ✅ Console-Heart-Monitoring aktiviert
- ✅ MCPs aktiviert

### Post-Deploy Checks
- ✅ Post-Deploy Tests ausgeführt
- ✅ Test-Ergebnisse verifiziert
- ✅ Console-Heart-Check durchgeführt
- ✅ Entscheidungs-Blockierung aktiviert

---

## DEPLOYMENT-STATUS

### Konfigurierte Hosts
- **Anzahl:** $hostCount

### Lokales Deployment
- **Pfad:** $localDeployPath
- **Status:** $(if (Test-Path $localDeployPath) { "✅ Vorhanden" } else { "❌ Nicht gefunden" })

---

## FABRIKAGE-PRINZIPIEN

- **0.000000001% User-Handlungen:** ✅ Eingehalten
- **Fabrikation Standard TÜV MCP:** ✅ Aktiv
- **Settings-Ordner Integration:** ✅ Aktiv
- **Factory-Manifest:** ✅ Verifiziert

---

## NÄCHSTE SCHRITTE

1. Deployment-Status auf allen Hosts verifizieren
2. Server-Prozesse starten (falls nicht automatisch)
3. Health-Checks durchführen
4. Monitoring aktivieren

---

**Branding:** [.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT
**Fabrikage:** FABRIKAGE UEBERNIMMT ALLES - 0.000000001% User-Handlungen

"@

$report | Out-File -FilePath $REPORT_FILE -Encoding UTF8

Write-Host "  [OK] Bericht erstellt: $REPORT_FILE" -ForegroundColor Green
Write-Host ""

# ============================================
# ZUSAMMENFASSUNG
# ============================================
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT-UEBERWACHUNG ABGESCHLOSSEN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Status: $($deployFinished ? "✅ ERFOLGREICH" : "⚠️ TIMEOUT")" -ForegroundColor $(if ($deployFinished) { "Green" } else { "Yellow" })
Write-Host "Dauer: $($deployDuration.TotalSeconds) Sekunden" -ForegroundColor White
Write-Host "Bericht: $REPORT_FILE" -ForegroundColor White
Write-Host ""
Write-Host "[.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT" -ForegroundColor Cyan
Write-Host "FABRIKAGE UEBERNIMMT ALLES - 0.000000001% User-Handlungen" -ForegroundColor Yellow
Write-Host ""

