# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE COMPLETE TEST - ALLE KOMPONENTEN
# Umfassender Test ALLER Komponenten im System (alt + neu)

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE COMPLETE TEST - ALLE KOMPONENTEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = $PSScriptRoot
$testResults = @()
$errors = @()
$warnings = @()
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

function Add-Result {
    param($Component, $Test, $Status, $Message)
    $testResults += @{
        Component = $Component
        Test = $Test
        Status = $Status
        Message = $Message
        Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    if ($Status -eq "ERROR") { $script:errors += "$Component - $Test : $Message" }
    if ($Status -eq "WARNING") { $script:warnings += "$Component - $Test : $Message" }
}

# ============================================
# PHASE 1: ALLE HTML-DATEIEN FINDEN
# ============================================

Write-Host "[PHASE 1] Finde ALLE HTML-Dateien..." -ForegroundColor Cyan

$allHtmlFiles = @()
$searchPaths = @(
    "CASHFLOX",
    "online",
    "ultra",
    "pdf",
    "downloads",
    "cloudflare-pages",
    "Portal – Start.html"
)

foreach ($path in $searchPaths) {
    $fullPath = Join-Path $rootDir $path
    if (Test-Path $fullPath) {
        $files = Get-ChildItem -Path $fullPath -Recurse -Filter "*.html" -ErrorAction SilentlyContinue
        $allHtmlFiles += $files
    }
}

# Root-Level HTML
$rootHtml = Get-ChildItem -Path $rootDir -Filter "*.html" -ErrorAction SilentlyContinue
$allHtmlFiles += $rootHtml

Write-Host "  Gefunden: $($allHtmlFiles.Count) HTML-Dateien" -ForegroundColor Green
Write-Host ""

# ============================================
# PHASE 2: DATEI-EXISTENZ & STRUKTUR (ALLE)
# ============================================

Write-Host "[PHASE 2] Datei-Existenz & Struktur prüfen (ALLE Komponenten)..." -ForegroundColor Cyan

$criticalFiles = @(
    @{ Path = "Portal – Start.html"; Component = "Portal Start" },
    @{ Path = "online\online\manifest-portal.html"; Component = "Manifest Portal" },
    @{ Path = "ultra\ui\developer-portal.html"; Component = "Developer Portal" },
    @{ Path = "CASHFLOX\Kassenbuch\kassenbuch.html"; Component = "Kassenbuch" },
    @{ Path = "CASHFLOX\KASSENBUCH-COMMUNICATION-LAYER.js"; Component = "Communication Layer" },
    @{ Path = "CASHFLOX\budget.html"; Component = "Budget" },
    @{ Path = "CASHFLOX\contract.html"; Component = "Contract" },
    @{ Path = "CASHFLOX\FLOCASHX.HTML"; Component = "Flowcashx" },
    @{ Path = "CASHFLOX\chflox.html"; Component = "Chflox" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\index.html"; Component = "Complete Package" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\decision-matrix.html"; Component = "Entscheidungsmatrix" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\notar.html"; Component = "Digitaler Notar" },
    @{ Path = "downloads\index.html"; Component = "Downloads Index" },
    @{ Path = "pdf\ZENTRALE-FABRIKAGE-GESAMTBERICHT.html"; Component = "Fabrikage Gesamtbericht" },
    @{ Path = "pdf\ZENTRALE-FABRIKAGE-EINZELKLICK-BERICHT.html"; Component = "Fabrikage Einzelklick-Bericht" }
)

foreach ($file in $criticalFiles) {
    $fullPath = Join-Path $rootDir $file.Path
    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length
        Add-Result -Component $file.Component -Test "Datei-Existenz" -Status "OK" -Message "Gefunden ($size bytes)"
    } else {
        Add-Result -Component $file.Component -Test "Datei-Existenz" -Status "ERROR" -Message "NICHT GEFUNDEN"
    }
}

# ============================================
# PHASE 3: ENCODING & UMLAUTE (ALLE HTML)
# ============================================

Write-Host ""
Write-Host "[PHASE 3] Encoding & Umlaute prüfen (ALLE HTML-Dateien)..." -ForegroundColor Cyan

$testedCount = 0
foreach ($file in $allHtmlFiles | Select-Object -First 50) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        $component = $file.Name
        
        # UTF-8 Meta-Tag
        if ($content -match '<meta\s+charset\s*=\s*["\']?utf-8["\']?\s*/?>' -or $content -match '<meta\s+charset\s*=\s*["\']?UTF-8["\']?\s*/?>') {
            Add-Result -Component $component -Test "UTF-8 Meta-Tag" -Status "OK" -Message "Vorhanden"
        } else {
            Add-Result -Component $component -Test "UTF-8 Meta-Tag" -Status "WARNING" -Message "Fehlt"
        }
        
        # Umlaut-Fehler
        $umlautErrors = @()
        if ($content -match 'â€¢') { $umlautErrors += "â€¢" }
        if ($content -match 'Ã¤') { $umlautErrors += "Ã¤" }
        if ($content -match 'Ã¶') { $umlautErrors += "Ã¶" }
        if ($content -match 'Ã¼') { $umlautErrors += "Ã¼" }
        if ($content -match 'ÃŸ') { $umlautErrors += "ÃŸ" }
        if ($content -match 'â€') { $umlautErrors += "â€" }
        
        if ($umlautErrors.Count -gt 0) {
            Add-Result -Component $component -Test "Umlaute" -Status "ERROR" -Message "Fehler gefunden: $($umlautErrors -join ', ')"
        } else {
            Add-Result -Component $component -Test "Umlaute" -Status "OK" -Message "Korrekt"
        }
        
        $testedCount++
    } catch {
        Add-Result -Component $file.Name -Test "Encoding-Prüfung" -Status "ERROR" -Message $_.Exception.Message
    }
}

