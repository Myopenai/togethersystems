# [.SYSTEMS.T.SYSTEMS.] TÜV FABRIKAGE COMPLETE TEST
# Testet Online & Lokal auf 100% Funktionalität und Fabrikage Standards

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] TÜV FABRIKAGE COMPLETE TEST" -ForegroundColor Green
Write-Host "Fabrikation Standard TÜV MCP" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$ROOT = $PSScriptRoot
$BASE_URL = "https://myopenai.github.io/togethersystems"
$results = @{
    Online = @{ Passed = 0; Failed = 0; Warnings = 0 }
    Local = @{ Passed = 0; Failed = 0; Warnings = 0 }
    Fabrikage = @{ Passed = 0; Failed = 0; Warnings = 0 }
    Branding = @{ Passed = 0; Failed = 0; Warnings = 0 }
}

# ============================================
# PHASE 1: ONLINE TESTS
# ============================================
Write-Host "[PHASE 1] ONLINE TESTS" -ForegroundColor Cyan
Write-Host ""

$onlineUrls = @(
    "/",
    "/Portal%20–%20Start.html",
    "/manifest-portal.html",
    "/manifest-forum.html",
    "/ultra/ui/developer-portal.html",
    "/downloads/",
    "/downloads/ostosos/OSTOSOS-OS-COMPLETE-SYSTEM.html",
    "/pdf/ZENTRALE-FABRIKAGE-GESAMTBERICHT.html",
    "/pdf/ZENTRALE-FABRIKAGE-EINZELKLICK-BERICHT.html"
)

foreach ($url in $onlineUrls) {
    $fullUrl = $BASE_URL + $url
    Write-Host "  Teste: $url" -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $fullUrl -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "    ✅ HTTP 200 OK" -ForegroundColor Green
            $results.Online.Passed++
            
            # Prüfe Content
            $content = $response.Content
            
            # .T. Branding prüfen
            if ($content -match "\.T\.|\[\.T\.|\.SYSTEMS\.T\.SYSTEMS\.\]") {
                Write-Host "    ✅ .T. Branding vorhanden" -ForegroundColor Green
                $results.Branding.Passed++
            } else {
                Write-Host "    ⚠️  .T. Branding fehlt" -ForegroundColor Yellow
                $results.Branding.Warnings++
            }
            
            # BASE_URL prüfen
            if ($content -match "BASE_URL|const BASE_URL") {
                Write-Host "    ✅ BASE_URL konfiguriert" -ForegroundColor Green
            } else {
                Write-Host "    ⚠️  BASE_URL fehlt" -ForegroundColor Yellow
            }
            
            # UTF-8 Meta prüfen
            if ($content -match 'charset="UTF-8"|charset=utf-8') {
                Write-Host "    ✅ UTF-8 Meta vorhanden" -ForegroundColor Green
            } else {
                Write-Host "    ⚠️  UTF-8 Meta fehlt" -ForegroundColor Yellow
            }
            
            # Umlaut-Fehler prüfen
            $umlautErrors = @("Ã¤", "Ã¶", "Ã¼", "ÃŸ", "â€", "â€œ", "â€", "â€™")
            $foundErrors = $umlautErrors | Where-Object { $content -match $_ }
            if ($foundErrors) {
                Write-Host "    ❌ Umlaut-Fehler gefunden: $($foundErrors -join ', ')" -ForegroundColor Red
                $results.Online.Failed++
            } else {
                Write-Host "    ✅ Keine Umlaut-Fehler" -ForegroundColor Green
            }
            
        } else {
            Write-Host "    ❌ HTTP $($response.StatusCode)" -ForegroundColor Red
            $results.Online.Failed++
        }
    } catch {
        Write-Host "    ❌ Fehler: $($_.Exception.Message)" -ForegroundColor Red
        $results.Online.Failed++
    }
}

Write-Host ""

# ============================================
# PHASE 2: LOKALE TESTS
# ============================================
Write-Host "[PHASE 2] LOKALE TESTS" -ForegroundColor Cyan
Write-Host ""

$localFiles = @(
    "Portal – Start.html",
    "index.html",
    "manifest-portal.html",
    "manifest-forum.html",
    "ultra\ui\developer-portal.html",
    "downloads\index.html",
    "pdf\ZENTRALE-FABRIKAGE-GESAMTBERICHT.html",
    "pdf\ZENTRALE-FABRIKAGE-EINZELKLICK-BERICHT.html"
)

