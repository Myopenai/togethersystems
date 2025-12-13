# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE COMPLETE TEST - ALLE KOMPONENTEN
# Umfassender Test aller neuen Komponenten und Integrationen

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE COMPLETE TEST" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = $PSScriptRoot
$testResults = @()
$errors = @()
$warnings = @()

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
# PHASE 1: DATEI-EXISTENZ & STRUKTUR
# ============================================

Write-Host "[PHASE 1] Datei-Existenz & Struktur prüfen..." -ForegroundColor Cyan

$filesToCheck = @(
    @{ Path = "CASHFLOX\Kassenbuch\kassenbuch.html"; Component = "Kassenbuch" },
    @{ Path = "CASHFLOX\KASSENBUCH-COMMUNICATION-LAYER.js"; Component = "Communication Layer" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\index.html"; Component = "Complete Package" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\decision-matrix.html"; Component = "Entscheidungsmatrix" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\notar.html"; Component = "Digitaler Notar" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\kassenbuch.html"; Component = "Kassenbuch (Package)" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\budget.html"; Component = "Budget (Package)" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\contract.html"; Component = "Contract (Package)" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\flowcashx.html"; Component = "Flowcashx (Package)" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\chflox.html"; Component = "Chflox (Package)" },
    @{ Path = "CASHFLOX\budget.html"; Component = "Budget (Original)" },
    @{ Path = "CASHFLOX\contract.html"; Component = "Contract (Original)" },
    @{ Path = "CASHFLOX\FLOCASHX.HTML"; Component = "Flowcashx (Original)" },
    @{ Path = "CASHFLOX\chflox.html"; Component = "Chflox (Original)" },
    @{ Path = "downloads\index.html"; Component = "Downloads Index" },
    @{ Path = "downloads\kassenbuch\kassenbuch.html"; Component = "Kassenbuch Download" }
)

foreach ($file in $filesToCheck) {
    $fullPath = Join-Path $rootDir $file.Path
    if (Test-Path $fullPath) {
        $size = (Get-Item $fullPath).Length
        Add-Result -Component $file.Component -Test "Datei-Existenz" -Status "OK" -Message "Gefunden ($size bytes)"
    } else {
        Add-Result -Component $file.Component -Test "Datei-Existenz" -Status "ERROR" -Message "NICHT GEFUNDEN"
    }
}

# ============================================
# PHASE 2: ENCODING & UMLAUTE
# ============================================

Write-Host ""
Write-Host "[PHASE 2] Encoding & Umlaute prüfen..." -ForegroundColor Cyan

$htmlFiles = Get-ChildItem -Path (Join-Path $rootDir "CASHFLOX") -Recurse -Filter "*.html" | Select-Object -First 20

foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $component = $file.Name
        
        # Prüfe UTF-8 Meta-Tag
        if ($content -match '<meta\s+charset\s*=\s*["\']?utf-8["\']?\s*/?>' -or $content -match '<meta\s+charset\s*=\s*["\']?UTF-8["\']?\s*/?>') {
            Add-Result -Component $component -Test "UTF-8 Meta-Tag" -Status "OK" -Message "Vorhanden"
        } else {
            Add-Result -Component $component -Test "UTF-8 Meta-Tag" -Status "WARNING" -Message "Fehlt"
        }
        
        # Prüfe Umlaute
        $umlautErrors = @()
        if ($content -match '•') { $umlautErrors += "• statt •" }
        if ($content -match 'ä') { $umlautErrors += "ä statt ä" }
        if ($content -match 'ö') { $umlautErrors += "ö statt ö" }
        if ($content -match 'ü') { $umlautErrors += "ü statt ü" }
        if ($content -match 'ß') { $umlautErrors += "ß statt ß" }
        
        if ($umlautErrors.Count -gt 0) {
            Add-Result -Component $component -Test "Umlaute" -Status "ERROR" -Message ($umlautErrors -join ", ")
        } else {
            Add-Result -Component $component -Test "Umlaute" -Status "OK" -Message "Korrekt"
        }
    } catch {
        Add-Result -Component $file.Name -Test "Encoding-Prüfung" -Status "ERROR" -Message $_.Exception.Message
    }
}

# ============================================
# PHASE 3: BASE_URL KONFIGURATION
# ============================================

Write-Host ""
Write-Host "[PHASE 3] BASE_URL Konfiguration prüfen..." -ForegroundColor Cyan

foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $component = $file.Name
        
        if ($content -match 'const\s+BASE_URL\s*=' -or $content -match 'BASE_URL\s*=') {
            Add-Result -Component $component -Test "BASE_URL" -Status "OK" -Message "Konfiguriert"
        } else {
            Add-Result -Component $component -Test "BASE_URL" -Status "WARNING" -Message "Fehlt"
        }
    } catch {
        Add-Result -Component $file.Name -Test "BASE_URL-Prüfung" -Status "ERROR" -Message $_.Exception.Message
    }
}

# ============================================
# PHASE 4: JAVASCRIPT SYNTAX
# ============================================

Write-Host ""
Write-Host "[PHASE 4] JavaScript Syntax prüfen..." -ForegroundColor Cyan

foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $component = $file.Name
        
        # Extrahiere JavaScript
        if ($content -match '<script[^>]*>(.*?)</script>' -or $content -match '<script[^>]*>([\s\S]*?)</script>') {
            $jsContent = $matches[1]
            
            # Prüfe auf häufige Syntax-Fehler
            $syntaxErrors = @()
            
            # Fehlende Klammern
            $openParen = ([regex]::Matches($jsContent, '\(')).Count
            $closeParen = ([regex]::Matches($jsContent, '\)')).Count
            if ($openParen -ne $closeParen) {
                $syntaxErrors += "Klammern unausgewogen ($openParen öffnend, $closeParen schließend)"
            }
            
            # Fehlende geschweifte Klammern
            $openBrace = ([regex]::Matches($jsContent, '\{')).Count
            $closeBrace = ([regex]::Matches($jsContent, '\}')).Count
            if ($openBrace -ne $closeBrace) {
                $syntaxErrors += "Geschweifte Klammern unausgewogen ($openBrace öffnend, $closeBrace schließend)"
            }
            
            # try-catch Blöcke
            if ($jsContent -match 'try\s*\{' -and -not ($jsContent -match 'catch\s*\(')) {
                $syntaxErrors += "try ohne catch"
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
# PHASE 5: FABRIKAGE CONSOLE STANDARDS
# ============================================

Write-Host ""
Write-Host "[PHASE 5] Fabrikage Console Standards prüfen..." -ForegroundColor Cyan

foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $component = $file.Name
        
        $standards = @{
            "console.error mit [FABRIKAGE]" = ($content -match 'console\.error.*\[FABRIKAGE\]')
            "try-catch Blöcke" = ($content -match 'try\s*\{' -and $content -match 'catch\s*\(')
            "BASE_URL vorhanden" = ($content -match 'BASE_URL')
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
# PHASE 6: KASSENBUCH INTEGRATION
# ============================================

Write-Host ""
Write-Host "[PHASE 6] Kassenbuch-Integration prüfen..." -ForegroundColor Cyan

$kassenbuchFiles = @(
    @{ Path = "CASHFLOX\Kassenbuch\kassenbuch.html"; Name = "Kassenbuch (Standalone)" },
    @{ Path = "CASHFLOX\budget.html"; Name = "Budget" },
    @{ Path = "CASHFLOX\contract.html"; Name = "Contract" },
    @{ Path = "CASHFLOX\FLOCASHX.HTML"; Name = "Flowcashx" },
    @{ Path = "CASHFLOX\chflox.html"; Name = "Chflox" }
)

foreach ($file in $kassenbuchFiles) {
    $fullPath = Join-Path $rootDir $file.Path
    if (Test-Path $fullPath) {
        try {
            $content = Get-Content $fullPath -Raw -Encoding UTF8
            
            # Prüfe auf kassenbuchModule Interface
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
# PHASE 7: COMMUNICATION LAYER
# ============================================

Write-Host ""
Write-Host "[PHASE 7] Communication Layer prüfen..." -ForegroundColor Cyan

$commLayerPath = Join-Path $rootDir "CASHFLOX\KASSENBUCH-COMMUNICATION-LAYER.js"
if (Test-Path $commLayerPath) {
    try {
        $content = Get-Content $commLayerPath -Raw -Encoding UTF8
        
        $checks = @{
            "cashflowHub definiert" = ($content -match 'window\.cashflowHub')
            "registerApp Funktion" = ($content -match 'registerApp')
            "syncAll Funktion" = ($content -match 'syncAll')
            "Auto-Sync Intervall" = ($content -match 'setInterval')
        }
        
        $missing = @()
        foreach ($check in $checks.GetEnumerator()) {
            if (-not $check.Value) {
                $missing += $check.Key
            }
        }
        
        if ($missing.Count -gt 0) {
            Add-Result -Component "Communication Layer" -Test "Funktionen" -Status "WARNING" -Message "Fehlt: $($missing -join ', ')"
        } else {
            Add-Result -Component "Communication Layer" -Test "Funktionen" -Status "OK" -Message "Alle Funktionen vorhanden"
        }
    } catch {
        Add-Result -Component "Communication Layer" -Test "Prüfung" -Status "ERROR" -Message $_.Exception.Message
    }
} else {
    Add-Result -Component "Communication Layer" -Test "Datei-Existenz" -Status "ERROR" -Message "NICHT GEFUNDEN"
}

# ============================================
# PHASE 8: BRANDING (.T. TOKEN)
# ============================================

Write-Host ""
Write-Host "[PHASE 8] Branding (.T. Token) prüfen..." -ForegroundColor Cyan

foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $component = $file.Name
        
        if ($content -match '\.T\.' -or $content -match 'osoto-brand-token' -or $content -match 'brand-token') {
            Add-Result -Component $component -Test ".T. Branding" -Status "OK" -Message "Vorhanden"
        } else {
            Add-Result -Component $component -Test ".T. Branding" -Status "WARNING" -Message "Fehlt"
        }
    } catch {
        Add-Result -Component $file.Name -Test ".T. Branding-Prüfung" -Status "ERROR" -Message $_.Exception.Message
    }
}

# ============================================
# PHASE 9: DATENSCHUTZ (LÖSCHFUNKTION)
# ============================================

Write-Host ""
Write-Host "[PHASE 9] Datenschutz (Löschfunktion) prüfen..." -ForegroundColor Cyan

$privacyFiles = @(
    @{ Path = "CASHFLOX\Kassenbuch\kassenbuch.html"; Name = "Kassenbuch" },
    @{ Path = "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\apps\notar.html"; Name = "Notar" },
    @{ Path = "online\online\manifest-portal.html"; Name = "Manifest Portal" }
)

foreach ($file in $privacyFiles) {
    $fullPath = Join-Path $rootDir $file.Path
    if (Test-Path $fullPath) {
        try {
            $content = Get-Content $fullPath -Raw -Encoding UTF8
            
            $checks = @{
                "Lösch-Button" = ($content -match 'löschen|clear|delete' -and ($content -match 'button' -or $content -match 'btn'))
                "localStorage.clear" = ($content -match 'localStorage\.clear')
                "Bestätigungs-Dialog" = ($content -match 'confirm')
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
# PHASE 10: COMPLETE PACKAGE INTEGRATION
# ============================================

Write-Host ""
Write-Host "[PHASE 10] Complete Package Integration prüfen..." -ForegroundColor Cyan

$packagePath = Join-Path $rootDir "CASHFLOX\TOGETHERSYSTEMS-COMPLETE-PACKAGE\index.html"
if (Test-Path $packagePath) {
    try {
        $content = Get-Content $packagePath -Raw -Encoding UTF8
        
        $apps = @("kassenbuch", "budget", "contract", "flowcashx", "chflox", "notar", "decision-matrix")
        $foundApps = @()
        
        foreach ($app in $apps) {
            if ($content -match $app) {
                $foundApps += $app
            }
        }
        
        if ($foundApps.Count -eq $apps.Count) {
            Add-Result -Component "Complete Package" -Test "App-Integration" -Status "OK" -Message "Alle Apps integriert"
        } else {
            $missing = $apps | Where-Object { $foundApps -notcontains $_ }
            Add-Result -Component "Complete Package" -Test "App-Integration" -Status "WARNING" -Message "Fehlt: $($missing -join ', ')"
        }
    } catch {
        Add-Result -Component "Complete Package" -Test "Integration-Prüfung" -Status "ERROR" -Message $_.Exception.Message
    }
}

# ============================================
# ZUSAMMENFASSUNG
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "TEST-ZUSAMMENFASSUNG" -ForegroundColor Green
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

if ($errors.Count -gt 0) {
    Write-Host "FEHLER:" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "  ❌ $_" -ForegroundColor Red }
    Write-Host ""
}

if ($warnings.Count -gt 0) {
    Write-Host "WARNINGS:" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "  ⚠️  $_" -ForegroundColor Yellow }
    Write-Host ""
}

# Exportiere Ergebnisse
$resultsPath = Join-Path $rootDir "FABRIKAGE-TEST-RESULTS-$timestamp.json"
$testResults | ConvertTo-Json -Depth 10 | Set-Content -Path $resultsPath -Encoding UTF8

Write-Host "Ergebnisse exportiert: $resultsPath" -ForegroundColor Cyan
Write-Host ""

if ($errorCount -eq 0) {
    Write-Host "✅ FABRIKAGE TEST ERFOLGREICH" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ FABRIKAGE TEST MIT FEHLERN" -ForegroundColor Red
    exit 1
}
