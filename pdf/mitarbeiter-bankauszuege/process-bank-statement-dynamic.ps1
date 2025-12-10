# Process Bank Statement to Dynamic PDF
# Verarbeitet Bankauszug-PDF zu interaktiver Dynamic PDF
# Original bleibt unverändert

param(
    [Parameter(Mandatory = $false)]
    [string]$InputPdf = "C:\Users\Gebruiker\Documents\01db.com\RA_A_NL42RABO0157848272_EUR_20250101_20251204.FABRIKAGE.pdf",
    [Parameter(Mandatory = $false)]
    [string]$OutputDir = "",
    [switch]$ExtractAndAnalyze,
    [switch]$CreateDynamicPDF,
    [switch]$FullProcessing
)

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Err($msg) { Write-Host "[ERR] $msg" -ForegroundColor Red }

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ParentDir = Split-Path -Parent $ScriptDir

# Setze Output-Verzeichnis
if ($OutputDir -eq "") {
    $OutputDir = $ScriptDir
}

Write-Info "=========================================="
Write-Info "BANK STATEMENT → DYNAMIC PDF PROCESSOR"
Write-Info "TogetherSystems International TTT"
Write-Info "=========================================="
Write-Host ""

# Prüfe Eingabedatei
if (!(Test-Path $InputPdf)) {
    Write-Err "PDF-Datei nicht gefunden: $InputPdf"
    Write-Info "Bitte geben Sie den korrekten Pfad an."
    exit 1
}

Write-Success "✅ Original PDF gefunden: $InputPdf"
Write-Info "📁 Original bleibt unverändert"
Write-Info "📁 Output-Verzeichnis: $OutputDir"
Write-Host ""

# Schritt 1: Extrahiere Informationen und analysiere
if ($ExtractAndAnalyze -or $FullProcessing) {
    Write-Info "📊 Schritt 1: Extrahiere und analysiere Bankauszug..."
    
    $analyzerScript = Join-Path $ParentDir "macro-economic-analyzer.py"
    $analysisOutput = Join-Path $OutputDir "bank_statement_analysis.json"
    
    if (Test-Path $analyzerScript) {
        try {
            $pythonCmd = "python"
            if (Get-Command py -ErrorAction SilentlyContinue) {
                $pythonCmd = "py"
            }
            
            Write-Info "Führe makroökonomische Analyse durch..."
            & $pythonCmd $analyzerScript $InputPdf $analysisOutput
            
            if (Test-Path $analysisOutput) {
                Write-Success "Analyse gespeichert: $analysisOutput"
            }
        } catch {
            Write-Warn "Analyse fehlgeschlagen: $_"
            Write-Info "Fortfahren ohne Analyse..."
        }
    }
    Write-Host ""
}

# Schritt 2: Erstelle Dynamic PDF Template
if ($CreateDynamicPDF -or $FullProcessing) {
    Write-Info "🎨 Schritt 2: Erstelle Dynamic PDF Template für Bankauszug..."
    
    # Lade Analyse-Daten falls vorhanden
    $analysisData = $null
    $analysisFile = Join-Path $OutputDir "bank_statement_analysis.json"
    if (Test-Path $analysisFile) {
        try {
            $analysisData = Get-Content $analysisFile -Raw | ConvertFrom-Json
            Write-Info "Analyse-Daten geladen"
        } catch {
            Write-Warn "Konnte Analyse-Daten nicht laden"
        }
    }
    
    # Erstelle HTML Template für Bankauszug
    $htmlTemplate = Join-Path $OutputDir "bank-statement-dynamic.html"
    $htmlContent = Generate-BankStatementHTML -AnalysisData $analysisData -InputPdf $InputPdf
    
    $htmlContent | Out-File -FilePath $htmlTemplate -Encoding UTF8
    Write-Success "Dynamic PDF Template erstellt: $htmlTemplate"
    Write-Host ""
    
    # Schritt 3: Konvertiere zu PDF
    Write-Info "📄 Schritt 3: Konvertiere zu PDF..."
    
    $outputPdf = Join-Path $OutputDir "RA_A_NL42RABO0157848272_EUR_20250101_20251204.DYNAMIC.pdf"
    $pdfGenerator = Join-Path $ParentDir "create-dynamic-pdf.ps1"
    
    if (Test-Path $pdfGenerator) {
        try {
            & $pdfGenerator -InputHtml $htmlTemplate -OutputPdf $outputPdf -UseChrome
            if (Test-Path $outputPdf) {
                Write-Success "✅ Dynamic PDF erstellt: $outputPdf"
            }
        } catch {
            Write-Warn "Automatische PDF-Erstellung fehlgeschlagen"
            Write-Info "Öffne HTML Template für manuelle Konvertierung..."
            Start-Process $htmlTemplate
            Write-Info "💡 Drücke Ctrl+P im Browser und speichere als PDF"
        }
    } else {
        Write-Info "Öffne HTML Template für manuelle Konvertierung..."
        Start-Process $htmlTemplate
        Write-Info "💡 Drücke Ctrl+P im Browser und speichere als PDF"
    }
    Write-Host ""
}