Write-Host "  Getestet: $testedCount Dateien" -ForegroundColor Green

# ============================================
# PHASE 4: BASE_URL (ALLE HTML)
# ============================================

Write-Host ""
Write-Host "[PHASE 4] BASE_URL Konfiguration prüfen (ALLE HTML)..." -ForegroundColor Cyan

foreach ($file in $allHtmlFiles | Select-Object -First 50) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $component = $file.Name
        
        if ($content -match 'const\s+BASE_URL\s*=' -or $content -match 'BASE_URL\s*=' -or $content -match 'window\.location\.origin') {
            Add-Result -Component $component -Test "BASE_URL" -Status "OK" -Message "Konfiguriert"
        } else {
            Add-Result -Component $component -Test "BASE_URL" -Status "WARNING" -Message "Fehlt"
        }
    } catch {
        Add-Result -Component $file.Name -Test "BASE_URL-Prüfung" -Status "ERROR" -Message $_.Exception.Message
    }
}

# ============================================
# PHASE 5: JAVASCRIPT SYNTAX (ALLE HTML)
# ============================================

Write-Host ""
Write-Host "[PHASE 5] JavaScript Syntax prüfen (ALLE HTML)..." -ForegroundColor Cyan

foreach ($file in $allHtmlFiles | Select-Object -First 50) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $component = $file.Name
        
        if ($content -match '<script[^>]*>([\s\S]*?)</script>') {
            $jsContent = $matches[1]
            
            $syntaxErrors = @()
            
            # Klammern-Check
            $openParen = ([regex]::Matches($jsContent, '\(')).Count
            $closeParen = ([regex]::Matches($jsContent, '\)')).Count
            if ($openParen -ne $closeParen) {
                $syntaxErrors += "Klammern unausgewogen"
            }
            
            # Geschweifte Klammern
            $openBrace = ([regex]::Matches($jsContent, '\{')).Count
            $closeBrace = ([regex]::Matches($jsContent, '\}')).Count
            if ($openBrace -ne $closeBrace) {
                $syntaxErrors += "Geschweifte Klammern unausgewogen"
            }
            
            if ($syntaxErrors.Count -gt 0) {
                Add-Result -Component $component -Test "JavaScript Syntax" -Status "ERROR" -Message ($syntaxErrors -join ", ")
            } else {
                Add-Result -Component $component -Test "JavaScript Syntax" -Status "OK" -Message "Keine offensichtlichen Fehler"
            }
        }
    } catch {
        Add-Result -Component $file.Name -Test "JavaScript Syntax-Prüfung" -Status "ERROR" -Message $_.Exception.Message
    }
}

# ============================================
# PHASE 6: FABRIKAGE CONSOLE STANDARDS (ALLE)
# ============================================

Write-Host ""
Write-Host "[PHASE 6] Fabrikage Console Standards prüfen (ALLE)..." -ForegroundColor Cyan

