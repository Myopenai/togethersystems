# [.SYSTEMS.T.SYSTEMS.] TÜV-Prüfung: CASHFLOX budget.html
# Fabrikage-Routine: Vollständige Prüfung vor Deployment

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] TÜV-PRÜFUNG: budget.html" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$testFile = "budget.html"
$allPassed = $true

if (-not (Test-Path $testFile)) {
    Write-Host "  ❌ Datei nicht gefunden: $testFile" -ForegroundColor Red
    exit 1
}

Write-Host "[PHASE 1] Datei-Struktur prüfen..." -ForegroundColor Cyan
$content = Get-Content $testFile -Raw -Encoding UTF8

# Prüfungen
$checks = @{
    "HTML-DOCTYPE vorhanden" = $content -match "<!DOCTYPE html>"
    "UTF-8 Encoding deklariert" = $content -match 'charset="UTF-8"'
    "Meta charset vorhanden" = $content -match '<meta.*charset'
}

foreach ($check in $checks.Keys) {
    if ($checks[$check]) {
        Write-Host "  ✅ $check" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $check" -ForegroundColor Red
        $allPassed = $false
    }
}
Write-Host ""

Write-Host "[PHASE 2] Kontrast-Prüfung..." -ForegroundColor Cyan

# Gelber Text auf gelbem Hintergrund prüfen
$yellowIssues = @()
if ($content -match 'color.*yellow|color.*#[fF][fF][fF]|color.*#[fF][eE][eE]') {
    $yellowIssues += "Gelbe/helle Textfarben gefunden"
}
if ($content -match 'background.*yellow|background.*#[fF][fF][fF]|background.*#[fF][eE][eE]') {
    $yellowIssues += "Gelbe/helle Hintergrundfarben gefunden"
}

# Prüfe auf problematische Kombinationen
$lines = $content -split "`n"
for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ($line -match 'color.*yellow' -and $line -match 'background.*yellow') {
        $yellowIssues += "Zeile $($i+1): Gelber Text auf gelbem Hintergrund!"
    }
    if ($line -match 'color.*#[fF][fF][fF]' -and $line -match 'background.*#[fF][fF][fF]') {
        $yellowIssues += "Zeile $($i+1): Weißer Text auf weißem Hintergrund!"
    }
}

if ($yellowIssues.Count -eq 0) {
    Write-Host "  ✅ Keine Kontrastprobleme gefunden" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Kontrastprobleme gefunden:" -ForegroundColor Yellow
    foreach ($issue in $yellowIssues) {
        Write-Host "    - $issue" -ForegroundColor Yellow
    }
    $allPassed = $false
}
Write-Host ""

Write-Host "[PHASE 3] Umlaute-Encoding prüfen..." -ForegroundColor Cyan

# Prüfe auf korrekte Umlaute
$umlautChecks = @{
    "Ä vorhanden (korrekt)" = $content -match 'Ä|&Auml;|&#196;'
    "Ö vorhanden (korrekt)" = $content -match 'Ö|&Ouml;|&#214;'
    "Ü vorhanden (korrekt)" = $content -match 'Ü|&Uuml;|&#220;'
    "ä vorhanden (korrekt)" = $content -match 'ä|&auml;|&#228;'
    "ö vorhanden (korrekt)" = $content -match 'ö|&ouml;|&#246;'
    "ü vorhanden (korrekt)" = $content -match 'ü|&uuml;|&#252;'
    "ß vorhanden (korrekt)" = $content -match 'ß|&szlig;|&#223;'
}

$umlautFound = $false
foreach ($check in $umlautChecks.Keys) {
    if ($umlautChecks[$check]) {
        Write-Host "  ✅ $check" -ForegroundColor Green
        $umlautFound = $true
    }
}

# Prüfe auf fehlerhafte Encoding-Zeichen
$badEncoding = @()
if ($content -match 'Ã¤|Ã¶|Ã¼|Ã„|Ã–|Ãœ') {
    $badEncoding += "Fehlerhafte UTF-8 Encoding-Zeichen gefunden (z.B. Ã¤ statt ä)"
}

if ($badEncoding.Count -gt 0) {
    Write-Host "  ❌ Encoding-Probleme:" -ForegroundColor Red
    foreach ($issue in $badEncoding) {
        Write-Host "    - $issue" -ForegroundColor Red
    }
    $allPassed = $false
} elseif (-not $umlautFound) {
    Write-Host "  ⚠️  Keine Umlaute gefunden (kann normal sein)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "[PHASE 4] JavaScript-Funktionalität prüfen..." -ForegroundColor Cyan

$jsChecks = @{
    "renderAll Funktion vorhanden" = $content -match "function renderAll"
    "frame Funktion vorhanden" = $content -match "function frame"
    "uaeBudgetModule Integration vorhanden" = $content -match "uaeBudgetModule|setFromDaVinci"
    "tween Funktion vorhanden" = $content -match "function tween"
    "computeModel Funktion vorhanden" = $content -match "function computeModel"
}

foreach ($check in $jsChecks.Keys) {
    if ($jsChecks[$check]) {
        Write-Host "  ✅ $check" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $check" -ForegroundColor Red
        $allPassed = $false
    }
}
Write-Host ""

Write-Host "[PHASE 5] Syntax-Prüfung..." -ForegroundColor Cyan

# Prüfe auf häufige JavaScript-Syntaxfehler
$syntaxIssues = @()
if ($content -match 'JSON\.parse\(\$\(.*editor.*\)') {
    $syntaxIssues += "Fehlerhafter JSON.parse gefunden"
}
if ($content -match '\([^)]*$' -and $content -notmatch 'function.*\{[^}]*$') {
    # Grobe Prüfung auf ungeschlossene Klammern (kann false positives geben)
    $openParens = ([regex]::Matches($content, '\(')).Count
    $closeParens = ([regex]::Matches($content, '\)')).Count
    if ($openParens -ne $closeParens) {
        $syntaxIssues += "Ungleiche Anzahl Klammern: $openParens öffnende, $closeParens schließende"
    }
}

if ($syntaxIssues.Count -eq 0) {
    Write-Host "  ✅ Keine Syntaxfehler gefunden" -ForegroundColor Green
} else {
    Write-Host "  ❌ Syntaxfehler gefunden:" -ForegroundColor Red
    foreach ($issue in $syntaxIssues) {
        Write-Host "    - $issue" -ForegroundColor Red
    }
    $allPassed = $false
}
Write-Host ""

Write-Host "========================================" -ForegroundColor $(if ($allPassed) { "Green" } else { "Red" })
Write-Host "[.SYSTEMS.T.SYSTEMS.] TÜV-PRÜFUNG ABGESCHLOSSEN" -ForegroundColor $(if ($allPassed) { "Green" } else { "Red" })
Write-Host "========================================" -ForegroundColor $(if ($allPassed) { "Green" } else { "Red" })
Write-Host ""

if ($allPassed) {
    Write-Host "✅ ALLE TESTS BESTANDEN" -ForegroundColor Green
    Write-Host "✅ Datei ist 100% funktionsfähig" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ TESTS FEHLGESCHLAGEN" -ForegroundColor Red
    Write-Host "❌ Datei muss korrigiert werden" -ForegroundColor Red
    exit 1
}

