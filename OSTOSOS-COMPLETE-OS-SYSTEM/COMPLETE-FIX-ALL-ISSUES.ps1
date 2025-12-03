# T,. OSOTOSOS - Complete Fix All Issues
# Behebt ALLE identifizierten Probleme systematisch

$ErrorActionPreference = "Continue"
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir

Write-Host "=== T,. OSOTOSOS - Complete Fix All Issues ===" -ForegroundColor Cyan
Write-Host ""

# 1. OSTOSOS-ANKUENDIGUNG.html kopieren (falls vorhanden)
$sourceAnkuendigung = Join-Path (Split-Path -Parent $rootDir) "OSTOSOS-ANKUENDIGUNG.html"
if (Test-Path $sourceAnkuendigung) {
    Copy-Item $sourceAnkuendigung -Destination $rootDir -Force
    Write-Host "✅ OSTOSOS-ANKUENDIGUNG.html kopiert" -ForegroundColor Green
} else {
    Write-Host "⚠️ OSTOSOS-ANKUENDIGUNG.html nicht gefunden im Root" -ForegroundColor Yellow
}

# 2. Honeycomb.html erstellen
$honeycombHtml = @"
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Honeycomb - OSOTOSOS</title>
<style>
body { font-family: system-ui; background: #0d1117; color: #e6edf3; padding: 2rem; }
.card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
h1 { color: #10b981; }
button { background: #10b981; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
</style>
</head>
<body>
<div class="card">
<h1>🍯 Honeycomb Prozess</h1>
<p>Honeycomb ist ein automatischer Produktionsfluss-Manager.</p>
<button onclick="window.close()">Schließen</button>
</div>
<script>
console.log('T,. Honeycomb geladen');
</script>
</body>
</html>
"@
Set-Content -Path "$rootDir\honeycomb.html" -Value $honeycombHtml -Encoding UTF8
Write-Host "✅ honeycomb.html erstellt" -ForegroundColor Green

# 3. Legal-Hub.html erstellen
$legalHubHtml = @"
<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Legal Hub - OSOTOSOS</title>
<style>
body { font-family: system-ui; background: #0d1117; color: #e6edf3; padding: 2rem; }
.card { background: #161b22; border: 1px solid #30363d; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; }
h1 { color: #10b981; }
button { background: #10b981; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
</style>
</head>
<body>
<div class="card">
<h1>📜 Legal Hub</h1>
<p>Verträge signieren und verwalten.</p>
<button onclick="window.close()">Schließen</button>
</div>
<script>
console.log('T,. Legal Hub geladen');
</script>
</body>
</html>
"@
Set-Content -Path "$rootDir\legal-hub.html" -Value $legalHubHtml -Encoding UTF8
Write-Host "✅ legal-hub.html erstellt" -ForegroundColor Green

Write-Host ""
Write-Host "=== Fix abgeschlossen ===" -ForegroundColor Green
Write-Host ""