foreach ($file in $allHtmlFiles | Select-Object -First 50) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $component = $file.Name
        
        $standards = @{
            "console.error mit [FABRIKAGE]" = ($content -match 'console\.error.*\[FABRIKAGE\]')
            "try-catch Blöcke" = ($content -match 'try\s*\{' -and $content -match 'catch\s*\(')
        }
        
        $missing = @()
        foreach ($standard in $standards.GetEnumerator()) {
            if (-not $standard.Value) {
                $missing += $standard.Key
            }
        }
        
        if ($missing.Count -gt 0) {
            Add-Result -Component $component -Test "Fabrikage Standards" -Status "WARNING" -Message "Fehlt: $($missing -join ', ')"
        } else {
            Add-Result -Component $component -Test "Fabrikage Standards" -Status "OK" -Message "Erfüllt"
        }
    } catch {
        Add-Result -Component $file.Name -Test "Fabrikage Standards-Prüfung" -Status "ERROR" -Message $_.Exception.Message
    }
}

# ============================================
# PHASE 7: BRANDING (.T. TOKEN) (ALLE)
# ============================================

Write-Host ""
Write-Host "[PHASE 7] Branding (.T. Token) prüfen (ALLE)..." -ForegroundColor Cyan

foreach ($file in $allHtmlFiles | Select-Object -First 50) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $component = $file.Name
        
        if ($content -match '\.T\.' -or $content -match 'osoto-brand-token' -or $content -match 'brand-token' -or $content -match '\[\.T\.') {
            Add-Result -Component $component -Test ".T. Branding" -Status "OK" -Message "Vorhanden"
        } else {
            Add-Result -Component $component -Test ".T. Branding" -Status "WARNING" -Message "Fehlt"
        }
    } catch {
        Add-Result -Component $file.Name -Test ".T. Branding-Prüfung" -Status "ERROR" -Message $_.Exception.Message
    }
}

# ============================================
# PHASE 8: KASSENBUCH INTEGRATION (ALLE APPS)
# ============================================

Write-Host ""
Write-Host "[PHASE 8] Kassenbuch-Integration prüfen (ALLE Apps)..." -ForegroundColor Cyan