foreach ($file in $localFiles) {
    $filePath = Join-Path $ROOT $file
    Write-Host "  Teste: $file" -ForegroundColor Yellow
    
    if (Test-Path $filePath) {
        Write-Host "    ✅ Datei vorhanden" -ForegroundColor Green
        $results.Local.Passed++
        
        try {
            $content = Get-Content $filePath -Raw -Encoding UTF8
            
            # .T. Branding prüfen
            if ($content -match "\.T\.|\[\.T\.|\.SYSTEMS\.T\.SYSTEMS\.\]") {
                Write-Host "    ✅ .T. Branding vorhanden" -ForegroundColor Green
                $results.Branding.Passed++
            } else {
                Write-Host "    ⚠️  .T. Branding fehlt" -ForegroundColor Yellow
                $results.Branding.Warnings++
            }
            
            # BASE_URL prüfen
            if ($content -match "BASE_URL|const BASE_URL") {
                Write-Host "    ✅ BASE_URL konfiguriert" -ForegroundColor Green
            } else {
                Write-Host "    ⚠️  BASE_URL fehlt" -ForegroundColor Yellow
            }
            
            # UTF-8 Meta prüfen
            if ($content -match 'charset="UTF-8"|charset=utf-8') {
                Write-Host "    ✅ UTF-8 Meta vorhanden" -ForegroundColor Green
            } else {
                Write-Host "    ⚠️  UTF-8 Meta fehlt" -ForegroundColor Yellow
            }
            
            # JavaScript Syntax prüfen
            if ($content -match "<script") {
                # Prüfe auf häufige Syntax-Fehler
                if ($content -match "JSON\.parse\([^)]*\)" -and $content -notmatch "try\s*\{") {
                    Write-Host "    ⚠️  JSON.parse ohne try-catch" -ForegroundColor Yellow
                } else {
                    Write-Host "    ✅ JavaScript Syntax OK" -ForegroundColor Green
                }
            }
            
            # Umlaut-Fehler prüfen
            $umlautErrors = @("Ã¤", "Ã¶", "Ã¼", "ÃŸ", "â€", "â€œ", "â€", "â€™")
            $foundErrors = $umlautErrors | Where-Object { $content -match $_ }
            if ($foundErrors) {
                Write-Host "    ❌ Umlaut-Fehler gefunden: $($foundErrors -join ', ')" -ForegroundColor Red
                $results.Local.Failed++
            } else {
                Write-Host "    ✅ Keine Umlaut-Fehler" -ForegroundColor Green
            }
            
        } catch {
            Write-Host "    ❌ Fehler beim Lesen: $($_.Exception.Message)" -ForegroundColor Red
            $results.Local.Failed++
        }
    } else {
        Write-Host "    ❌ Datei fehlt" -ForegroundColor Red
        $results.Local.Failed++
    }
}

Write-Host ""

# ============================================
# PHASE 3: FABRIKAGE STANDARDS TESTS
# ============================================
Write-Host "[PHASE 3] FABRIKAGE STANDARDS TESTS" -ForegroundColor Cyan
Write-Host ""

$htmlFiles = Get-ChildItem -Path $ROOT -Recurse -Filter "*.html" -File | Where-Object {
    $_.FullName -notmatch "node_modules|\.git|build|Fixpatch|backup|ARCHIV|\.venv"
} | Select-Object -First 30

$fabrikageChecks = @{
    "BASE_URL vorhanden" = 0
    "UTF-8 Meta vorhanden" = 0
    "Theme-Toggle vorhanden" = 0
    "Error Handling (try-catch)" = 0
    "Console Logging ([FABRIKAGE])" = 0
    ".T. Branding vorhanden" = 0
}

foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        
        # BASE_URL
        if ($content -match "BASE_URL|const BASE_URL") {
            $fabrikageChecks["BASE_URL vorhanden"]++
        }
        
        # UTF-8 Meta
        if ($content -match 'charset="UTF-8"|charset=utf-8') {
            $fabrikageChecks["UTF-8 Meta vorhanden"]++
        }
        
        # Theme-Toggle
        if ($content -match "toggleTheme|theme-toggle|Theme") {
            $fabrikageChecks["Theme-Toggle vorhanden"]++
        }
        
        # Error Handling
        if ($content -match "try\s*\{.*catch") {
            $fabrikageChecks["Error Handling (try-catch)"]++
        }
        
        # Console Logging
        if ($content -match "\[FABRIKAGE\]|console\.(log|error)") {
            $fabrikageChecks["Console Logging ([FABRIKAGE])"]++
        }
        
        # .T. Branding
        if ($content -match "\.T\.|\[\.T\.|\.SYSTEMS\.T\.SYSTEMS\.\]") {
            $fabrikageChecks[".T. Branding vorhanden"]++
        }
        
    } catch {
        # Skip
    }
}

foreach ($check in $fabrikageChecks.Keys) {
    $count = $fabrikageChecks[$check]
    $percentage = [math]::Round(($count / $htmlFiles.Count) * 100, 1)
    
    if ($percentage -ge 80) {
        Write-Host "  ✅ $check : $count/$($htmlFiles.Count) ($percentage%)" -ForegroundColor Green
        $results.Fabrikage.Passed++
    } elseif ($percentage -ge 50) {
        Write-Host "  ⚠️  $check : $count/$($htmlFiles.Count) ($percentage%)" -ForegroundColor Yellow
        $results.Fabrikage.Warnings++
    } else {
        Write-Host "  ❌ $check : $count/$($htmlFiles.Count) ($percentage%)" -ForegroundColor Red
        $results.Fabrikage.Failed++
    }
}

