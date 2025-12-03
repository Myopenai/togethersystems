# Einfaches Script: Alle .md Dateien zu .html konvertieren
# Version: Optimiert für große Dateimengen

$ErrorActionPreference = "Continue"

$baseDir = $PSScriptRoot
Write-Host "🔍 Suche nach .md Dateien in: $baseDir" -ForegroundColor Cyan

# Finde alle .md Dateien (ohne node_modules, .git, etc.)
$mdFiles = Get-ChildItem -Path $baseDir -Filter "*.md" -Recurse -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch '(\\node_modules\\|\\.git\\|\\dist\\|\\build\\)'
}

Write-Host "📄 Gefunden: $($mdFiles.Count) .md Dateien" -ForegroundColor Green
Write-Host ""

$converted = 0
$skipped = 0
$failed = 0

foreach ($mdFile in $mdFiles) {
    $htmlPath = $mdFile.FullName -replace '\.md$', '.html'
    
    # Überspringe wenn HTML bereits existiert und neuer ist
    if (Test-Path $htmlPath) {
        $mdTime = $mdFile.LastWriteTime
        $htmlTime = (Get-Item $htmlPath).LastWriteTime
        if ($htmlTime -ge $mdTime) {
            $skipped++
            continue
        }
    }
    
    try {
        # Lese Markdown-Inhalt
        $content = Get-Content -Path $mdFile.FullName -Raw -Encoding UTF8
        
        # Extrahiere Titel (erste H1)
        $titleMatch = [regex]::Match($content, '(?m)^#\s+(.+)$')
        $title = if ($titleMatch.Success) { 
            $titleMatch.Groups[1].Value 
        } else { 
            [System.IO.Path]::GetFileNameWithoutExtension($mdFile.Name) 
        }
        
        # Erstelle HTML-Wrapper
        $htmlBody = $content
        
        # Einfache Markdown-Konvertierung (nur wichtigste Elemente)
        $htmlBody = $htmlBody -replace '(?m)^#\s+(.+)$', '<h1>$1</h1>'
        $htmlBody = $htmlBody -replace '(?m)^##\s+(.+)$', '<h2>$1</h2>'
        $htmlBody = $htmlBody -replace '(?m)^###\s+(.+)$', '<h3>$1</h3>'
        $htmlBody = $htmlBody -replace '(?m)^####\s+(.+)$', '<h4>$1</h4>'
        $htmlBody = $htmlBody -replace '\*\*([^*]+)\*\*', '<strong>$1</strong>'
        $htmlBody = $htmlBody -replace '(?s)```([^`]+)```', '<pre><code>$1</code></pre>'
        $htmlBody = $htmlBody -replace '`([^`]+)`', '<code>$1</code>'
        $htmlBody = $htmlBody -replace '(?m)^-\s+(.+)$', '<li>$1</li>'
        $htmlBody = $htmlBody -replace '(?m)^\d+\.\s+(.+)$', '<li>$1</li>'
        $htmlBody = $htmlBody -replace '\[([^\]]+)\]\(([^)]+)\)', '<a href="$2">$1</a>'
        
        # HTML-Seite erstellen
        $fullHtml = @"
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$($title -replace '<.*?>', '')</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 40px auto; padding: 20px; line-height: 1.6; }
        h1 { color: #e94560; border-bottom: 3px solid #e94560; padding-bottom: 10px; }
        h2 { color: #0f3460; margin-top: 30px; }
        h3 { color: #16213e; margin-top: 20px; }
        pre { background: #f5f5f5; padding: 15px; border-left: 4px solid #e94560; overflow-x: auto; }
        code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
        a { color: #e94560; }
        li { margin: 5px 0; }
    </style>
</head>
<body>
    <a href="javascript:history.back()" style="display: inline-block; margin-bottom: 20px; padding: 10px 20px; background: #e94560; color: white; text-decoration: none; border-radius: 5px;">← Zurück</a>
    $htmlBody
</body>
</html>
"@
        
        # Speichere HTML
        [System.IO.File]::WriteAllText($htmlPath, $fullHtml, [System.Text.Encoding]::UTF8)
        
        $converted++
        if ($converted % 10 -eq 0) {
            Write-Host "  ✅ $converted Dateien konvertiert..." -ForegroundColor Yellow
        }
    }
    catch {
        Write-Host "  ❌ Fehler: $($mdFile.Name) - $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "📊 Zusammenfassung:" -ForegroundColor Cyan
Write-Host "  ✅ Konvertiert: $converted" -ForegroundColor Green
Write-Host "  ⏭️  Übersprungen (bereits vorhanden): $skipped" -ForegroundColor Yellow
Write-Host "  ❌ Fehler: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host ""
Write-Host "✨ Fertig!" -ForegroundColor Green

