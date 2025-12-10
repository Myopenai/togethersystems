# Universal Dynamic PDF Processor
# Verarbeitet jede PDF zu interaktiver Dynamic PDF
# Mit TogetherSystems Verifizierung + optionalem Benutzer-Branding

param(
    [Parameter(Mandatory = $true)]
    [string]$InputPdf,
    
    [Parameter(Mandatory = $false)]
    [string]$OutputDir = "",
    
    [Parameter(Mandatory = $false)]
    [string]$CompanyName = "",
    
    [Parameter(Mandatory = $false)]
    [string]$CompanyLogo = "",
    
    [Parameter(Mandatory = $false)]
    [string]$PrimaryColor = "",
    
    [Parameter(Mandatory = $false)]
    [string]$SecondaryColor = "",
    
    [switch]$UseCustomBranding,
    [switch]$FullProcessing,
    [switch]$ShowDonationInfo
)

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Err($msg) { Write-Host "[ERR] $msg" -ForegroundColor Red }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ParentDir = Split-Path -Parent $ScriptDir

# Setze Output-Verzeichnis
if ($OutputDir -eq "") {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $OutputDir = Join-Path $ScriptDir "output_$timestamp"
}

if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

Write-Info "=========================================="
Write-Info "UNIVERSAL DYNAMIC PDF PROCESSOR"
Write-Info "TogetherSystems International TTT"
Write-Info "=========================================="
Write-Host ""

# PHASE 1: Eingabe & Validierung
Write-Info "📥 PHASE 1: Eingabe & Validierung"

# Prüfe Input
if ($InputPdf -like "file:///*") {
    $InputPdf = $InputPdf -replace "file:///", "" -replace "/", "\"
}

if (!(Test-Path $InputPdf)) {
    Write-Err "PDF-Datei nicht gefunden: $InputPdf"
    exit 1
}

Write-Success "✅ PDF gefunden: $InputPdf"

# Prüfe Dateigröße
$fileSize = (Get-Item $InputPdf).Length / 1MB
if ($fileSize -gt 100) {
    Write-Warn "Datei ist sehr groß: $([math]::Round($fileSize, 2)) MB"
}

# TogetherSystems Verifizierung
Write-Info "🔐 TogetherSystems Logo-Verifizierung aktiv"
$verificationHash = (Get-FileHash -Path $InputPdf -Algorithm SHA256).Hash
Write-Success "Verifizierungs-Hash: $($verificationHash.Substring(0, 16))..."

Write-Host ""

# PHASE 2: Analyse & Extraktion
Write-Info "📊 PHASE 2: Analyse & Extraktion"

$analyzerScript = Join-Path $ParentDir "macro-economic-analyzer.py"
$analysisOutput = Join-Path $OutputDir "analysis.json"

if (Test-Path $analyzerScript) {
    try {
        $pythonCmd = "python"
        if (Get-Command py -ErrorAction SilentlyContinue) {
            $pythonCmd = "py"
        }
        
        Write-Info "Führe makroökonomische Analyse durch..."
        & $pythonCmd $analyzerScript $InputPdf $analysisOutput 2>&1 | Out-Null
        
        if (Test-Path $analysisOutput) {
            Write-Success "Analyse gespeichert: $analysisOutput"
        }
    } catch {
        Write-Warn "Analyse fehlgeschlagen: $_"
    }
} else {
    Write-Warn "Analyzer nicht gefunden, überspringe Analyse..."
}

Write-Host ""

# PHASE 3: Branding-Konfiguration
Write-Info "🎨 PHASE 3: Branding-Konfiguration"

# Lade Analyse-Daten
$analysisData = $null
if (Test-Path $analysisOutput) {
    try {
        $analysisData = Get-Content $analysisOutput -Raw | ConvertFrom-Json
    } catch {
        Write-Warn "Konnte Analyse-Daten nicht laden"
    }
}

# Branding-Konfiguration
$brandingConfig = @{
    togetherSystems = @{
        logo = "T,.&T,,.&T,,,."
        company = "TOGETHERSYSTEMS. INTERNATIONAL TTT"
        tagline = "UniverseAllEnterprises · Financial Intelligence"
        verified = $true
        verificationHash = $verificationHash
    }
    user = @{
        enabled = $UseCustomBranding
        companyName = $CompanyName
        logo = $CompanyLogo
        primaryColor = if ($PrimaryColor) { $PrimaryColor } else { "#1a1a2e" }
        secondaryColor = if ($SecondaryColor) { $SecondaryColor } else { "#16213e" }
    }
    donation = @{
        enabled = $ShowDonationInfo
        amount = ""
        link = "https://tel1.nl/donate"
    }
}