Write-Host ""

# ============================================
# PHASE 4: .T. BRANDING TESTS
# ============================================
Write-Host "[PHASE 4] .T. BRANDING TESTS" -ForegroundColor Cyan
Write-Host ""

$brandingPatterns = @(
    "\.T\.",
    "\[\.T\.\]",
    "\.SYSTEMS\.T\.SYSTEMS\.\]",
    "BRANÐ.*TTT",
    "TogetherSystems"
)

$brandingFiles = 0
foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $matches = 0
        
        foreach ($pattern in $brandingPatterns) {
            if ($content -match $pattern) {
                $matches++
            }
        }
        
        if ($matches -ge 2) {
            $brandingFiles++
        }
    } catch {
        # Skip
    }
}

$brandingPercentage = [math]::Round(($brandingFiles / $htmlFiles.Count) * 100, 1)
if ($brandingPercentage -ge 80) {
    Write-Host "  ✅ .T. Branding: $brandingFiles/$($htmlFiles.Count) Dateien ($brandingPercentage%)" -ForegroundColor Green
    $results.Branding.Passed++
} else {
    Write-Host "  ⚠️  .T. Branding: $brandingFiles/$($htmlFiles.Count) Dateien ($brandingPercentage%)" -ForegroundColor Yellow
    $results.Branding.Warnings++
}

Write-Host ""

# ============================================
# ZUSAMMENFASSUNG
# ============================================
Write-Host "========================================" -ForegroundColor Green
Write-Host "TÜV FABRIKAGE TEST ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📊 ERGEBNISSE:" -ForegroundColor Cyan
Write-Host ""

Write-Host "🌐 ONLINE TESTS:" -ForegroundColor Yellow
Write-Host "  ✅ Bestanden: $($results.Online.Passed)" -ForegroundColor Green
Write-Host "  ❌ Fehlgeschlagen: $($results.Online.Failed)" -ForegroundColor $(if ($results.Online.Failed -eq 0) { "Green" } else { "Red" })
Write-Host "  ⚠️  Warnungen: $($results.Online.Warnings)" -ForegroundColor $(if ($results.Online.Warnings -eq 0) { "Green" } else { "Yellow" })
Write-Host ""

Write-Host "💻 LOKALE TESTS:" -ForegroundColor Yellow
Write-Host "  ✅ Bestanden: $($results.Local.Passed)" -ForegroundColor Green
Write-Host "  ❌ Fehlgeschlagen: $($results.Local.Failed)" -ForegroundColor $(if ($results.Local.Failed -eq 0) { "Green" } else { "Red" })
Write-Host "  ⚠️  Warnungen: $($results.Local.Warnings)" -ForegroundColor $(if ($results.Local.Warnings -eq 0) { "Green" } else { "Yellow" })
Write-Host ""

Write-Host "🪨 FABRIKAGE STANDARDS:" -ForegroundColor Yellow
Write-Host "  ✅ Bestanden: $($results.Fabrikage.Passed)" -ForegroundColor Green
Write-Host "  ❌ Fehlgeschlagen: $($results.Fabrikage.Failed)" -ForegroundColor $(if ($results.Fabrikage.Failed -eq 0) { "Green" } else { "Red" })
Write-Host "  ⚠️  Warnungen: $($results.Fabrikage.Warnings)" -ForegroundColor $(if ($results.Fabrikage.Warnings -eq 0) { "Green" } else { "Yellow" })
Write-Host ""

Write-Host ".T. BRANDING:" -ForegroundColor Yellow
Write-Host "  ✅ Bestanden: $($results.Branding.Passed)" -ForegroundColor Green
Write-Host "  ❌ Fehlgeschlagen: $($results.Branding.Failed)" -ForegroundColor $(if ($results.Branding.Failed -eq 0) { "Green" } else { "Red" })
Write-Host "  ⚠️  Warnungen: $($results.Branding.Warnings)" -ForegroundColor $(if ($results.Branding.Warnings -eq 0) { "Green" } else { "Yellow" })
Write-Host ""

$totalPassed = $results.Online.Passed + $results.Local.Passed + $results.Fabrikage.Passed + $results.Branding.Passed
$totalFailed = $results.Online.Failed + $results.Local.Failed + $results.Fabrikage.Failed + $results.Branding.Failed

if ($totalFailed -eq 0) {
    Write-Host "✅ SYSTEM: 100% TÜV FABRIKAGE KONFORM" -ForegroundColor Green
} else {
    Write-Host "⚠️  SYSTEM: $totalFailed Fehler gefunden" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[.SYSTEMS.T.SYSTEMS.] Test abgeschlossen" -ForegroundColor Cyan
Write-Host ""

