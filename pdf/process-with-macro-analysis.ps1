# Comprehensive Bank Statement Processing with Macro-Economic Analysis
# Professionelle Verarbeitung mit makroökonomischer Analyse

param(
    [Parameter(Mandatory = $false)]
    [string]$InputPdf = "C:\Users\Gebruiker\Documents\01db.com\RA_A_NL42RABO0157848272_EUR_20250101_20251204.FABRIKAGE.pdf",
    [Parameter(Mandatory = $false)]
    [string]$OutputDir = "",
    [switch]$ExtractInfo,
    [switch]$MacroAnalysis,
    [switch]$AddHeader,
    [switch]$FullProcessing
)

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Err($msg) { Write-Host "[ERR] $msg" -ForegroundColor Red }
function Write-Warn($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Setze Output-Verzeichnis
if ($OutputDir -eq "") {
    $OutputDir = Join-Path (Split-Path -Parent $InputPdf) "analysis_output"
}

if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

Write-Info "=========================================="
Write-Info "MACRO-ECONOMIC BANK STATEMENT PROCESSOR"
Write-Info "=========================================="
Write-Host ""

# Prüfe Eingabedatei
if (!(Test-Path $InputPdf)) {
    Write-Err "PDF-Datei nicht gefunden: $InputPdf"
    exit 1
}

Write-Success "PDF gefunden: $InputPdf"
Write-Info "Output-Verzeichnis: $OutputDir"
Write-Host ""

# 1. Basis-Informationen extrahieren
if ($ExtractInfo -or $FullProcessing) {
    Write-Info "📄 Schritt 1: Extrahiere Basis-Informationen..."
    
    $infoScript = Join-Path $ScriptDir "extract_pdf_info.py"
    $infoOutput = Join-Path $OutputDir "pdf_info.txt"
    
    try {
        $pythonCmd = "python"
        if (Get-Command py -ErrorAction SilentlyContinue) {
            $pythonCmd = "py"
        }
        
        & $pythonCmd $infoScript $InputPdf | Out-File -FilePath $infoOutput -Encoding UTF8
        Write-Success "Basis-Informationen gespeichert: $infoOutput"
    } catch {
        Write-Warn "Konnte Basis-Informationen nicht extrahieren: $_"
    }
    Write-Host ""
}

# 2. Makroökonomische Analyse
if ($MacroAnalysis -or $FullProcessing) {
    Write-Info "📊 Schritt 2: Führe makroökonomische Analyse durch..."
    
    $analyzerScript = Join-Path $ScriptDir "macro-economic-analyzer.py"
    $analysisOutput = Join-Path $OutputDir "macro_analysis.json"
    $reportOutput = Join-Path $OutputDir "macro_report.html"
    
    try {
        $pythonCmd = "python"
        if (Get-Command py -ErrorAction SilentlyContinue) {
            $pythonCmd = "py"
        }
        
        # Führe Analyse aus
        Write-Info "Analysiere Transaktionen und berechne Metriken..."
        & $pythonCmd $analyzerScript $InputPdf $analysisOutput
        
        if (Test-Path $analysisOutput) {
            Write-Success "Makroökonomische Analyse gespeichert: $analysisOutput"
            
            # Generiere HTML-Report
            Write-Info "Generiere HTML-Report..."
            $htmlReport = Generate-HTMLReport -JsonFile $analysisOutput -OutputFile $reportOutput
            Write-Success "HTML-Report gespeichert: $reportOutput"
        }
    } catch {
        Write-Err "Makroökonomische Analyse fehlgeschlagen: $_"
        Write-Warn "Stelle sicher, dass PyMuPDF installiert ist: pip install PyMuPDF"
    }
    Write-Host ""
}

# 3. PDF mit Header/Logo verarbeiten
if ($AddHeader -or $FullProcessing) {
    Write-Info "🎨 Schritt 3: Verarbeite PDF mit Header/Logo..."
    
    $processedPdf = Join-Path $OutputDir "RA_PROCESSED.pdf"
    $fabrikageScript = Join-Path $ScriptDir "run_fabrikage_pdf.ps1"
    
    if (Test-Path $fabrikageScript) {
        try {
            & $fabrikageScript -Input $InputPdf -Output $processedPdf
            if (Test-Path $processedPdf) {
                Write-Success "Verarbeitete PDF gespeichert: $processedPdf"
            }
        } catch {
            Write-Warn "PDF-Verarbeitung fehlgeschlagen: $_"
        }
    } else {
        Write-Warn "Fabrikage Script nicht gefunden: $fabrikageScript"
    }
    Write-Host ""
}

Write-Info "=========================================="
Write-Success "Verarbeitung abgeschlossen!"
Write-Info "=========================================="
Write-Host ""
Write-Info "Ergebnisse:"
Write-Host "  📁 Output-Verzeichnis: $OutputDir"
if ($ExtractInfo -or $FullProcessing) {
    Write-Host "  📄 PDF-Informationen: pdf_info.txt"
}
if ($MacroAnalysis -or $FullProcessing) {
    Write-Host "  📊 Makro-Analyse: macro_analysis.json"
    Write-Host "  📈 HTML-Report: macro_report.html"
}
if ($AddHeader -or $FullProcessing) {
    Write-Host "  🎨 Verarbeitete PDF: RA_PROCESSED.pdf"
}
Write-Host ""

function Generate-HTMLReport {
    param(
        [string]$JsonFile,
        [string]$OutputFile
    )
    
    $json = Get-Content $JsonFile -Raw | ConvertFrom-Json
    
    $html = @"
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Makroökonomische Analyse - Bankauszug</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
        .metric-box { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .indicator { display: inline-block; padding: 5px 10px; border-radius: 3px; margin: 5px; font-weight: bold; }
        .indicator-good { background: #4caf50; color: white; }
        .indicator-warning { background: #ff9800; color: white; }
        .indicator-danger { background: #f44336; color: white; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background: #3498db; color: white; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📊 Makroökonomische Analyse - Bankauszug</h1>
        <p><strong>Analysedatum:</strong> $($json.metadata.analysis_date)</p>
        <p><strong>PDF:</strong> $($json.metadata.pdf_file)</p>
        
        <h2>Makroökonomische Metriken</h2>
        <div class="metric-box">
            <p><strong>Gesamttransaktionen:</strong> $($json.macro_metrics.total_transactions)</p>
            <p><strong>Gesamtvolumen:</strong> €$([math]::Round($json.macro_metrics.total_volume, 2))</p>
            <p><strong>Netto-Cashflow:</strong> €$([math]::Round($json.macro_metrics.net_flow, 2))</p>
            <p><strong>Durchschnittliche Transaktion:</strong> €$([math]::Round($json.macro_metrics.average_transaction, 2))</p>
        </div>
        
        <h2>Wirtschaftsindikatoren</h2>
        <table>
            <tr><th>Indikator</th><th>Wert</th><th>Bewertung</th></tr>
"@
    
    foreach ($key in $json.economic_indicators.PSObject.Properties.Name) {
        $value = $json.economic_indicators.$key
        $class = if ($value -gt 0.7) { "indicator-good" } elseif ($value -gt 0.4) { "indicator-warning" } else { "indicator-danger" }
        $html += "<tr><td>$key</td><td>$([math]::Round($value, 3))</td><td><span class='indicator $class'>$([math]::Round($value * 100, 1))%</span></td></tr>"
    }
    
    $html += @"
        </table>
        
        <h2>Empfehlungen</h2>
        <ul>
"@
    
    foreach ($rec in $json.recommendations) {
        $html += "<li>$rec</li>"
    }
    
    $html += @"
        </ul>
    </div>
</body>
</html>
"@
    
    $html | Out-File -FilePath $OutputFile -Encoding UTF8
    return $OutputFile
}