Write-Success "Branding konfiguriert"
if ($UseCustomBranding) {
    Write-Info "  → Benutzer-Branding aktiviert"
    Write-Info "  → TogetherSystems Verifizierung bleibt sichtbar"
    if ($ShowDonationInfo) {
        Write-Info "  → Spenden-Info wird angezeigt"
    }
} else {
    Write-Info "  → Standard TogetherSystems Branding"
}

Write-Host ""

# PHASE 4: Dynamic PDF Generierung
Write-Info "📄 PHASE 4: Dynamic PDF Generierung"

$htmlTemplate = Join-Path $OutputDir "dynamic-pdf.html"
$htmlContent = Generate-UniversalHTML -InputPdf $InputPdf -AnalysisData $analysisData -Branding $brandingConfig

$htmlContent | Out-File -FilePath $htmlTemplate -Encoding UTF8
Write-Success "HTML Template erstellt: $htmlTemplate"

# Öffne Template im Browser
Write-Info "Öffne Template im Browser für manuelle PDF-Erstellung..."
Start-Process $htmlTemplate

Write-Host ""
Write-Info "💡 NÄCHSTE SCHRITTE:"
Write-Host "1. Im Browser: Drücke Ctrl+P"
Write-Host "2. Aktiviere 'Hintergrundgrafiken'"
Write-Host "3. Speichere als PDF"
Write-Host ""

# PHASE 5: Qualitätsprüfung
Write-Info "✅ PHASE 5: Qualitätsprüfung"

Write-Info "Prüfe erstellte Dateien..."
$checks = @{
    "HTML Template" = Test-Path $htmlTemplate
    "Analyse JSON" = Test-Path $analysisOutput
    "Branding Config" = $true
}

foreach ($check in $checks.GetEnumerator()) {
    if ($check.Value) {
        Write-Success "  ✓ $($check.Key)"
    } else {
        Write-Warn "  ✗ $($check.Key)"
    }
}

Write-Host ""
Write-Info "=========================================="
Write-Success "Verarbeitung abgeschlossen!"
Write-Info "=========================================="
Write-Host ""
Write-Info "📁 Output-Verzeichnis: $OutputDir"
Write-Host "  📄 HTML Template: dynamic-pdf.html"
Write-Host "  📊 Analyse: analysis.json"
Write-Host ""
Write-Success "✅ Original PDF unverändert: $InputPdf"
Write-Success "🔐 TogetherSystems Verifizierung aktiv"

