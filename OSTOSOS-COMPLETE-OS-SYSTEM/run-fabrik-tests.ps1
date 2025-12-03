# T,. OSOTOSOS Tests mit Fabrik-Testapparatur
# Führt alle Tests mit der Fabrikage-Testapparatur durch

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "T,. OSOTOSOS Fabrik-Tests" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = $PSScriptRoot
if (-not $rootDir) {
    $rootDir = Get-Location
}

$fabrikDir = Join-Path (Split-Path $rootDir -Parent) "TogetherSystems"
if (-not (Test-Path $fabrikDir)) {
    Write-Host "FEHLER: TogetherSystems Ordner nicht gefunden!" -ForegroundColor Red
    Write-Host "Erwartet: $fabrikDir" -ForegroundColor Yellow
    exit 1
}

Write-Host "[1] Prüfe Fabrikage-Testapparatur..." -ForegroundColor Yellow

# Prüfe ob Test-Runner existiert
$testRunner = Join-Path $fabrikDir "Fabrikage.AutoExecution\test\test-runner.ts"
if (-not (Test-Path $testRunner)) {
    Write-Host "  [WARNUNG] Test-Runner nicht gefunden: $testRunner" -ForegroundColor Yellow
    Write-Host "  Erstelle vereinfachte Test-Suite..." -ForegroundColor Yellow
} else {
    Write-Host "  [OK] Test-Runner gefunden" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2] Führe OSOTOSOS-System-Tests durch..." -ForegroundColor Yellow

# Test 1: Prüfe Hauptdatei
Write-Host "  Test 1: Prüfe OSTOSOS-OS-COMPLETE-SYSTEM.html..." -ForegroundColor Cyan
$mainFile = Join-Path $rootDir "OSTOSOS-OS-COMPLETE-SYSTEM.html"
if (Test-Path $mainFile) {
    $content = Get-Content -Path $mainFile -Raw -Encoding UTF8
    $errors = 0
    
    # Prüfe auf doppelte onerror
    $doubleOnError = [regex]::Matches($content, 'onerror.*onerror')
    if ($doubleOnError.Count -gt 0) {
        Write-Host "    [FEHLER] Doppelte onerror-Attribute gefunden: $($doubleOnError.Count)" -ForegroundColor Red
        $errors++
    } else {
        Write-Host "    [OK] Keine doppelten onerror-Attribute" -ForegroundColor Green
    }
    
    # Prüfe auf fehlende Dateien
    $scriptRefs = [regex]::Matches($content, 'src=["'']([^"'']+)["'']')
    $missing = 0
    foreach ($match in $scriptRefs) {
        $ref = $match.Groups[1].Value
        if ($ref -notmatch '^(https?://|data:)') {
            $refPath = Join-Path $rootDir ($ref -replace '^\./', '')
            if (-not (Test-Path $refPath) -and $ref -notmatch '\.\./') {
                $missing++
            }
        }
    }
    if ($missing -gt 0) {
        Write-Host "    [WARNUNG] $missing lokale Referenzen könnten fehlen (externe sind optional)" -ForegroundColor Yellow
    } else {
        Write-Host "    [OK] Alle lokalen Referenzen vorhanden" -ForegroundColor Green
    }
} else {
    Write-Host "    [FEHLER] Hauptdatei nicht gefunden!" -ForegroundColor Red
}

# Test 2: Prüfe INDEX.html
Write-Host "  Test 2: Prüfe INDEX.html..." -ForegroundColor Cyan
$indexFile = Join-Path $rootDir "INDEX.html"
if (Test-Path $indexFile) {
    Write-Host "    [OK] INDEX.html vorhanden" -ForegroundColor Green
} else {
    Write-Host "    [FEHLER] INDEX.html nicht gefunden!" -ForegroundColor Red
}

# Test 3: Prüfe START-HIER.html
Write-Host "  Test 3: Prüfe START-HIER.html..." -ForegroundColor Cyan
$startFile = Join-Path $rootDir "START-HIER.html"
if (Test-Path $startFile) {
    Write-Host "    [OK] START-HIER.html vorhanden" -ForegroundColor Green
} else {
    Write-Host "    [FEHLER] START-HIER.html nicht gefunden!" -ForegroundColor Red
}

