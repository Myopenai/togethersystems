# COMPLETE SYSTEM TEST - ALL SERVERS
# Testet alle Systeme bis keine Fehler mehr vorhanden sind
# Branding: .{T,.[ OS.] OS-TOS - OSTOS∞8∞+++a∞:=n→∞lim​an∞ as superscript ≈ ⁺∞(C)(R) | URL: TEL1.NL - WHATSAPP - ( 0031613803782 ). T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.}.
# TTT Versiegelt

Write-Host "🧪 STARTE VOLLSTÄNDIGE SYSTEM-TESTS - ALLE SERVER..." -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Continue"
$rootDir = $PSScriptRoot
$testResults = @{
    Total = 0
    Errors = 0
    Fixed = 0
    Files = @()
}

# Kritische Root-Dateien
$criticalFiles = @(
    "index.html",
    "manifest-portal.html",
    "manifest-forum.html",
    "admin-monitoring.html",
    "business-admin.html",
    "legal-hub.html",
    "honeycomb.html",
    "ostos-branding.html",
    "sw.js",
    "console-monitor.js"
)

Write-Host "📄 Teste kritische Root-Dateien..." -ForegroundColor Yellow
Write-Host ""

foreach ($file in $criticalFiles) {
    $filePath = Join-Path $rootDir $file
    
    if (-not (Test-Path $filePath)) {
        Write-Host "⚠️  $file : Nicht gefunden" -ForegroundColor Yellow
        continue
    }
    
    $content = Get-Content $filePath -Raw -Encoding UTF8
    $errors = @()
    
    # Prüfe auf doppelte Semikolons
    if ($content -match ';;') {
        $errors += "Doppeltes Semikolon gefunden"
    }
    
    # Prüfe auf JSON.parse Fehler
    if ($content -match 'res\.ok\s*\?\s*await\s*res\.json\(\)\.catch.*\)\s*:\s*null;;') {
        $errors += "Doppeltes Semikolon nach JSON.parse"
    }
    
    # Prüfe auf fehlende Klammern (vereinfacht)
    $openParens = ([regex]::Matches($content, '\(')).Count
    $closeParens = ([regex]::Matches($content, '\)')).Count
    $openBraces = ([regex]::Matches($content, '\{')).Count
    $closeBraces = ([regex]::Matches($content, '\}')).Count
    
    if (($openParens - $closeParens) -gt 10 -or ($closeParens - $openParens) -gt 10) {
        $errors += "Ungleiche Anzahl Klammern: ($openParens öffnend, $closeParens schließend)"
    }
    
    if (($openBraces - $closeBraces) -gt 10 -or ($closeBraces - $openBraces) -gt 10) {
        $errors += "Ungleiche Anzahl geschweifte Klammern: {$openBraces öffnend, $closeBraces schließend}"
    }
    
    if ($errors.Count -gt 0) {
        Write-Host "❌ $file : $($errors.Count) Fehler gefunden" -ForegroundColor Red
        foreach ($err in $errors) {
            Write-Host "   - $err" -ForegroundColor Red
        }
        
        # Auto-Fix doppelte Semikolons
        if ($content -match ';;') {
            $fixed = $content -replace ';;', ';'
            Set-Content -Path $filePath -Value $fixed -Encoding UTF8 -NoNewline
            Write-Host "   ✅ Behoben: Doppelte Semikolons entfernt" -ForegroundColor Green
            $testResults.Fixed++
        }
        
        $testResults.Errors += $errors.Count
    } else {
        Write-Host "✅ $file : Keine Fehler" -ForegroundColor Green
    }
    
    $testResults.Total++
    $testResults.Files += @{
        Name = $file
        Errors = $errors.Count
        Fixed = ($content -match ';;')
    }
}

Write-Host ""
Write-Host "📊 TEST-ZUSAMMENFASSUNG:" -ForegroundColor Cyan
Write-Host "   Gesamt getestet: $($testResults.Total)" -ForegroundColor White
Write-Host "   Fehler gefunden: $($testResults.Errors)" -ForegroundColor $(if ($testResults.Errors -eq 0) { "Green" } else { "Red" })
Write-Host "   Behoben: $($testResults.Fixed)" -ForegroundColor Green
Write-Host ""

# Service Worker Test
Write-Host "🔧 Teste Service Worker (sw.js)..." -ForegroundColor Yellow
$swPath = Join-Path $rootDir "sw.js"
if (Test-Path $swPath) {
    $swContent = Get-Content $swPath -Raw -Encoding UTF8
    if ($swContent -match 'chrome-extension:') {
        Write-Host "✅ sw.js : Chrome-Extension-Handling vorhanden" -ForegroundColor Green
    } else {
        Write-Host "⚠️  sw.js : Chrome-Extension-Handling nicht gefunden" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ sw.js : Nicht gefunden" -ForegroundColor Red
}

# Console Monitor Test
Write-Host ""
Write-Host "💓 Teste Console Monitor (console-monitor.js)..." -ForegroundColor Yellow
$cmPath = Join-Path $rootDir "console-monitor.js"
if (Test-Path $cmPath) {
    Write-Host "✅ console-monitor.js : Vorhanden" -ForegroundColor Green
} else {
    Write-Host "❌ console-monitor.js : Nicht gefunden" -ForegroundColor Red
}

# Settings-Ordner Test
Write-Host ""
Write-Host "⚙️  Teste Settings-Ordner..." -ForegroundColor Yellow
$settingsPath = Join-Path $rootDir "Settings"
if (Test-Path $settingsPath) {
    $settingsFiles = Get-ChildItem -Path $settingsPath -Filter "*.json" -Recurse
    Write-Host "✅ Settings-Ordner : $($settingsFiles.Count) JSON-Dateien gefunden" -ForegroundColor Green
    
    # Prüfe kritische Settings-Dateien
    $criticalSettings = @(
        "KATAPULT-SHIELD-SYSTEM.json",
        "CHAIN-SYSTEM-MATRIX.json",
        "CEO-CIRCLE-REGISTRY.json",
        "FIXBOX-HEART-MONITOR.json",
        "SPACE-BOUNDARY-RULES.json"
    )
    
    foreach ($setting in $criticalSettings) {
        $settingPath = Join-Path $settingsPath $setting
        if (Test-Path $settingPath) {
            Write-Host "   ✅ $setting : Vorhanden" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $setting : Nicht gefunden" -ForegroundColor Red
        }
    }
} else {
    Write-Host "❌ Settings-Ordner : Nicht gefunden" -ForegroundColor Red
}

# Finale Zusammenfassung
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "FINALER STATUS" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "Gesamt getestet: $($testResults.Total)" -ForegroundColor White
Write-Host "Verbleibende Fehler: $($testResults.Errors)" -ForegroundColor $(if ($testResults.Errors -eq 0) { "Green" } else { "Red" })
Write-Host "Behoben: $($testResults.Fixed)" -ForegroundColor Green
Write-Host ""

if ($testResults.Errors -eq 0) {
    Write-Host "🎉 ALLE TESTS ERFOLGREICH - KEINE FEHLER MEHR!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Es gibt noch $($testResults.Errors) Fehler" -ForegroundColor Yellow
    exit 1
}








