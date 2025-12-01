# Think Orders - Tests ausführen (PowerShell Script)
# Für Dummies: Doppelklick auf diese Datei!

Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "   🧪 Think Orders - Tests ausführen" -ForegroundColor Yellow
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Prüfe ob Node.js installiert ist
Write-Host "🔍 Prüfe Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js gefunden: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js nicht gefunden!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Bitte installieren Sie Node.js von: https://nodejs.org/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Drücken Sie eine Taste zum Beenden..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Prüfe ob NPM installiert ist
Write-Host "🔍 Prüfe NPM..." -ForegroundColor Cyan
try {
    $npmVersion = npm --version
    Write-Host "✅ NPM gefunden: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ NPM nicht gefunden!" -ForegroundColor Red
    Write-Host ""
    Write-Host "NPM ist Teil von Node.js. Bitte installieren Sie Node.js neu." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Drücken Sie eine Taste zum Beenden..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Zum richtigen Ordner wechseln
Write-Host ""
Write-Host "📁 Wechsle zum Test-Ordner..." -ForegroundColor Cyan
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath
Write-Host "✅ Aktueller Ordner: $(Get-Location)" -ForegroundColor Green

# Prüfe ob package.json existiert
if (-not (Test-Path "package.json")) {
    Write-Host ""
    Write-Host "❌ package.json nicht gefunden!" -ForegroundColor Red
    Write-Host "Bitte stellen Sie sicher, dass Sie im richtigen Ordner sind." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Drücken Sie eine Taste zum Beenden..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Prüfe ob node_modules existiert
if (-not (Test-Path "node_modules")) {
    Write-Host ""
    Write-Host "📦 Dependencies nicht gefunden. Installiere..." -ForegroundColor Yellow
    Write-Host ""
    npm install
    Write-Host ""
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Installation fehlgeschlagen!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Drücken Sie eine Taste zum Beenden..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
    Write-Host "✅ Dependencies installiert!" -ForegroundColor Green
}

# Prüfe ob Browser installiert sind
Write-Host ""
Write-Host "🌐 Prüfe Browser..." -ForegroundColor Cyan
$playwrightPath = "node_modules\.playwright"
if (-not (Test-Path $playwrightPath)) {
    Write-Host "📥 Browser nicht gefunden. Installiere..." -ForegroundColor Yellow
    Write-Host ""
    npx playwright install
    Write-Host ""
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Browser-Installation fehlgeschlagen!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Drücken Sie eine Taste zum Beenden..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
    Write-Host "✅ Browser installiert!" -ForegroundColor Green
} else {
    Write-Host "✅ Browser gefunden!" -ForegroundColor Green
}

# Tests ausführen
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "   🚀 Starte Tests..." -ForegroundColor Yellow
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

npm test

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "   ✅ Tests abgeschlossen!" -ForegroundColor Yellow
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Tipps:" -ForegroundColor Cyan
Write-Host "   → Report ansehen: npm run test:report" -ForegroundColor White
Write-Host "   → Mit Browser: npm run test:headed" -ForegroundColor White
Write-Host "   → Debug: npm run test:debug" -ForegroundColor White
Write-Host ""
Write-Host "Drücken Sie eine Taste zum Beenden..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

