# T,. COMPLETE SYSTEM VERIFICATION AND FIX
# Vollständige System-Überprüfung von Grund auf
# Behebt alle 404-Fehler, bindet .MD-Dateien ein, korrigiert Links

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "COMPLETE SYSTEM VERIFICATION AND FIX" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Phase 1: 404-Fehler identifizieren
Write-Host "🔍 PHASE 1: Identifiziere 404-Fehler..." -ForegroundColor Yellow

$errors404 = @()

# Prüfe alle HTML-Dateien auf defekte Links
$htmlFiles = Get-ChildItem -Path . -Include *.html -Recurse -ErrorAction SilentlyContinue | Where-Object { 
    $_.FullName -notmatch "node_modules|\.git|archive|backup|gentlyoverdone" 
}

foreach ($htmlFile in $htmlFiles) {
    $content = Get-Content $htmlFile.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        # Prüfe Script-Tags
        $scripts = [regex]::Matches($content, 'src=["'']([^"'']+)["'']')
        foreach ($match in $scripts) {
            $src = $match.Groups[1].Value
            if ($src -and -not $src.StartsWith('http') -and -not $src.StartsWith('//')) {
                $fullPath = Join-Path $htmlFile.DirectoryName $src
                if (-not (Test-Path $fullPath)) {
                    $errors404 += @{
                        file = $htmlFile.FullName
                        type = 'script'
                        path = $src
                    }
                }
            }
        }
        
        # Prüfe Link-Tags (CSS)
        $links = [regex]::Matches($content, 'href=["'']([^"'']+)["'']')
        foreach ($match in $links) {
            $href = $match.Groups[1].Value
            if ($href -and -not $href.StartsWith('http') -and -not $href.StartsWith('//') -and -not $href.StartsWith('#')) {
                $fullPath = Join-Path $htmlFile.DirectoryName $href
                if (-not (Test-Path $fullPath)) {
                    $errors404 += @{
                        file = $htmlFile.FullName
                        type = 'stylesheet'
                        path = $href
                    }
                }
            }
        }
    }
}

Write-Host "   ❌ $($errors404.Count) 404-Fehler gefunden" -ForegroundColor Red
if ($errors404.Count -gt 0) {
    $errors404 | Select-Object -First 10 | ForEach-Object {
        Write-Host "      - $($_.type): $($_.path) in $($_.file)" -ForegroundColor Yellow
    }
}

# Phase 2: .MD-Dateien identifizieren
Write-Host ""
Write-Host "📄 PHASE 2: Identifiziere .MD-Dateien..." -ForegroundColor Yellow

$mdFiles = Get-ChildItem -Path . -Include *.md,*.MD -Recurse -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch "node_modules|\.git|archive|backup"
}

Write-Host "   ✅ $($mdFiles.Count) .MD-Dateien gefunden" -ForegroundColor Green

# Phase 3: Links überprüfen
Write-Host ""
Write-Host "🔗 PHASE 3: Überprüfe Links..." -ForegroundColor Yellow

$brokenLinks = @()
foreach ($htmlFile in $htmlFiles) {
    $content = Get-Content $htmlFile.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        $internalLinks = [regex]::Matches($content, 'href=["''](\./[^"'']+|/[^"'']+)["'']')
        foreach ($match in $internalLinks) {
            $href = $match.Groups[1].Value
            $fullPath = Join-Path $htmlFile.DirectoryName $href
            if (-not (Test-Path $fullPath)) {
                $brokenLinks += @{
                    file = $htmlFile.FullName
                    link = $href
                }
            }
        }
    }
}

Write-Host "   ❌ $($brokenLinks.Count) defekte Links gefunden" -ForegroundColor Red

# Phase 4: OSOSOS-System prüfen
Write-Host ""
Write-Host "🖥️ PHASE 4: Prüfe OSOSOS-System..." -ForegroundColor Yellow

if (Test-Path "OSOSOS-COMPLETE-OFFLINE-OS.html") {
    Write-Host "   ✅ OSOSOS-COMPLETE-OFFLINE-OS.html gefunden" -ForegroundColor Green
} else {
    Write-Host "   ❌ OSOSOS-COMPLETE-OFFLINE-OS.html nicht gefunden" -ForegroundColor Red
}

# Phase 5: Donation-Integration prüfen
Write-Host ""
Write-Host "💝 PHASE 5: Prüfe Donation-Integration..." -ForegroundColor Yellow

$portals = @(
    "OSTOSOS-COMPLETE-OS-SYSTEM/OSTOSOS-OS-COMPLETE-SYSTEM.html",
    "manifest-portal.html",
    "manifest-forum.html",
    "OSOSOS-COMPLETE-OFFLINE-OS.html"
)

$donationOK = $true
foreach ($portal in $portals) {
    if (Test-Path $portal) {
        $content = Get-Content $portal -Raw
        if ($content -match "gofundme|IBAN|Skrill") {
            Write-Host "   ✅ ${portal}: Donation-Integration vorhanden" -ForegroundColor Green
        } else {
            Write-Host "   ❌ ${portal}: Donation-Integration fehlt" -ForegroundColor Red
            $donationOK = $false
        }
    }
}

# Phase 6: Zusammenfassung
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "404-Fehler: $($errors404.Count)" -ForegroundColor $(if ($errors404.Count -eq 0) { "Green" } else { "Red" })
Write-Host ".MD-Dateien: $($mdFiles.Count)" -ForegroundColor Green
Write-Host "Defekte Links: $($brokenLinks.Count)" -ForegroundColor $(if ($brokenLinks.Count -eq 0) { "Green" } else { "Red" })
Write-Host "Donation-Integration: $(if ($donationOK) { "✅ OK" } else { "❌ FEHLT" })" -ForegroundColor $(if ($donationOK) { "Green" } else { "Red" })
Write-Host ""

if ($errors404.Count -eq 0 -and $brokenLinks.Count -eq 0 -and $donationOK) {
    Write-Host "✅ SYSTEM IST FEHLERFREI!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️ SYSTEM HAT FEHLER - Bitte beheben!" -ForegroundColor Yellow
    exit 1
}

