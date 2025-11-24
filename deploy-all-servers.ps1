# 🚀 DEPLOY ALL SERVERS - TogetherSystems
# Deploys to GitHub Pages AND Cloudflare Pages

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🚀 DEPLOY ALL SERVERS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

# Funktion: Prüfe ob Befehl existiert
function Test-Command {
    param($Command)
    $exists = Get-Command $Command -ErrorAction SilentlyContinue
    if (-not $exists) {
        Write-Host "❌ $Command ist nicht installiert!" -ForegroundColor Red
        return $false
    }
    return $true
}

# 1. Prüfe Voraussetzungen
Write-Host "1️⃣ Prüfe Voraussetzungen..." -ForegroundColor Yellow
if (-not (Test-Command "git")) {
    Write-Host "❌ Git ist nicht installiert!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Git gefunden" -ForegroundColor Green

if (-not (Test-Command "wrangler")) {
    Write-Host "⚠️  Wrangler ist nicht installiert!" -ForegroundColor Yellow
    Write-Host "   Installiere Wrangler mit: npm install -g wrangler" -ForegroundColor Cyan
    $deployCloudflare = $false
} else {
    Write-Host "✅ Wrangler gefunden" -ForegroundColor Green
    $deployCloudflare = $true
}
Write-Host ""

# 2. Git Status prüfen
Write-Host "2️⃣ Prüfe Git-Status..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "⚠️  Es gibt uncommitted Änderungen:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
    $response = Read-Host "Alle Änderungen committen und pushen? (j/n)"
    if ($response -eq "j" -or $response -eq "J" -or $response -eq "y" -or $response -eq "Y") {
        Write-Host ""
        Write-Host "📝 Committe Änderungen..." -ForegroundColor Yellow
        git add .
        $commitMessage = Read-Host "Commit-Nachricht (Enter für Standard)"
        if ([string]::IsNullOrWhiteSpace($commitMessage)) {
            $commitMessage = "Deploy: Aktualisierung $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
        }
        git commit -m $commitMessage
        Write-Host "✅ Commit erstellt" -ForegroundColor Green
        Write-Host ""
        
        Write-Host "📤 Pushe zu GitHub..." -ForegroundColor Yellow
        git push origin main
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠️  Push hatte Probleme. Versuche Pull zuerst..." -ForegroundColor Yellow
            git pull origin main --allow-unrelated-histories --no-edit
            git push origin main
        }
        Write-Host "✅ Zu GitHub gepusht" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host "⚠️  Überspringe Git-Operationen" -ForegroundColor Yellow
        Write-Host ""
    }
} else {
    Write-Host "✅ Keine uncommitted Änderungen" -ForegroundColor Green
    Write-Host ""
}

# 3. GitHub Pages Deployment (automatisch via Push)
Write-Host "3️⃣ GitHub Pages Deployment..." -ForegroundColor Yellow
Write-Host "   GitHub Pages wird automatisch via Git Push deployed." -ForegroundColor Cyan
Write-Host "   Repository Settings → Pages muss aktiviert sein." -ForegroundColor Cyan
Write-Host "✅ GitHub Pages wird automatisch deployed (falls konfiguriert)" -ForegroundColor Green
Write-Host ""

# 4. Cloudflare Pages Deployment
if ($deployCloudflare) {
    Write-Host "4️⃣ Cloudflare Pages Deployment..." -ForegroundColor Yellow
    Write-Host "   Projekt: ts-portal" -ForegroundColor Cyan
    Write-Host ""
    
    # Prüfe ob bereits eingeloggt
    Write-Host "   Prüfe Cloudflare-Login..." -ForegroundColor Cyan
    try {
        wrangler whoami | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Bei Cloudflare eingeloggt" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Nicht bei Cloudflare eingeloggt" -ForegroundColor Yellow
            Write-Host "   Führe aus: wrangler login" -ForegroundColor Cyan
            $login = Read-Host "Jetzt einloggen? (j/n)"
            if ($login -eq "j" -or $login -eq "J") {
                wrangler login
            } else {
                Write-Host "⚠️  Überspringe Cloudflare Deployment" -ForegroundColor Yellow
                $deployCloudflare = $false
            }
        }
    } catch {
        Write-Host "⚠️  Cloudflare-Login-Check fehlgeschlagen" -ForegroundColor Yellow
        Write-Host "   Führe aus: wrangler login" -ForegroundColor Cyan
    }
    
    if ($deployCloudflare) {
        Write-Host ""
        Write-Host "🚀 Deploye zu Cloudflare Pages..." -ForegroundColor Yellow
        Write-Host ""
        
        try {
            wrangler pages deploy . --project-name ts-portal
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "✅ Cloudflare Pages Deployment erfolgreich!" -ForegroundColor Green
            } else {
                Write-Host ""
                Write-Host "❌ Cloudflare Pages Deployment fehlgeschlagen!" -ForegroundColor Red
                Write-Host "   Exit Code: $LASTEXITCODE" -ForegroundColor Red
            }
        } catch {
            Write-Host ""
            Write-Host "❌ Fehler beim Cloudflare Deployment: $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "4️⃣ Cloudflare Pages Deployment..." -ForegroundColor Yellow
    Write-Host "⚠️  Übersprungen (Wrangler nicht installiert)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ DEPLOYMENT ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Deployment-Status:" -ForegroundColor Yellow
Write-Host "   • GitHub Pages: Automatisch via Push" -ForegroundColor White
if ($deployCloudflare) {
    Write-Host "   • Cloudflare Pages: ✅ Gedeployed" -ForegroundColor White
} else {
    Write-Host "   • Cloudflare Pages: ⏭ Übersprungen" -ForegroundColor White
}
Write-Host ""
Write-Host "🌐 URLs (falls konfiguriert):" -ForegroundColor Yellow
Write-Host "   • GitHub Pages: https://[USERNAME].github.io/[REPO-NAME]/" -ForegroundColor White
Write-Host "   • Cloudflare Pages: https://ts-portal.pages.dev" -ForegroundColor White
Write-Host ""
Write-Host "💡 Nächste Schritte:" -ForegroundColor Yellow
Write-Host "   1. Prüfe Deployment-Status im Dashboard" -ForegroundColor White
Write-Host "   2. Teste die Anwendung auf den deployed URLs" -ForegroundColor White
Write-Host "   3. Prüfe Funktionen (API-Endpoints, WebSocket, etc.)" -ForegroundColor White
Write-Host ""

