# Schnelles Konvertierungs-Script - Batch-Verarbeitung
$ErrorActionPreference = "Continue"

$baseDir = $PSScriptRoot
Write-Host "🔄 Starte Konvertierung..." -ForegroundColor Cyan
Write-Host ""

$mdFiles = @(Get-ChildItem -Path $baseDir -Filter "*.md" -Recurse -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch '(\\node_modules\\|\\.git\\)'
})

Write-Host "📄 Gefunden: $($mdFiles.Count) Dateien" -ForegroundColor Green
Write-Host ""

$count = 0
$total = $mdFiles.Count

foreach ($file in $mdFiles) {
    $count++
    $htmlPath = $file.FullName -replace '\.md$', '.html'
    
    if (Test-Path $htmlPath) {
        Write-Host "[$count/$total] ⏭️  Übersprungen: $($file.Name)" -ForegroundColor Yellow
        continue
    }
    
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        $title = if ($content -match '(?m)^#\s+(.+)') { $matches[1] } else { $file.BaseName }
        $title = $title -replace '<.*?>', ''
        
        $body = $content
        $body = $body -replace '(?m)^#\s+(.+)$', '<h1>$1</h1>'
        $body = $body -replace '(?m)^##\s+(.+)$', '<h2>$1</h2>'
        $body = $body -replace '(?m)^###\s+(.+)$', '<h3>$1</h3>'
        $body = $body -replace '(?m)^####\s+(.+)$', '<h4>$1</h4>'
        $body = $body -replace '\*\*([^*]+)\*\*', '<strong>$1</strong>'
        $body = $body -replace '(?s)```([^`]+)```', '<pre><code>$1</code></pre>'
        $body = $body -replace '`([^`]+)`', '<code>$1</code>'
        $body = $body -replace '\[([^\]]+)\]\(([^)]+)\)', '<a href="$2">$1</a>'
        
        $html = @"
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$title</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 40px auto; padding: 20px; line-height: 1.6; }
        h1 { color: #e94560; border-bottom: 3px solid #e94560; padding-bottom: 10px; }
        h2 { color: #0f3460; margin-top: 30px; }
        h3 { color: #16213e; margin-top: 20px; }
        pre { background: #f5f5f5; padding: 15px; border-left: 4px solid #e94560; overflow-x: auto; }
        code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
        a { color: #e94560; }
    </style>
</head>
<body>
    <a href="javascript:history.back()" style="display: inline-block; margin-bottom: 20px; padding: 10px 20px; background: #e94560; color: white; text-decoration: none; border-radius: 5px;">← Zurück</a>
    $body
</body>
</html>
"@
        
        [System.IO.File]::WriteAllText($htmlPath, $html, [System.Text.Encoding]::UTF8)
        Write-Host "[$count/$total] ✅ $($file.Name)" -ForegroundColor Green
    }
    catch {
        Write-Host "[$count/$total] ❌ $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✨ Fertig!" -ForegroundColor Green