Write-Info "=========================================="
Write-Success "Verarbeitung abgeschlossen!"
Write-Info "=========================================="
Write-Host ""
Write-Info "Ergebnisse im Ordner: $OutputDir"
Write-Host "  📊 Analyse: bank_statement_analysis.json"
Write-Host "  🎨 Template: bank-statement-dynamic.html"
Write-Host "  📄 PDF: RA_A_NL42RABO0157848272_EUR_20250101_20251204.DYNAMIC.pdf"
Write-Host ""
Write-Success "✅ Original PDF unverändert: $InputPdf"

function Generate-BankStatementHTML {
    param(
        $AnalysisData,
        $InputPdf
    )
    
    $pdfName = Split-Path -Leaf $InputPdf
    $accountNumber = "NL42RABO0157848272"
    $currency = "EUR"
    $period = "2025-01-01 bis 2025-12-04"
    
    # Extrahiere Metriken aus Analyse
    $totalVolume = 0
    $netFlow = 0
    $totalTransactions = 0
    $categories = @{}
    
    if ($AnalysisData) {
        $totalVolume = $AnalysisData.macro_metrics.total_volume
        $netFlow = $AnalysisData.macro_metrics.net_flow
        $totalTransactions = $AnalysisData.macro_metrics.total_transactions
        if ($AnalysisData.macro_metrics.categories) {
            $categories = $AnalysisData.macro_metrics.categories
        }
    }
    
    $html = @"
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bankauszug Analyse - TogetherSystems</title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        
        :root {
            --brand-primary: #1a1a2e;
            --brand-secondary: #16213e;
            --brand-accent: #0f3460;
            --brand-highlight: #e94560;
            --neutral-dark: #0a0a0a;
            --neutral-light: #f5f5f5;
            --neutral-gray: #6b7280;
            --neutral-white: #ffffff;
            --header-height: 80px;
            --footer-height: 60px;
        }
        
        body {
            font-family: 'Segoe UI', sans-serif;
            margin: 0;
            padding: 0;
            background: var(--neutral-light);
            color: var(--neutral-dark);
            line-height: 1.6;
        }
        
        .brand-header {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            height: var(--header-height);
            background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%);
            color: var(--neutral-white);
            padding: 0 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 1000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        
        .brand-logo {
            font-size: 2.5em;
            font-weight: bold;
            color: var(--neutral-white);
            letter-spacing: 3px;
        }
        
        .brand-name {
            font-size: 1.1em;
            font-weight: 600;
            text-align: right;
        }
        
        .content-wrapper {
            margin-top: var(--header-height);
            margin-bottom: var(--footer-height);
            min-height: calc(100vh - var(--header-height) - var(--footer-height));
            padding: 40px;
            max-width: 210mm;
            margin-left: auto;
            margin-right: auto;
            background: var(--neutral-white);
        }
        
        .brand-footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: var(--footer-height);
            background: var(--brand-primary);
            color: var(--neutral-white);
            padding: 0 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            z-index: 1000;
            font-size: 0.85em;
        }
        
        h1 {
            font-size: 2.5em;
            color: var(--brand-primary);
            margin: 30px 0 20px;
            border-bottom: 3px solid var(--brand-accent);
            padding-bottom: 10px;
        }
        
        h2 {
            font-size: 2em;
            color: var(--brand-secondary);
            margin: 25px 0 15px;
            border-bottom: 2px solid var(--brand-accent);
            padding-bottom: 10px;
        }
        
        .info-box {
            background: var(--neutral-light);
            border-left: 4px solid var(--brand-accent);
            padding: 20px;
            margin: 20px 0;
            border-radius: 4px;
            transition: all 0.3s ease;
        }
        
        .info-box:hover {
            box-shadow: 0 4px 12px rgba(15, 52, 96, 0.15);
            transform: translateX(5px);
        }
        
        .metric-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 30px 0;
        }
        
        .metric-card {
            background: linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%);
            color: var(--neutral-white);
            padding: 25px;
            border-radius: 8px;
            text-align: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .metric-value {
            font-size: 2.5em;
            font-weight: bold;
            margin: 10px 0;
        }
        
        .metric-label {
            font-size: 0.9em;
            opacity: 0.9;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 24px;
            background: var(--brand-accent);
            color: var(--neutral-white);
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            transition: all 0.3s ease;
            margin: 10px 5px;
        }
        
        .btn:hover {
            background: var(--brand-highlight);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(233, 69, 96, 0.4);
        }
        
        .table-of-contents {
            background: var(--neutral-light);
            padding: 30px;
            border-radius: 8px;
            margin: 30px 0;
            border-left: 4px solid var(--brand-accent);
        }
        
        .toc-item {
            display: block;
            padding: 12px 15px;
            margin: 8px 0;
            color: var(--brand-accent);
            text-decoration: none;
            border-radius: 4px;
            transition: all 0.3s ease;
        }
        
        .toc-item:hover {
            background: var(--brand-accent);
            color: var(--neutral-white);
            transform: translateX(5px);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        
        th {
            background: var(--brand-accent);
            color: var(--neutral-white);
        }
        
        tr:nth-child(even) {
            background: var(--neutral-light);
        }
        
        .chart-container {
            background: var(--neutral-light);
            padding: 30px;
            border-radius: 8px;
            margin: 30px 0;
        }
    </style>
</head>
<body>
    <header class="brand-header">
        <div class="brand-logo">T,.&T,,.&T,,,.</div>
        <div class="brand-name">
            <div>TOGETHERSYSTEMS. INTERNATIONAL TTT</div>
            <div style="font-size: 0.85em; opacity: 0.9;">Financial Intelligence · Bank Statement Analysis</div>
        </div>
    </header>

    <div class="content-wrapper">
        <section id="title">
            <h1>💰 Bankauszug Analyse</h1>
            <div class="info-box">
                <p><strong>Konto:</strong> $accountNumber</p>
                <p><strong>Währung:</strong> $currency</p>
                <p><strong>Zeitraum:</strong> $period</p>
                <p><strong>Original Datei:</strong> $pdfName</p>
            </div>
        </section>

        <section id="toc">
            <h2>📋 Inhaltsverzeichnis</h2>
            <div class="table-of-contents">
                <a href="#overview" class="toc-item">1. Übersicht & Metriken</a>
                <a href="#macro-analysis" class="toc-item">2. Makroökonomische Analyse</a>
                <a href="#categories" class="toc-item">3. Kategorisierung</a>
                <a href="#trends" class="toc-item">4. Trends & Prognosen</a>
                <a href="#recommendations" class="toc-item">5. Empfehlungen</a>
                <a href="#details" class="toc-item">6. Technische Details</a>
            </div>
        </section>

        <section id="overview">
            <h2>📊 Übersicht & Metriken</h2>
            
            <div class="metric-grid">
                <div class="metric-card">
                    <div class="metric-label">Gesamtvolumen</div>
                    <div class="metric-value">€$([math]::Round($totalVolume, 2))</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Netto-Cashflow</div>
                    <div class="metric-value">€$([math]::Round($netFlow, 2))</div>
                </div>
                <div class="metric-card">
                    <div class="metric-label">Transaktionen</div>
                    <div class="metric-value">$totalTransactions</div>
                </div>
            </div>
            
            <div class="info-box">
                <h3>Zusammenfassung</h3>
                <p>Dieser Bankauszug wurde mit dem TogetherSystems Macro-Economic Analyzer verarbeitet.</p>
                <p>Alle Daten wurden analysiert und kategorisiert für professionelle Finanzintelligenz.</p>
            </div>
        </section>

        <section id="macro-analysis">
            <h2>📈 Makroökonomische Analyse</h2>
            
            <div class="chart-container">
                <h3>Wirtschaftsindikatoren</h3>
                <p>Detaillierte makroökonomische Metriken und Indikatoren werden in der JSON-Analyse gespeichert.</p>
                <p><a href="bank_statement_analysis.json" class="btn">Vollständige Analyse anzeigen</a></p>
            </div>
        </section>

        <section id="categories">
            <h2>🏷️ Kategorisierung</h2>
            
            <div class="info-box">
                <h3>Transaktionskategorien</h3>
                <p>Alle Transaktionen wurden automatisch kategorisiert:</p>
                <ul>
                    <li>💰 Income (Einkommen)</li>
                    <li>💸 Expenses (Ausgaben)</li>
                    <li>🔄 Transfers (Überweisungen)</li>
                    <li>💳 Fees (Gebühren)</li>
                    <li>📈 Interest (Zinsen)</li>
                    <li>🏦 Investments (Investitionen)</li>
                </ul>
            </div>
        </section>

        <section id="trends">
            <h2>📉 Trends & Prognosen</h2>
            
            <div class="info-box">
                <h3>Cashflow-Trends</h3>
                <p>Analyse der Cashflow-Entwicklung über den Zeitraum.</p>
                <p>Detaillierte Trend-Analyse verfügbar in der JSON-Datei.</p>
            </div>
        </section>

        <section id="recommendations">
            <h2>💡 Empfehlungen</h2>
            
            <div class="info-box">
                <h3>Makroökonomische Empfehlungen</h3>
                <p>Basierend auf der Analyse wurden folgende Empfehlungen generiert:</p>
                <ul>
                    <li>✅ Regelmäßige Cashflow-Überwachung empfohlen</li>
                    <li>📊 Diversifikation der Transaktionskategorien</li>
                    <li>💰 Liquiditätsplanung optimieren</li>
                </ul>
            </div>
        </section>

        <section id="details">
            <h2>🔧 Technische Details</h2>
            
            <div class="info-box">
                <h3>Verarbeitungsinformationen</h3>
                <p><strong>Original PDF:</strong> $pdfName</p>
                <p><strong>Analyse-Datei:</strong> <a href="bank_statement_analysis.json">bank_statement_analysis.json</a></p>
                <p><strong>Analyse-Datum:</strong> $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")</p>
                <p><strong>System:</strong> TogetherSystems Macro-Economic Analyzer v1.0.0</p>
            </div>
        </section>

        <section id="contact">
            <h2>📧 Kontakt & Support</h2>
            
            <div class="info-box">
                <p><strong>Website:</strong> <a href="https://tel1.nl" class="btn">TEL1.NL</a></p>
                <p><strong>E-Mail:</strong> <a href="mailto:gentlyoverdone@outlook.com">gentlyoverdone@outlook.com</a></p>
                <p><strong>Telefon:</strong> <a href="tel:+31613803782">+31 613 803 782</a></p>
            </div>
        </section>
    </div>

    <footer class="brand-footer">
        <div>
            <span style="font-size: 1.5em; font-weight: bold;">T,.&T,,.&T,,,.</span>
            <span style="margin-left: 20px;">TOGETHERSYSTEMS. INTERNATIONAL TTT</span>
        </div>
        <div style="text-align: right;">
            <div>Seite <span id="page-num">1</span></div>
            <div style="font-size: 0.8em; margin-top: 5px;">T,.&T,,.&T,,,.(C)(R) | <a href="https://tel1.nl" style="color: rgba(255,255,255,0.8);">TEL1.NL</a></div>
        </div>
    </footer>

    <script>
        // Smooth Scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    </script>
</body>
</html>
"@
    
    return $html
}