$kassenbuchFiles = @(
    @{ Path = "CASHFLOX\Kassenbuch\kassenbuch.html"; Name = "Kassenbuch (Standalone)" },
    @{ Path = "CASHFLOX\budget.html"; Name = "Budget" },
    @{ Path = "CASHFLOX\contract.html"; Name = "Contract" },
    @{ Path = "CASHFLOX\FLOCASHX.HTML"; Name = "Flowcashx" },
    @{ Path = "CASHFLOX\chflox.html"; Name = "Chflox" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\kassenbuch.html"; Name = "Kassenbuch (Package)" }
)

foreach ($file in $kassenbuchFiles) {
    $fullPath = Join-Path $rootDir $file.Path
    if (Test-Path $fullPath) {
        try {
            $content = Get-Content $fullPath -Raw -Encoding UTF8
            
            if ($content -match 'kassenbuchModule' -or $content -match 'setFromKassenbuch' -or $content -match 'KASSENBUCH-COMMUNICATION-LAYER') {
                Add-Result -Component $file.Name -Test "Kassenbuch-Integration" -Status "OK" -Message "Integriert"
            } else {
                Add-Result -Component $file.Name -Test "Kassenbuch-Integration" -Status "WARNING" -Message "Keine Integration gefunden"
            }
        } catch {
            Add-Result -Component $file.Name -Test "Kassenbuch-Integration" -Status "ERROR" -Message $_.Exception.Message
        }
    }
}

# ============================================
# PHASE 9: DATENSCHUTZ (LÖSCHFUNKTION) (ALLE)
# ============================================

Write-Host ""
Write-Host "[PHASE 9] Datenschutz (Löschfunktion) prüfen..." -ForegroundColor Cyan

$privacyFiles = @(
    @{ Path = "CASHFLOX\Kassenbuch\kassenbuch.html"; Name = "Kassenbuch" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\notar.html"; Name = "Notar" },
    @{ Path = "online\online\manifest-portal.html"; Name = "Manifest Portal" },
    @{ Path = "Portal – Start.html"; Name = "Portal Start" }
)

foreach ($file in $privacyFiles) {
    $fullPath = Join-Path $rootDir $file.Path
    if (Test-Path $fullPath) {
        try {
            $content = Get-Content $fullPath -Raw -Encoding UTF8
            
            $checks = @{
                "Lösch-Button" = ($content -match 'löschen|clear|delete' -and ($content -match 'button' -or $content -match 'btn'))
                "localStorage.clear" = ($content -match 'localStorage\.clear')
            }
            
            $missing = @()
            foreach ($check in $checks.GetEnumerator()) {
                if (-not $check.Value) {
                    $missing += $check.Key
                }
            }
            
            if ($missing.Count -gt 0) {
                Add-Result -Component $file.Name -Test "Datenschutz" -Status "WARNING" -Message "Fehlt: $($missing -join ', ')"
            } else {
                Add-Result -Component $file.Name -Test "Datenschutz" -Status "OK" -Message "Vollständig"
            }
        } catch {
            Add-Result -Component $file.Name -Test "Datenschutz-Prüfung" -Status "ERROR" -Message $_.Exception.Message
        }
    }
}

# ============================================
# PHASE 10: COMPLETE PACKAGE & NEUE KOMPONENTEN
# ============================================

Write-Host ""
Write-Host "[PHASE 10] Complete Package & Neue Komponenten prüfen..." -ForegroundColor Cyan

$newComponents = @(
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\index.html"; Name = "Complete Package" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\decision-matrix.html"; Name = "Entscheidungsmatrix" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\notar.html"; Name = "Digitaler Notar" },
    @{ Path = "CASHFLOX\KASSENBUCH-COMMUNICATION-LAYER.js"; Name = "Communication Layer" }
)

foreach ($comp in $newComponents) {
    $fullPath = Join-Path $rootDir $comp.Path
    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length
        Add-Result -Component $comp.Name -Test "Existenz" -Status "OK" -Message "Gefunden ($size bytes)"
    } else {
        Add-Result -Component $comp.Name -Test "Existenz" -Status "ERROR" -Message "NICHT GEFUNDEN"
    }
}

# ============================================
# ZUSAMMENFASSUNG
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "TEST-ZUSAMMENFASSUNG - ALLE KOMPONENTEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$okCount = ($testResults | Where-Object { $_.Status -eq "OK" }).Count
$warningCount = ($testResults | Where-Object { $_.Status -eq "WARNING" }).Count
$errorCount = ($testResults | Where-Object { $_.Status -eq "ERROR" }).Count
$totalCount = $testResults.Count

Write-Host "Gesamt-Tests: $totalCount" -ForegroundColor Cyan
Write-Host "  ✅ OK: $okCount" -ForegroundColor Green
Write-Host "  ⚠️  WARNINGS: $warningCount" -ForegroundColor Yellow
Write-Host "  ❌ ERRORS: $errorCount" -ForegroundColor Red
Write-Host ""

Write-Host "Getestete HTML-Dateien: $($allHtmlFiles.Count)" -ForegroundColor Cyan
Write-Host ""

if ($errors.Count -gt 0) {
    Write-Host "FEHLER:" -ForegroundColor Red
    $errors | Select-Object -First 10 | ForEach-Object { Write-Host "  ❌ $_" -ForegroundColor Red }
    if ($errors.Count -gt 10) {
        Write-Host "  ... und $($errors.Count - 10) weitere" -ForegroundColor Red
    }
    Write-Host ""
}

if ($warnings.Count -gt 0) {
    Write-Host "WARNINGS:" -ForegroundColor Yellow
    $warnings | Select-Object -First 10 | ForEach-Object { Write-Host "  ⚠️  $_" -ForegroundColor Yellow }
    if ($warnings.Count -gt 10) {
        Write-Host "  ... und $($warnings.Count - 10) weitere" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Exportiere Ergebnisse
$resultsPath = Join-Path $rootDir "FABRIKAGE-TEST-ALL-COMPONENTS-$timestamp.json"
$testResults | ConvertTo-Json -Depth 10 | Set-Content -Path $resultsPath -Encoding UTF8

Write-Host "Ergebnisse exportiert: $resultsPath" -ForegroundColor Cyan
Write-Host ""

if ($errorCount -eq 0) {
    Write-Host "✅ FABRIKAGE TEST ERFOLGREICH (ALLE KOMPONENTEN)" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ FABRIKAGE TEST MIT FEHLERN" -ForegroundColor Red
    exit 1
}
