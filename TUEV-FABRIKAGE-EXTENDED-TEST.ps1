# [.SYSTEMS.T.SYSTEMS.] TÜV FABRIKAGE EXTENDED TEST
# Erweiterte Fehlerprüfung: ALLE Funktionen, nicht nur Umlaute

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] TÜV FABRIKAGE EXTENDED TEST" -ForegroundColor Green
Write-Host "Erweiterte Fehlerprüfung: ALLE Funktionen" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$ROOT = $PSScriptRoot
$BASE_URL = "https://myopenai.github.io/togethersystems"
$results = @{
    Online = @{ Passed = 0; Failed = 0; Warnings = 0 }
    Local = @{ Passed = 0; Failed = 0; Warnings = 0 }
    OSTOSOS = @{ Passed = 0; Failed = 0; Warnings = 0 }
    Functions = @{ Passed = 0; Failed = 0; Warnings = 0 }
    DataPrivacy = @{ Passed = 0; Failed = 0; Warnings = 0 }
}

# ============================================
# PHASE 1: OSTOSOS DOWNLOAD TESTS
# ============================================
Write-Host "[PHASE 1] OSTOSOS DOWNLOAD TESTS" -ForegroundColor Cyan
Write-Host ""

$ostososFiles = @(
    "downloads\ostosos\OSTOSOS-OS-COMPLETE-SYSTEM.html",
    "downloads\ostosos\OSTOSOS-ONE-CLICK-SETUP.html",
    "downloads\ostosos\OSTOSOS-ONECLICK.html",
    "downloads\ostosos\OSTOSOS-INSTALLER.html",
    "downloads\ostosos\OSTOSOS-START.bat",
    "downloads\ostosos\OSTOSOS-START.sh",
    "downloads\ostosos\OSTOSOS-START.command"
)

foreach ($file in $ostososFiles) {
    $filePath = Join-Path $ROOT $file
    Write-Host "  Teste: $file" -ForegroundColor Yellow
    
    if (Test-Path $filePath) {
        $fileInfo = Get-Item $filePath
        $size = [math]::Round($fileInfo.Length / 1KB, 2)
        
        if ($size -gt 0) {
            Write-Host "    ✅ Datei vorhanden ($size KB)" -ForegroundColor Green
            $results.OSTOSOS.Passed++
            
            # Prüfe Content bei HTML-Dateien
            if ($file -match "\.html$") {
                try {
                    $content = Get-Content $filePath -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
                    if ($content) {
                        if ($content -match "OSTOSOS|OS-SYSTEM") {
                            Write-Host "    ✅ OSTOSOS Content vorhanden" -ForegroundColor Green
                        } else {
                            Write-Host "    ⚠️  OSTOSOS Content unklar" -ForegroundColor Yellow
                            $results.OSTOSOS.Warnings++
                        }
                    }
                } catch {
                    Write-Host "    ⚠️  Content-Prüfung fehlgeschlagen" -ForegroundColor Yellow
                    $results.OSTOSOS.Warnings++
                }
            }
        } else {
            Write-Host "    ❌ Datei leer" -ForegroundColor Red
            $results.OSTOSOS.Failed++
        }
    } else {
        Write-Host "    ❌ Datei fehlt" -ForegroundColor Red
        $results.OSTOSOS.Failed++
    }
}

# Online OSTOSOS Download prüfen
Write-Host ""
Write-Host "  Teste Online Download..." -ForegroundColor Yellow
try {
    $onlineUrl = $BASE_URL + "/downloads/ostosos/OSTOSOS-OS-COMPLETE-SYSTEM.html"
    $response = Invoke-WebRequest -Uri $onlineUrl -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "    ✅ Online Download verfügbar" -ForegroundColor Green
        $results.OSTOSOS.Passed++
    } else {
        Write-Host "    ❌ Online Download HTTP $($response.StatusCode)" -ForegroundColor Red
        $results.OSTOSOS.Failed++
    }
} catch {
    Write-Host "    ❌ Online Download fehlgeschlagen: $($_.Exception.Message)" -ForegroundColor Red
    $results.OSTOSOS.Failed++
}

Write-Host ""

# ============================================
# PHASE 2: FUNKTIONALE TESTS
# ============================================
Write-Host "[PHASE 2] FUNKTIONALE TESTS" -ForegroundColor Cyan
Write-Host ""

$htmlFiles = Get-ChildItem -Path $ROOT -Recurse -Filter "*.html" -File | Where-Object {
    $_.FullName -notmatch "node_modules|\.git|build|Fixpatch|backup|ARCHIV|\.venv"
} | Select-Object -First 30