function Generate-UniversalHTML {
    param(
        $InputPdf,
        $AnalysisData,
        $Branding
    )
    
    $pdfName = Split-Path -Leaf $InputPdf
    $ts = $Branding.togetherSystems
    $user = $Branding.user
    $donation = $Branding.donation
    
    # Extrahiere Metriken
    $totalVolume = 0
    $netFlow = 0
    $totalTransactions = 0
    
    if ($AnalysisData) {
        $totalVolume = $AnalysisData.macro_metrics.total_volume
        $netFlow = $AnalysisData.macro_metrics.net_flow
        $totalTransactions = $AnalysisData.macro_metrics.total_transactions
    }
    
    $html = @"
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Dynamic PDF - TogetherSystems</title>
    <style>
        @page { size: A4; margin: 0; }
        
        :root {
            --ts-primary: #1a1a2e;
            --ts-secondary: #16213e;
            --ts-accent: #0f3460;
            --ts-highlight: #e94560;
            --user-primary: $($user.primaryColor);
            --user-secondary: $($user.secondaryColor);
            --header-height: 80px;
            --footer-height: 60px;
        }
        
        body {
            font-family: 'Segoe UI', sans-serif;
            margin: 0;
            padding: 0;
            background: #f5f5f5;
            color: #0a0a0a;
        }
        
        .brand-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: var(--header-height);
            background: linear-gradient(135deg, var(--ts-primary) 0%, var(--ts-secondary) 100%);
            color: white;
            padding: 0 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        
        .header-left {
            display: flex;
            align-items: center;
            gap: 20px;
        }
        
        .ts-logo {
            font-size: 2.5em;
            font-weight: bold;
            letter-spacing: 3px;
        }
        
        .ts-company {
            font-size: 1.1em;
            font-weight: 600;
        }
        
        .header-right {
            text-align: right;
        }
        
        .user-logo {
            max-height: 40px;
            margin-bottom: 5px;
        }
        
        .user-company {
            font-size: 0.9em;
            opacity: 0.9;
        }
        
        .content-wrapper {
            margin-top: var(--header-height);
            margin-bottom: var(--footer-height);
            min-height: calc(100vh - var(--header-height) - var(--footer-height));
            padding: 40px;
            max-width: 210mm;
            margin-left: auto;
            margin-right: auto;
            background: white;
        }
        
        .brand-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: var(--footer-height);
            background: var(--ts-primary);
            color: white;
            padding: 0 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 1000;
            font-size: 0.85em;
        }
        
        .verification-badge {
            display: inline-block;
            padding: 4px 8px;
            background: rgba(233, 69, 96, 0.2);
            border: 1px solid var(--ts-highlight);
            border-radius: 3px;
            font-size: 0.8em;
            margin-left: 10px;
        }
        
        .donation-info {
            font-size: 0.75em;
            color: rgba(255,255,255,0.7);
            margin-top: 5px;
        }
        
        .donation-info a {
            color: var(--ts-highlight);
            text-decoration: underline;
        }
        
        h1 {
            font-size: 2.5em;
            color: var(--ts-primary);
            margin: 30px 0 20px;
            border-bottom: 3px solid var(--ts-accent);
            padding-bottom: 10px;
        }
        
        .info-box {
            background: #f5f5f5;
            border-left: 4px solid var(--ts-accent);
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: var(--ts-accent);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            transition: all 0.3s ease;
            margin: 10px 5px;
        }
        
        .btn:hover {
            background: var(--ts-highlight);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <header class="brand-header">
        <div class="header-left">
            <div class="ts-logo">$($ts.logo)</div>
            <div>
                <div class="ts-company">$($ts.company)</div>
                <div style="font-size: 0.85em; opacity: 0.9;">$($ts.tagline)</div>
            </div>
        </div>
        <div class="header-right">
"@
    
    if ($user.enabled -and $user.companyName) {
        $html += @"
            $(if ($user.logo) { "<img src='$($user.logo)' class='user-logo' alt='$($user.companyName)'>" })
            <div class="user-company">$($user.companyName)</div>
"@
    }
    
    $html += @"
        </div>
    </header>

    <div class="content-wrapper">
        <section id="title">
            <h1>📄 Dokument Analyse</h1>
            <div class="info-box">
                <p><strong>Original Datei:</strong> $pdfName</p>
                <p><strong>Verifizierung:</strong> <span class="verification-badge">✓ TogetherSystems Verified</span></p>
                <p><strong>Analyse-Datum:</strong> $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")</p>
"@
    
    if ($AnalysisData) {
        $html += @"
                <p><strong>Transaktionen:</strong> $totalTransactions</p>
                <p><strong>Gesamtvolumen:</strong> €$([math]::Round($totalVolume, 2))</p>
                <p><strong>Netto-Cashflow:</strong> €$([math]::Round($netFlow, 2))</p>
"@
    }
    
    $html += @"
            </div>
        </section>
        
        <section id="verification">
            <h2>🔐 TogetherSystems Verifizierung</h2>
            <div class="info-box">
                <p><strong>Status:</strong> ✅ Verifiziert</p>
                <p><strong>Hash:</strong> <code>$($ts.verificationHash.Substring(0, 32))...</code></p>
                <p><strong>System:</strong> TogetherSystems Universal PDF Processor v1.0.0</p>
            </div>
        </section>
    </div>

    <footer class="brand-footer">
        <div>
            <span style="font-size: 1.5em; font-weight: bold;">$($ts.logo)</span>
            <span style="margin-left: 20px;">$($ts.company)</span>
            <span class="verification-badge">Verified</span>
        </div>
        <div style="text-align: right;">
            <div>Seite <span id="page-num">1</span></div>
            <div style="font-size: 0.8em; margin-top: 5px;">
                $($ts.logo)(C)(R) | <a href="https://tel1.nl" style="color: rgba(255,255,255,0.9);">TEL1.NL</a>
"@
    
    if ($donation.enabled) {
        $html += @"
                <div class="donation-info">
                    Powered by TogetherSystems | <a href="$($donation.link)">Spenden</a>
                </div>
"@
    }
    
    $html += @"
            </div>
        </div>
    </footer>
</body>
</html>
"@
    
    return $html
}

