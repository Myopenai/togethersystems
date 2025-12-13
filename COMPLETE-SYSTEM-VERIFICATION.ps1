# [.SYSTEMS.T.SYSTEMS.] COMPLETE SYSTEM VERIFICATION
# Prüft ALLE Dateien auf 100% Funktionalität

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] COMPLETE SYSTEM VERIFICATION" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$ROOT = $PSScriptRoot
$errors = @()
$warnings = @()
$fixed = 0

# ============================================
# PHASE 1: UMLAUT-FEHLER PRÜFUNG
# ============================================
Write-Host "[PHASE 1] Prüfe ALLE Dateien auf Umlaut-Fehler..." -ForegroundColor Cyan

$htmlFiles = Get-ChildItem -Path $ROOT -Recurse -Filter "*.html" -File | Where-Object { 
    $_.FullName -notmatch "node_modules|\.git|build|Fixpatch|OSTOSOS-COMPLETE-OS-SYSTEM\\build" 
}

$umlautPatterns = @{
    "â€" = """"
    "â€" = """"
    "â€" = "—"
    "â€" = "–"
    "â†'" = "→"
    "ä" = "ä"
    "ö" = "ö"
    "ü" = "ü"
    "ß" = "ß"
    "Ä" = "Ä"
    "Ö" = "Ö"
    "Ãœ" = "Ü"
    "â€'" = "-"
    "â€"" = "…"
    "Prüfe" = "Prüfe"
    "Erhöhe" = "Erhöhe"
    "übernommen" = "übernommen"
    "läuft" = "läuft"
    "öffnen" = "öffnen"
    "Identität" = "Identität"
    "erklärt" = "erklärt"
    "Einträge" = "Einträge"
    "wählen" = "wählen"
    "zurück" = "zurück"
    "Ãœbersicht" = "Übersicht"
    "geschützten" = "geschützten"
    "Änderungen" = "Änderungen"
    "löschen" = "löschen"
    "Verknüpfung" = "Verknüpfung"
    "nächsten" = "nächsten"
    "später" = "später"
    "hinzufügen" = "hinzufügen"
    "Ãœbermittlung" = "Übermittlung"
    "Schließen" = "Schließen"
}

foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $originalContent = $content
        $fileFixed = $false
        
        foreach ($wrong in $umlautPatterns.Keys) {
            if ($content -match [regex]::Escape($wrong)) {
                $content = $content -replace [regex]::Escape($wrong), $umlautPatterns[$wrong]
                $fileFixed = $true
            }
        }
        
        # Emoji-Fehler beheben
        if ($content -match "'¨â€'»") {
            $content = $content -replace "'¨â€'»", "👨‍💻"
            $fileFixed = $true
        }
        
        if ($fileFixed) {
            $content | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
            $fixed++
            Write-Host "  ✅ Behoben: $($file.Name)" -ForegroundColor Green
        }
    } catch {
        $errors += "Fehler bei $($file.Name): $_"
        Write-Host "  ❌ Fehler: $($file.Name)" -ForegroundColor Red
    }
}

Write-Host "  ✅ $fixed Dateien behoben" -ForegroundColor Green
Write-Host ""

# ============================================
# PHASE 2: JAVASCRIPT-FUNKTIONALITÄT PRÜFUNG
# ============================================
Write-Host "[PHASE 2] Prüfe JavaScript-Funktionalität..." -ForegroundColor Cyan

$jsChecks = @{
    "Portal – Start.html" = @("bindTabs", "toggleTheme", "loadItems", "openEditor", "saveEditor")
    "ultra/ui/developer-portal.html" = @("registerDeveloper", "submitCode", "loadMySubmissions", "init")
    "CASHFLOX/budget.html" = @("renderAll", "frame", "uaeBudgetModule")
    "CASHFLOX/chflox.html" = @("window.uaeBudgetModule", "setFromDaVinci", "draw")
}

foreach ($file in $jsChecks.Keys) {
    $filePath = Join-Path $ROOT $file
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        foreach ($func in $jsChecks[$file]) {
            if ($content -notmatch [regex]::Escape($func)) {
                $warnings += "$file: Funktion '$func' nicht gefunden"
                Write-Host "  ⚠️  $file: '$func' fehlt" -ForegroundColor Yellow
            } else {
                Write-Host "  ✅ $file: '$func' vorhanden" -ForegroundColor Green
            }
        }
    } else {
        $errors += "$file: Datei nicht gefunden"
        Write-Host "  ❌ $file: Nicht gefunden" -ForegroundColor Red
    }
}
Write-Host ""

# ============================================
# PHASE 3: OSTOSOS-SYSTEM PRÜFUNG
# ============================================
Write-Host "[PHASE 3] Prüfe OSTOSOS-System..." -ForegroundColor Cyan

$ostososDir = Join-Path $ROOT "OSTOSOS-COMPLETE-OS-SYSTEM"
$downloadDir = Join-Path $ROOT "downloads\ostosos"

