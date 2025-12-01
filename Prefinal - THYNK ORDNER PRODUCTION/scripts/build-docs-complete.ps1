# ================================================================
# BUILD: ALLE MD-DATEIEN → HTML (PowerShell-Version)
# ================================================================
# Findet ALLE .md Dateien rekursiv und konvertiert sie zu HTML
# Erstellt vollständige HTML-Seiten mit Navigation und Styling
# ================================================================

$ErrorActionPreference = "Continue"

$baseDir = Split-Path -Parent $PSScriptRoot
$excludePaths = @('node_modules', '.git', 'tests\node_modules', 'thynk-original', '.cursor')

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📖 BUILD: ALLE MD-DATEIEN → HTML" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Prüfe ob Node.js verfügbar ist
$nodeAvailable = Get-Command node -ErrorAction SilentlyContinue
if ($nodeAvailable) {
    Write-Host "✅ Node.js gefunden - verwende JavaScript-Version" -ForegroundColor Green
    Write-Host ""
    & node "$baseDir\scripts\build-docs-complete.js"
    exit $LASTEXITCODE
}

# Fallback: PowerShell-Version
Write-Host "📝 Verwende PowerShell-Version..." -ForegroundColor Yellow
Write-Host ""

# Finde alle MD-Dateien
Write-Host "🔍 Suche alle .md Dateien..." -ForegroundColor Yellow
$mdFiles = Get-ChildItem -Path $baseDir -Filter "*.md" -Recurse | Where-Object {
    $relativePath = $_.FullName.Replace($baseDir + '\', '').Replace('\', '/')
    $shouldExclude = $false
    foreach ($exclude in $excludePaths) {
        if ($relativePath -like "*$exclude*") {
            $shouldExclude = $true
            break
        }
    }
    return -not $shouldExclude
}

Write-Host "✅ $($mdFiles.Count) MD-Dateien gefunden" -ForegroundColor Green
Write-Host ""

$converted = 0
$failed = 0

foreach ($mdFile in $mdFiles) {
    try {
        $mdContent = Get-Content -Path $mdFile.FullName -Raw -Encoding UTF8
        
        # Extrahiere Titel
        $title = [System.IO.Path]::GetFileNameWithoutExtension($mdFile.Name)
        if ($mdContent -match '(?m)^#\s+(.+)') {
            $title = $matches[1] -replace '<.*?>', ''
        }
        
        # Einfache Markdown-Konvertierung
        $htmlBody = $mdContent
        $htmlBody = $htmlBody -replace '(?m)^####\s+(.+)$', '<h4>$1</h4>'
        $htmlBody = $htmlBody -replace '(?m)^###\s+(.+)$', '<h3>$1</h3>'
        $htmlBody = $htmlBody -replace '(?m)^##\s+(.+)$', '<h2>$1</h2>'
        $htmlBody = $htmlBody -replace '(?m)^#\s+(.+)$', '<h1>$1</h1>'
        $htmlBody = $htmlBody -replace '\*\*(.*?)\*\*', '<strong>$1</strong>'
        $htmlBody = $htmlBody -replace '(?s)```([^`]+)```', '<pre><code>$1</code></pre>'
        $htmlBody = $htmlBody -replace '`([^`]+)`', '<code>$1</code>'
        $htmlBody = $htmlBody -replace '\[([^\]]+)\]\(([^)]+)\)', '<a href="$2" target="_blank">$1</a>'
        
        # Erstelle vollständige HTML-Seite
        $html = @"
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$title</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .back-link { display: inline-block; margin-bottom: 30px; padding: 10px 20px; background: #e94560; color: white; text-decoration: none; border-radius: 5px; font-weight: 500; }
        .back-link:hover { background: #d63447; }
        h1 { color: #e94560; border-bottom: 3px solid #e94560; padding-bottom: 10px; margin-bottom: 30px; }
        h2 { color: #0f3460; margin-top: 40px; margin-bottom: 20px; }
        h3 { color: #16213e; margin-top: 30px; margin-bottom: 15px; }
        h4 { color: #16213e; margin-top: 20px; margin-bottom: 10px; }
        p { margin-bottom: 15px; }
        pre { background: #f5f5f5; padding: 15px; border-left: 4px solid #e94560; overflow-x: auto; margin: 20px 0; border-radius: 4px; }
        code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; font-family: 'Courier New', monospace; }
        a { color: #e94560; text-decoration: underline; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 0.9em; color: #666; text-align: center; }
    </style>
</head>
<body>
    <div class="container">
        <a href="javascript:history.back()" class="back-link">← Zurück</a>
        <h1>$title</h1>
        <div class="content">
            $htmlBody
        </div>
        <div class="footer">
            <p>THYNK ORDERS - Dokumentation</p>
            <p>Generiert: $(Get-Date -Format "dd.MM.yyyy HH:mm:ss")</p>
        </div>
    </div>
</body>
</html>
"@
        
        $htmlPath = $mdFile.FullName -replace '\.md$', '.html'
        [System.IO.File]::WriteAllText($htmlPath, $html, [System.Text.Encoding]::UTF8)
        
        $relativePath = $mdFile.FullName.Replace($baseDir + '\', '')
        Write-Host "✅ $relativePath" -ForegroundColor Green
        $converted++
        
    } catch {
        $relativePath = $mdFile.FullName.Replace($baseDir + '\', '')
        Write-Host "❌ $relativePath : $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ Erfolgreich konvertiert: $converted" -ForegroundColor Green
Write-Host "  ❌ Fehler: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($failed -eq 0) {
    Write-Host "✨ Alle MD-Dateien erfolgreich zu HTML konvertiert!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "⚠️  Einige Dateien konnten nicht konvertiert werden." -ForegroundColor Yellow
    exit 1
}