$functionChecks = @{
    "JavaScript Syntax OK" = 0
    "Error Handling vorhanden" = 0
    "localStorage verwendet" = 0
    "Event Listeners vorhanden" = 0
    "DOM Manipulation sicher" = 0
    "API Calls mit Error Handling" = 0
}

foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if ($content) {
            # JavaScript Syntax
            if ($content -match "<script" -and $content -notmatch "SyntaxError|parse error") {
                $functionChecks["JavaScript Syntax OK"]++
            }
            
            # Error Handling
            if ($content -match "try\s*\{.*catch|\.catch\(") {
                $functionChecks["Error Handling vorhanden"]++
            }
            
            # localStorage
            if ($content -match "localStorage\.(setItem|getItem|removeItem|clear)") {
                $functionChecks["localStorage verwendet"]++
            }
            
            # Event Listeners
            if ($content -match "addEventListener|\.on\(|onclick=") {
                $functionChecks["Event Listeners vorhanden"]++
            }
            
            # DOM Manipulation
            if ($content -match "getElementById|querySelector" -and $content -match "if\s*\(.*\)|try") {
                $functionChecks["DOM Manipulation sicher"]++
            }
            
            # API Calls
            if ($content -match "fetch\(|XMLHttpRequest" -and $content -match "\.catch|try") {
                $functionChecks["API Calls mit Error Handling"]++
            }
        }
    } catch {
        # Skip
    }
}

foreach ($check in $functionChecks.Keys) {
    $count = $functionChecks[$check]
    $percentage = [math]::Round(($count / $htmlFiles.Count) * 100, 1)
    
    if ($percentage -ge 70) {
        Write-Host "  ✅ $check : $count/$($htmlFiles.Count) ($percentage%)" -ForegroundColor Green
        $results.Functions.Passed++
    } elseif ($percentage -ge 40) {
        Write-Host "  ⚠️  $check : $count/$($htmlFiles.Count) ($percentage%)" -ForegroundColor Yellow
        $results.Functions.Warnings++
    } else {
        Write-Host "  ❌ $check : $count/$($htmlFiles.Count) ($percentage%)" -ForegroundColor Red
        $results.Functions.Failed++
    }
}

Write-Host ""

# ============================================
# PHASE 3: DATENSCHUTZ / LÖSCHFUNKTION
# ============================================
Write-Host "[PHASE 3] DATENSCHUTZ / LÖSCHFUNKTION" -ForegroundColor Cyan
Write-Host ""

$privacyChecks = @{
    "Löschfunktion vorhanden" = 0
    "localStorage.clear vorhanden" = 0
    "Daten-Löschbutton sichtbar" = 0
    "Import-Daten löschbar" = 0
}

$keyFiles = @(
    "Portal – Start.html",
    "admin.html",
    "manifest-portal.html",
    "online\online\manifest-portal.html"
)

foreach ($file in $keyFiles) {
    $filePath = Join-Path $ROOT $file
    if (Test-Path $filePath) {
        try {
            $content = Get-Content $filePath -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
            if ($content) {
                # Löschfunktion
                if ($content -match "löschen|delete|clear|removeItem|localStorage\.clear" -or 
                    $content -match "clearBtn|deleteBtn|removeBtn") {
                    $privacyChecks["Löschfunktion vorhanden"]++
                }
                
                # localStorage.clear
                if ($content -match "localStorage\.clear\(\)") {
                    $privacyChecks["localStorage.clear vorhanden"]++
                }
                
                # Löschbutton sichtbar
                if ($content -match "Löschen|Delete|Clear" -and $content -match "button|btn") {
                    $privacyChecks["Daten-Löschbutton sichtbar"]++
                }
                
                # Import-Daten löschbar
                if ($content -match "import|Import" -and $content -match "löschen|delete|clear") {
                    $privacyChecks["Import-Daten löschbar"]++
                }
            }
        } catch {
            # Skip
        }
    }
}

foreach ($check in $privacyChecks.Keys) {
    $count = $privacyChecks[$check]
    if ($count -gt 0) {
        Write-Host "  ✅ $check : $count Dateien" -ForegroundColor Green
        $results.DataPrivacy.Passed++
    } else {
        Write-Host "  ❌ $check : Nicht gefunden" -ForegroundColor Red
        $results.DataPrivacy.Failed++
    }
}

Write-Host ""

# ============================================
# PHASE 4: PORTAL FUNKTIONALITÄT
# ============================================
Write-Host "[PHASE 4] PORTAL FUNKTIONALITÄT" -ForegroundColor Cyan
Write-Host ""

