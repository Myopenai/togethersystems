# [.SYSTEMS.T.SYSTEMS.] GitHub Pages Deployment Status Check
# Fabrikage-Routine: Deployment-Überwachung

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] GITHUB PAGES DEPLOYMENT CHECK" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$repo = "Myopenai/togethersystems"
$baseUrl = "https://myopenai.github.io/togethersystems"
$urls = @(
    "$baseUrl/pdf/ZENTRALE-FABRIKAGE-GESAMTBERICHT.html",
    "$baseUrl/ZENTRALE-FABRIKAGE-GESAMTBERICHT.html"
)

Write-Host "[PHASE 1] Workflow-Konfiguration prüfen..." -ForegroundColor Cyan
if (Test-Path ".github\workflows\deploy-github-pages.yml") {
    Write-Host "  ✅ deploy-github-pages.yml gefunden" -ForegroundColor Green
    $workflow = Get-Content ".github\workflows\deploy-github-pages.yml" -Raw
    if ($workflow -match "branches:\s*-\s*main") {
        Write-Host "  ✅ Trigger auf 'main' Branch konfiguriert" -ForegroundColor Green
    }
    if ($workflow -match "deploy-pages") {
        Write-Host "  ✅ deploy-pages Action konfiguriert" -ForegroundColor Green
    }
} else {
    Write-Host "  ❌ Workflow nicht gefunden!" -ForegroundColor Red
}
Write-Host ""

Write-Host "[PHASE 2] GitHub Repository Links:" -ForegroundColor Cyan
Write-Host "  Repository: https://github.com/$repo" -ForegroundColor White
Write-Host "  Actions:    https://github.com/$repo/actions" -ForegroundColor White
Write-Host "  Pages:      https://github.com/$repo/settings/pages" -ForegroundColor White
Write-Host ""

Write-Host "[PHASE 3] URL-Tests..." -ForegroundColor Cyan
foreach ($url in $urls) {
    Write-Host "  Teste: $url" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 10 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "    ✅ Status 200 - Seite verfügbar!" -ForegroundColor Green
        } else {
            Write-Host "    ⚠️  Status $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 404) {
            Write-Host "    ❌ 404 - Seite nicht gefunden (noch nicht deployed)" -ForegroundColor Red
        } elseif ($statusCode) {
            Write-Host "    ⚠️  Status $statusCode" -ForegroundColor Yellow
        } else {
            Write-Host "    ⚠️  Verbindungsfehler: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Milliseconds 500
}
Write-Host ""

Write-Host "[PHASE 4] Lokale Dateien prüfen..." -ForegroundColor Cyan
if (Test-Path "pdf\ZENTRALE-FABRIKAGE-GESAMTBERICHT.html") {
    $file = Get-Item "pdf\ZENTRALE-FABRIKAGE-GESAMTBERICHT.html"
    Write-Host "  ✅ pdf\ZENTRALE-FABRIKAGE-GESAMTBERICHT.html ($($file.Length) Bytes)" -ForegroundColor Green
} else {
    Write-Host "  ❌ pdf\ZENTRALE-FABRIKAGE-GESAMTBERICHT.html nicht gefunden" -ForegroundColor Red
}

if (Test-Path "ZENTRALE-FABRIKAGE-GESAMTBERICHT.html") {
    $file = Get-Item "ZENTRALE-FABRIKAGE-GESAMTBERICHT.html"
    Write-Host "  ✅ ZENTRALE-FABRIKAGE-GESAMTBERICHT.html ($($file.Length) Bytes)" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  ZENTRALE-FABRIKAGE-GESAMTBERICHT.html nicht gefunden (optional)" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "[PHASE 5] Git Status prüfen..." -ForegroundColor Cyan
if (Test-Path ".git") {
    $status = git status --short 2>&1
    if ($status) {
        Write-Host "  ⚠️  Uncommitted Änderungen:" -ForegroundColor Yellow
        $status | ForEach-Object { Write-Host "    $_" -ForegroundColor White }
    } else {
        Write-Host "  ✅ Keine uncommitted Änderungen" -ForegroundColor Green
    }
    
    $remotes = git remote -v 2>&1
    if ($remotes -match "origin") {
        Write-Host "  ✅ Remote 'origin' konfiguriert" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Kein Remote 'origin' konfiguriert" -ForegroundColor Yellow
    }
    
    $branch = git branch --show-current 2>&1
    if ($branch) {
        Write-Host "  ✅ Aktueller Branch: $branch" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️  Kein Git Repository gefunden" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] CHECK ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Nächste Schritte:" -ForegroundColor Yellow
Write-Host "  1. GitHub Actions prüfen: https://github.com/$repo/actions" -ForegroundColor White
Write-Host "  2. Deployment abwarten (~2-5 Minuten nach Push)" -ForegroundColor White
Write-Host "  3. URLs erneut testen" -ForegroundColor White
Write-Host ""
Write-Host "✅ FABRIKAGE-ROUTINE: ERFÜLLT" -ForegroundColor Green
Write-Host ""