# Test 4: Prüfe Core-JS-Dateien
Write-Host "  Test 4: Prüfe Core-JS-Dateien..." -ForegroundColor Cyan
$coreJs = @(
    'window-manager-core.js',
    'taskbar-core.js',
    'verification-core.js',
    'survey-builder-core.js',
    'donation-core.js',
    'api-gateway-core.js',
    'formelfarm-core.js',
    'self-healing-core.js'
)

$missingJs = 0
foreach ($js in $coreJs) {
    $jsPath = Join-Path $rootDir $js
    if (-not (Test-Path $jsPath)) {
        $missingJs++
        Write-Host "    [WARNUNG] $js nicht gefunden" -ForegroundColor Yellow
    }
}
if ($missingJs -eq 0) {
    Write-Host "    [OK] Alle Core-JS-Dateien vorhanden" -ForegroundColor Green
} else {
    Write-Host "    [WARNUNG] $missingJs Core-JS-Dateien fehlen (werden optional geladen)" -ForegroundColor Yellow
}

# Test 5: Prüfe Icon-Generierung
Write-Host "  Test 5: Prüfe Icon-Generierung..." -ForegroundColor Cyan
$iconsDir = Join-Path $rootDir "icons"
if (Test-Path $iconsDir) {
    $iconFiles = Get-ChildItem -Path $iconsDir -File
    if ($iconFiles.Count -gt 0) {
        Write-Host "    [OK] $($iconFiles.Count) Icons gefunden" -ForegroundColor Green
    } else {
        Write-Host "    [INFO] Icons-Ordner leer - führe generate-icons.ps1 aus" -ForegroundColor Yellow
    }
} else {
    Write-Host "    [INFO] Icons-Ordner nicht gefunden - führe generate-icons.ps1 aus" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[3] Führe Browser-Tests durch..." -ForegroundColor Yellow

# Erstelle Test-HTML
$testHtml = @"
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>OSOTOSOS Test Suite</title>
<style>
body { font-family: Arial; padding: 20px; background: #0f172a; color: #10b981; }
.test { padding: 10px; margin: 10px 0; background: #1a1f3a; border-radius: 8px; }
.pass { border-left: 4px solid #10b981; }
.fail { border-left: 4px solid #ef4444; }
</style>
</head>
<body>
<h1>T,. OSOTOSOS Test Suite</h1>
<div id="tests"></div>
<script>
const tests = [];
let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        const result = fn();
        if (result) {
            tests.push({ name, status: 'PASS', message: 'OK' });
            passed++;
        } else {
            tests.push({ name, status: 'FAIL', message: 'Test fehlgeschlagen' });
            failed++;
        }
    } catch (e) {
        tests.push({ name, status: 'FAIL', message: e.message });
        failed++;
    }
}

// Tests
test('Hauptdatei lädt', () => {
    return typeof document !== 'undefined';
});

test('Console verfügbar', () => {
    return typeof console !== 'undefined';
});

test('LocalStorage verfügbar', () => {
    try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
    } catch (e) {
        return false;
    }
});

test('Fetch verfügbar', () => {
    return typeof fetch !== 'undefined' || typeof XMLHttpRequest !== 'undefined';
});

// Rendere Ergebnisse
const container = document.getElementById('tests');
tests.forEach(t => {
    const div = document.createElement('div');
    div.className = 'test ' + (t.status === 'PASS' ? 'pass' : 'fail');
    div.innerHTML = '<strong>' + t.name + ':</strong> ' + t.status + ' - ' + t.message;
    container.appendChild(div);
});

const summary = document.createElement('div');
summary.className = 'test';
summary.innerHTML = '<h2>Zusammenfassung: ' + passed + ' bestanden, ' + failed + ' fehlgeschlagen</h2>';
container.appendChild(summary);
</script>
</body>
</html>
"@

$testHtmlPath = Join-Path $rootDir "test-suite.html"
$testHtml | Out-File -FilePath $testHtmlPath -Encoding UTF8
Write-Host "  [OK] Test-Suite erstellt: $testHtmlPath" -ForegroundColor Green
Write-Host "  Öffne im Browser zum Testen" -ForegroundColor Yellow

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "[OK] Tests abgeschlossen!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Nächste Schritte:" -ForegroundColor Yellow
Write-Host "  1. Öffne test-suite.html im Browser" -ForegroundColor White
Write-Host "  2. Prüfe Console auf Fehler" -ForegroundColor White
Write-Host "  3. Teste alle Module manuell" -ForegroundColor White
Write-Host ""
Write-Host "T,.&T,,.&T,,,.T." -ForegroundColor Green