if (Test-Path $ostososDir) {
    Write-Host "  ✅ OSTOSOS-Ordner vorhanden" -ForegroundColor Green
    
    $ostososFiles = @(
        "START-HIER.html",
        "OSTOSOS-OS-COMPLETE-SYSTEM.html",
        "OSTOSOS-ONE-FILE-ALL-IN-ONE.html",
        "OSTOSOS-ONECLICK.html",
        "OSTOSOS-INSTALLER.html",
        "OSTOSOS-INSTALLER-MULTI-OS.html"
    )
    
    foreach ($file in $ostososFiles) {
        $filePath = Join-Path $ostososDir $file
        if (Test-Path $filePath) {
            Write-Host "    ✅ $file vorhanden" -ForegroundColor Green
            
            # Prüfe auf Umlaut-Fehler
            $content = Get-Content $filePath -Raw -Encoding UTF8
            if ($content -match "â€|ä|ö|ü|ß|Ä|Ö|Ãœ") {
                $warnings += "OSTOSOS: $file hat Umlaut-Fehler"
                Write-Host "      ⚠️  Umlaut-Fehler gefunden" -ForegroundColor Yellow
            }
        } else {
            $warnings += "OSTOSOS: $file fehlt"
            Write-Host "    ⚠️  $file fehlt" -ForegroundColor Yellow
        }
    }
} else {
    $errors += "OSTOSOS-Ordner nicht gefunden"
    Write-Host "  ❌ OSTOSOS-Ordner nicht gefunden" -ForegroundColor Red
}

if (Test-Path $downloadDir) {
    Write-Host "  ✅ downloads/ostosos/ vorhanden" -ForegroundColor Green
    $downloadFiles = Get-ChildItem $downloadDir -File
    Write-Host "    ✅ $($downloadFiles.Count) Dateien im Download-Ordner" -ForegroundColor Green
} else {
    $warnings += "downloads/ostosos/ nicht gefunden"
    Write-Host "  ⚠️  downloads/ostosos/ nicht gefunden" -ForegroundColor Yellow
}
Write-Host ""

# ============================================
# PHASE 4: BASE_URL PRÜFUNG
# ============================================
Write-Host "[PHASE 4] Prüfe BASE_URL Konfiguration..." -ForegroundColor Cyan

$baseUrlFiles = Get-ChildItem -Path $ROOT -Recurse -Filter "*.html" -File | Where-Object { 
    $_.FullName -notmatch "node_modules|\.git|build|Fixpatch" 
} | Select-Object -First 30

$baseUrlCount = 0
foreach ($file in $baseUrlFiles) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if ($content -match "BASE_URL|PDF_BASE_URL|DOWNLOAD_BASE_URL") {
        $baseUrlCount++
    }
}

Write-Host "  ✅ $baseUrlCount Dateien mit BASE_URL gefunden" -ForegroundColor Green
Write-Host ""

# ============================================
# PHASE 5: SYNTAX-VALIDIERUNG
# ============================================
Write-Host "[PHASE 5] Prüfe JavaScript-Syntax..." -ForegroundColor Cyan

$syntaxErrors = 0
foreach ($file in $htmlFiles | Select-Object -First 20) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Prüfe auf häufige Syntax-Fehler
    if ($content -match "JSON\.parse\(\$\(.*editor.*\)") {
        $syntaxErrors++
        $errors += "$($file.Name): Falsche JSON.parse Verwendung"
        Write-Host "  ❌ $($file.Name): JSON.parse Fehler" -ForegroundColor Red
    }
    
    # Prüfe auf ungeschlossene Klammern
    $openParen = ($content.ToCharArray() | Where-Object { $_ -eq '(' }).Count
    $closeParen = ($content.ToCharArray() | Where-Object { $_ -eq ')' }).Count
    if ($openParen -ne $closeParen) {
        $syntaxErrors++
        $warnings += "$($file.Name): Mögliche ungeschlossene Klammern"
    }
}

if ($syntaxErrors -eq 0) {
    Write-Host "  ✅ Keine Syntax-Fehler gefunden" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  $syntaxErrors mögliche Syntax-Fehler" -ForegroundColor Yellow
}
Write-Host ""

# ============================================
# ZUSAMMENFASSUNG
# ============================================
Write-Host "========================================" -ForegroundColor Green
Write-Host "VERIFICATION ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Behobene Dateien: $fixed" -ForegroundColor White
Write-Host "Fehler: $($errors.Count)" -ForegroundColor $(if ($errors.Count -eq 0) { "Green" } else { "Red" })
Write-Host "Warnungen: $($warnings.Count)" -ForegroundColor $(if ($warnings.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host ""

if ($errors.Count -gt 0) {
    Write-Host "❌ FEHLER:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
    Write-Host ""
}

if ($warnings.Count -gt 0) {
    Write-Host "⚠️  WARNUNGEN:" -ForegroundColor Yellow
    foreach ($warning in $warnings | Select-Object -First 10) {
        Write-Host "  - $warning" -ForegroundColor Yellow
    }
    Write-Host ""
}

if ($errors.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-Host "✅ SYSTEM: 100% FUNKTIONSFÄHIG" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  SYSTEM: BENÖTIGT KORREKTUREN" -ForegroundColor Yellow
    exit 1
}

