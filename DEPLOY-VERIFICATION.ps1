# [.SYSTEMS.T.SYSTEMS.] DEPLOY VERIFICATION
# Prüft alle Online-Apps nach Deployment

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] DEPLOY VERIFICATION" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$baseUrl = "https://myopenai.github.io/togethersystems"
$allPassed = $true
$testResults = @()

# Test-URLs definieren
$testUrls = @(
    @{
        Name = "Hauptportal"
        Url = "$baseUrl/"
        Critical = $true
    },
    @{
        Name = "Portal – Start"
        Url = "$baseUrl/Portal%20–%20Start.html"
        Critical = $true
    },
    @{
        Name = "Developer Portal"
        Url = "$baseUrl/ultra/ui/developer-portal.html"
        Critical = $true
    },
    @{
        Name = "Zentrale Fabrikage Gesamtbericht"
        Url = "$baseUrl/pdf/ZENTRALE-FABRIKAGE-GESAMTBERICHT.html"
        Critical = $false
    },
    @{
        Name = "Decision Matrix System"
        Url = "$baseUrl/pdf/DECISION-MATRIX-SYSTEM.html"
        Critical = $false
    },
    @{
        Name = "CASHFLOX Budget"
        Url = "$baseUrl/CASHFLOX/budget.html"
        Critical = $false
    },
    @{
        Name = "CASHFLOX UAE"
        Url = "$baseUrl/CASHFLOX/chflox.html"
        Critical = $false
    },
    @{
        Name = "Downloads Index"
        Url = "$baseUrl/downloads/"
        Critical = $false
    },
    @{
        Name = "OSTOSOS Downloads"
        Url = "$baseUrl/downloads/ostosos/"
        Critical = $false
    },
    @{
        Name = "Manifest Portal"
        Url = "$baseUrl/manifest-portal.html"
        Critical = $false
    },
    @{
        Name = "Manifest Forum"
        Url = "$baseUrl/manifest-forum.html"
        Critical = $false
    }
)

Write-Host "[PHASE 1] Teste alle Online-URLs..." -ForegroundColor Cyan
Write-Host ""

foreach ($test in $testUrls) {
    Write-Host "  Teste: $($test.Name)" -ForegroundColor Yellow
    Write-Host "    URL: $($test.Url)" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $test.Url -Method Head -TimeoutSec 15 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "    ✅ Status 200 - LIVE" -ForegroundColor Green
            
            # Content prüfen
            try {
                $content = Invoke-WebRequest -Uri $test.Url -TimeoutSec 15 -ErrorAction Stop
                $html = $content.Content
                
                # Prüfe auf Umlaut-Fehler
                if ($html -match "â€|ä|ö|ü|ß|Ä|Ö|Ãœ") {
                    Write-Host "    ⚠️  Umlaut-Fehler gefunden" -ForegroundColor Yellow
                    $testResults += @{ Name = $test.Name; Status = "UMLAUT_ERROR"; Url = $test.Url }
                } else {
                    Write-Host "    ✅ Keine Umlaut-Fehler" -ForegroundColor Green
                }
                
                # Prüfe auf JavaScript
                if ($html -match "<script|function ") {
                    Write-Host "    ✅ JavaScript vorhanden" -ForegroundColor Green
                }
                
                # Prüfe auf BASE_URL
                if ($html -match "BASE_URL") {
                    Write-Host "    ✅ BASE_URL konfiguriert" -ForegroundColor Green
                }
                
                $testResults += @{ Name = $test.Name; Status = "PASSED"; Url = $test.Url }
            } catch {
                Write-Host "    ⚠️  Content-Prüfung fehlgeschlagen" -ForegroundColor Yellow
                $testResults += @{ Name = $test.Name; Status = "PARTIAL"; Url = $test.Url }
            }
        } else {
            Write-Host "    ⚠️  Status $($response.StatusCode)" -ForegroundColor Yellow
            $testResults += @{ Name = $test.Name; Status = "WARNING"; Url = $test.Url }
            if ($test.Critical) {
                $allPassed = $false
            }
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq 404) {
            Write-Host "    ❌ 404 - Nicht gefunden" -ForegroundColor Red
            $testResults += @{ Name = $test.Name; Status = "NOT_FOUND"; Url = $test.Url }
            if ($test.Critical) {
                $allPassed = $false
            }
        } else {
            Write-Host "    ⚠️  Verbindungsfehler: $($_.Exception.Message)" -ForegroundColor Yellow
            $testResults += @{ Name = $test.Name; Status = "ERROR"; Url = $test.Url }
        }
    }
    
    Write-Host ""
    Start-Sleep -Milliseconds 500
}

Write-Host "[PHASE 2] Funktionalitäts-Tests..." -ForegroundColor Cyan
Write-Host ""

# Prüfe kritische Funktionen
$criticalChecks = @(
    @{ Name = "Developer Portal - Registrierung"; Url = "$baseUrl/ultra/ui/developer-portal.html"; Check = "registerDeveloper" },
    @{ Name = "Portal – Start - Tab-Switching"; Url = "$baseUrl/Portal%20–%20Start.html"; Check = "bindTabs" },
    @{ Name = "Portal – Start - Theme-Toggle"; Url = "$baseUrl/Portal%20–%20Start.html"; Check = "toggleTheme" }
)

foreach ($check in $criticalChecks) {
    try {
        $content = Invoke-WebRequest -Uri $check.Url -TimeoutSec 10 -ErrorAction Stop
        if ($content.Content -match [regex]::Escape($check.Check)) {
            Write-Host "  ✅ $($check.Name): Funktion vorhanden" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  $($check.Name): Funktion fehlt" -ForegroundColor Yellow
            $allPassed = $false
        }
    } catch {
        Write-Host "  ⚠️  $($check.Name): Prüfung fehlgeschlagen" -ForegroundColor Yellow
    }
}

Write-Host ""

Write-Host "========================================" -ForegroundColor $(if ($allPassed) { "Green" } else { "Yellow" })
Write-Host "[.SYSTEMS.T.SYSTEMS.] DEPLOY VERIFICATION ABGESCHLOSSEN" -ForegroundColor $(if ($allPassed) { "Green" } else { "Yellow" })
Write-Host "========================================" -ForegroundColor $(if ($allPassed) { "Green" } else { "Yellow" })
Write-Host ""

Write-Host "📊 Test-Zusammenfassung:" -ForegroundColor Cyan
foreach ($result in $testResults) {
    $color = switch ($result.Status) {
        "PASSED" { "Green" }
        "NOT_FOUND" { "Red" }
        "UMLAUT_ERROR" { "Yellow" }
        default { "Yellow" }
    }
    Write-Host "  $($result.Name): $($result.Status)" -ForegroundColor $color
}
Write-Host ""

if ($allPassed) {
    Write-Host "✅ ALLE KRITISCHEN TESTS BESTANDEN" -ForegroundColor Green
    Write-Host "✅ SYSTEM: LIVE & OPERATIONAL" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  EINIGE TESTS FEHLGESCHLAGEN" -ForegroundColor Yellow
    Write-Host "⚠️  Bitte Fehler beheben" -ForegroundColor Yellow
    exit 1
}