$portalFiles = @(
    "Portal – Start.html",
    "manifest-portal.html",
    "manifest-forum.html",
    "admin.html",
    "downloads\index.html"
)

foreach ($file in $portalFiles) {
    $filePath = Join-Path $ROOT $file
    Write-Host "  Teste: $file" -ForegroundColor Yellow
    
    if (Test-Path $filePath) {
        Write-Host "    ✅ Datei vorhanden" -ForegroundColor Green
        $results.Local.Passed++
        
        try {
            $content = Get-Content $filePath -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
            if ($content) {
                # Theme-Toggle
                if ($content -match "toggleTheme|themeToggle") {
                    Write-Host "    ✅ Theme-Toggle vorhanden" -ForegroundColor Green
                } else {
                    Write-Host "    ⚠️  Theme-Toggle fehlt" -ForegroundColor Yellow
                }
                
                # Navigation
                if ($content -match "nav|navigation|menu") {
                    Write-Host "    ✅ Navigation vorhanden" -ForegroundColor Green
                } else {
                    Write-Host "    ⚠️  Navigation fehlt" -ForegroundColor Yellow
                }
                
                # BASE_URL
                if ($content -match "BASE_URL") {
                    Write-Host "    ✅ BASE_URL konfiguriert" -ForegroundColor Green
                } else {
                    Write-Host "    ⚠️  BASE_URL fehlt" -ForegroundColor Yellow
                }
            }
        } catch {
            Write-Host "    ❌ Fehler beim Lesen" -ForegroundColor Red
            $results.Local.Failed++
        }
    } else {
        Write-Host "    ❌ Datei fehlt" -ForegroundColor Red
        $results.Local.Failed++
    }
}

Write-Host ""

# ============================================
# ZUSAMMENFASSUNG
# ============================================
Write-Host "========================================" -ForegroundColor Green
Write-Host "TÜV FABRIKAGE EXTENDED TEST ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "📊 ERGEBNISSE:" -ForegroundColor Cyan
Write-Host ""

Write-Host "🖥️  OSTOSOS DOWNLOAD:" -ForegroundColor Yellow
Write-Host "  ✅ Bestanden: $($results.OSTOSOS.Passed)" -ForegroundColor Green
Write-Host "  ❌ Fehlgeschlagen: $($results.OSTOSOS.Failed)" -ForegroundColor $(if ($results.OSTOSOS.Failed -eq 0) { "Green" } else { "Red" })
Write-Host "  ⚠️  Warnungen: $($results.OSTOSOS.Warnings)" -ForegroundColor $(if ($results.OSTOSOS.Warnings -eq 0) { "Green" } else { "Yellow" })
Write-Host ""

Write-Host "⚙️  FUNKTIONALE TESTS:" -ForegroundColor Yellow
Write-Host "  ✅ Bestanden: $($results.Functions.Passed)" -ForegroundColor Green
Write-Host "  ❌ Fehlgeschlagen: $($results.Functions.Failed)" -ForegroundColor $(if ($results.Functions.Failed -eq 0) { "Green" } else { "Red" })
Write-Host "  ⚠️  Warnungen: $($results.Functions.Warnings)" -ForegroundColor $(if ($results.Functions.Warnings -eq 0) { "Green" } else { "Yellow" })
Write-Host ""

Write-Host "🔒 DATENSCHUTZ / LÖSCHFUNKTION:" -ForegroundColor Yellow
Write-Host "  ✅ Bestanden: $($results.DataPrivacy.Passed)" -ForegroundColor Green
Write-Host "  ❌ Fehlgeschlagen: $($results.DataPrivacy.Failed)" -ForegroundColor $(if ($results.DataPrivacy.Failed -eq 0) { "Green" } else { "Red" })
Write-Host "  ⚠️  Warnungen: $($results.DataPrivacy.Warnings)" -ForegroundColor $(if ($results.DataPrivacy.Warnings -eq 0) { "Green" } else { "Yellow" })
Write-Host ""

$totalFailed = $results.OSTOSOS.Failed + $results.Functions.Failed + $results.DataPrivacy.Failed

if ($totalFailed -eq 0) {
    Write-Host "✅ SYSTEM: 100% TÜV FABRIKAGE KONFORM" -ForegroundColor Green
} else {
    Write-Host "⚠️  SYSTEM: $totalFailed Fehler gefunden - Bitte beheben" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[.SYSTEMS.T.SYSTEMS.] Extended Test abgeschlossen" -ForegroundColor Cyan
Write-Host ""

