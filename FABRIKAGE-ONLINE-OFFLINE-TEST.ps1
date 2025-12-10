# FABRIKAGE ONLINE/OFFLINE TEST
# Testet beide Versionen (Online und Offline) auf Fehler
# VERSION: 2.0.0
# STATUS: 🔴 PERMANENT AKTIV - IBM STANDARD

param(
    [string]$BaseURL = "https://myopenai.github.io",
    [switch]$SkipOnline = $false,
    [switch]$SkipOffline = $false
)

$ErrorActionPreference = "Stop"
$newline = [Environment]::NewLine

# ============================================================================
# TEST-KONFIGURATION
# ============================================================================

$script:RootPath = $PSScriptRoot
$script:TestResults = @{
    Online = @{
        Tests = @()
        Errors = @()
        Warnings = @()
    }
    Offline = @{
        Tests = @()
        Errors = @()
        Warnings = @()
    }
}

# ============================================================================
# ONLINE-TESTS
# ============================================================================

function Test-Online {
    if ($SkipOnline) {
        Write-Host "⏭️  Online-Tests übersprungen" -ForegroundColor Yellow
        return
    }
    
    Write-Host "🌐 TESTE ONLINE-VERSION..." -ForegroundColor Cyan
    
    $testFiles = @(
        "index.html",
        "modular-fabrikage/index.html",
        "modular-fabrikage/hilfe.html"
    )
    
    foreach ($file in $testFiles) {
        $url = "$BaseURL/$file"
        Write-Host "   Teste: $url" -ForegroundColor Gray
        
        try {
            $response = Invoke-WebRequest -Uri $url -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
            
            if ($response.StatusCode -eq 200) {
                $script:TestResults.Online.Tests += @{
                    File = $file
                    Status = "OK"
                    StatusCode = $response.StatusCode
                }
                Write-Host "      ✅ OK (200)" -ForegroundColor Green
            } else {
                $script:TestResults.Online.Errors += "Unerwarteter Status-Code: $($response.StatusCode) für $file"
                Write-Host "      ⚠️  Status: $($response.StatusCode)" -ForegroundColor Yellow
            }
        } catch {
            if ($_.Exception.Response.StatusCode -eq 404) {
                $script:TestResults.Online.Errors += "404 Fehler: $file nicht gefunden"
                Write-Host "      ❌ 404 - Nicht gefunden" -ForegroundColor Red
            } else {
                $script:TestResults.Online.Errors += "Fehler bei $file : $($_.Exception.Message)"
                Write-Host "      ❌ Fehler: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
    
    Write-Host "✅ Online-Tests abgeschlossen" -ForegroundColor Green
}

# ============================================================================
# OFFLINE-TESTS
# ============================================================================

function Test-Offline {
    if ($SkipOffline) {
        Write-Host "⏭️  Offline-Tests übersprungen" -ForegroundColor Yellow
        return
    }
    
    Write-Host "💻 TESTE OFFLINE-VERSION..." -ForegroundColor Cyan
    
    $testFiles = @(
        "index.html",
        "modular-fabrikage\index.html",
        "modular-fabrikage\hilfe.html"
    )
    
    foreach ($file in $testFiles) {
        $filePath = Join-Path $RootPath $file
        
        Write-Host "   Teste: $file" -ForegroundColor Gray
        
        if (-not (Test-Path $filePath)) {
            $script:TestResults.Offline.Errors += "Datei nicht gefunden: $file"
            Write-Host "      ❌ Nicht gefunden" -ForegroundColor Red
            continue
        }
        
        try {
            $content = Get-Content $filePath -Raw -ErrorAction Stop
            
            # Prüfe auf UTF-8
            if ($content -match '<meta\s+charset=[''"]?utf-8[''"]?') {
                Write-Host "      ✅ UTF-8 Meta-Tag vorhanden" -ForegroundColor Green
            } else {
                $script:TestResults.Offline.Warnings += "Kein UTF-8 Meta-Tag in $file"
                Write-Host "      ⚠️  Kein UTF-8 Meta-Tag" -ForegroundColor Yellow
            }
            
            # Prüfe auf fehlende Links
            $linkPattern = '(?:href|src|action)\s*=\s*["'']([^"'']+)["'']'
            $matches = [regex]::Matches($content, $linkPattern)
            
            $brokenLinks = @()
            foreach ($match in $matches) {
                $link = $match.Groups[1].Value
                
                if ($link -notmatch "^https?://|^mailto:|^tel:|^#|^javascript:") {
                    $linkPath = Join-Path (Split-Path $filePath -Parent) $link
                    $linkPath = [System.IO.Path]::GetFullPath($linkPath)
                    
                    if (-not (Test-Path $linkPath)) {
                        $brokenLinks += $link
                    }
                }
            }
            
            if ($brokenLinks.Count -gt 0) {
                $script:TestResults.Offline.Errors += "Broken Links in $file : $($brokenLinks -join ', ')"
                Write-Host "      ⚠️  $($brokenLinks.Count) broken Links" -ForegroundColor Yellow
            } else {
                Write-Host "      ✅ Alle Links OK" -ForegroundColor Green
            }
            
            $script:TestResults.Offline.Tests += @{
                File = $file
                Status = "OK"
                BrokenLinks = $brokenLinks.Count
            }
            
        } catch {
            $script:TestResults.Offline.Errors += "Fehler beim Lesen von $file : $($_.Exception.Message)"
            Write-Host "      ❌ Fehler: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    Write-Host "✅ Offline-Tests abgeschlossen" -ForegroundColor Green
}

# ============================================================================
# HAUPTFUNKTION
# ============================================================================

function Main {
    Write-Host $newline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  FABRIKAGE ONLINE/OFFLINE TEST" -ForegroundColor Cyan
    Write-Host "  VERSION 2.0.0 - IBM STANDARD" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host $newline
    
    # Online-Tests
    Test-Online
    
    Write-Host $newline
    
    # Offline-Tests
    Test-Offline
    
    # Zusammenfassung
    Write-Host $newline
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  ZUSAMMENFASSUNG" -ForegroundColor Cyan
    Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
    
    Write-Host "ONLINE:" -ForegroundColor Cyan
    Write-Host "  Tests: $($script:TestResults.Online.Tests.Count)" -ForegroundColor Gray
    Write-Host "  Fehler: $($script:TestResults.Online.Errors.Count)" -ForegroundColor $(if ($script:TestResults.Online.Errors.Count -eq 0) { "Green" } else { "Red" })
    Write-Host "  Warnungen: $($script:TestResults.Online.Warnings.Count)" -ForegroundColor $(if ($script:TestResults.Online.Warnings.Count -eq 0) { "Green" } else { "Yellow" })
    
    Write-Host $newline
    
    Write-Host "OFFLINE:" -ForegroundColor Cyan
    Write-Host "  Tests: $($script:TestResults.Offline.Tests.Count)" -ForegroundColor Gray
    Write-Host "  Fehler: $($script:TestResults.Offline.Errors.Count)" -ForegroundColor $(if ($script:TestResults.Offline.Errors.Count -eq 0) { "Green" } else { "Red" })
    Write-Host "  Warnungen: $($script:TestResults.Offline.Warnings.Count)" -ForegroundColor $(if ($script:TestResults.Offline.Warnings.Count -eq 0) { "Green" } else { "Yellow" })
    
    # Test-Results speichern
    $reportsPath = Join-Path $RootPath "reports"
    if (-not (Test-Path $reportsPath)) {
        New-Item -ItemType Directory -Path $reportsPath -Force | Out-Null
    }
    
    $reportPath = Join-Path $reportsPath "online-offline-test-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
    $script:TestResults | ConvertTo-Json -Depth 10 | Set-Content -Path $reportPath -Encoding UTF8
    Write-Host $newline
    Write-Host "✅ Test-Results gespeichert: $reportPath" -ForegroundColor Green
    
    $totalErrors = $script:TestResults.Online.Errors.Count + $script:TestResults.Offline.Errors.Count
    
    if ($totalErrors -eq 0) {
        Write-Host $newline
        Write-Host "🎉 ALLE TESTS BESTANDEN!" -ForegroundColor Green
        return 0
    } else {
        Write-Host $newline
        Write-Host "⚠️  ES GIBT NOCH FEHLER" -ForegroundColor Yellow
        return 1
    }
}

# ============================================================================
# AUSFÜHRUNG
# ============================================================================

try {
    $exitCode = Main
    exit $exitCode
} catch {
    Write-Host "❌ KRITISCHER FEHLER: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red
    exit 1
}



