# Convert all .md files to .html files for browser display
# This script converts all markdown files to standalone HTML files

$ErrorActionPreference = "Stop"

Write-Host "🔄 Konvertiere alle .md Dateien zu .html..." -ForegroundColor Cyan
Write-Host ""

$baseDir = $PSScriptRoot
$mdFiles = Get-ChildItem -Path $baseDir -Filter "*.md" -Recurse | Where-Object {
    $_.FullName -notmatch 'node_modules|\.git|branding\\original'
}

$converted = 0
$failed = 0

foreach ($mdFile in $mdFiles) {
    try {
        $mdPath = $mdFile.FullName
        $htmlPath = $mdPath -replace '\.md$', '.html'
        $relativePath = $mdPath.Replace($baseDir + '\', '').Replace('\', '/')
        
        # Read markdown content
        $mdContent = Get-Content -Path $mdPath -Raw -Encoding UTF8
        
        # Simple markdown to HTML conversion
        $html = $mdContent
        
        # Headers
        $html = $html -replace '(?m)^#### (.*)$', '<h4>$1</h4>'
        $html = $html -replace '(?m)^### (.*)$', '<h3>$1</h3>'
        $html = $html -replace '(?m)^## (.*)$', '<h2>$1</h2>'
        $html = $html -replace '(?m)^# (.*)$', '<h1>$1</h1>'
        
        # Bold
        $html = $html -replace '\*\*(.*?)\*\*', '<strong>$1</strong>'
        
        # Italic
        $html = $html -replace '(?<!\*)\*(?!\*)([^*]+?)(?<!\*)\*(?!\*)', '<em>$1</em>'
        
        # Code blocks
        $html = $html -replace '(?s)```([^`]+)```', '<pre><code>$1</code></pre>'
        
        # Inline code
        $html = $html -replace '`([^`]+)`', '<code>$1</code>'
        
        # Links
        $html = $html -replace '\[([^\]]+)\]\(([^)]+)\)', '<a href="$2">$1</a>'
        
        # Lists (simple)
        $lines = $html -split "`n"
        $newLines = @()
        $inList = $false
        
        foreach ($line in $lines) {
            $trimmed = $line.Trim()
            
            if ($trimmed -match '^[\-\*\+] (.+)') {
                if (-not $inList) {
                    $newLines += '<ul>'
                    $inList = $true
                }
                $newLines += "<li>$($matches[1])</li>"
            }
            elseif ($trimmed -match '^\d+\. (.+)') {
                if (-not $inList) {
                    $newLines += '<ol>'
                    $inList = $true
                }
                $newLines += "<li>$($matches[1])</li>"
            }
            else {
                if ($inList) {
                    $newLines += '</ul>'
                    $inList = $false
                }
                if ($trimmed) {
                    if ($trimmed -notmatch '^<[h1-6]') {
                        $newLines += "<p>$trimmed</p>"
                    } else {
                        $newLines += $line
                    }
                }
            }
        }
        
        if ($inList) {
            $newLines += '</ul>'
        }
        
        $html = $newLines -join "`n"
        
        # Get title
        $titleMatch = $mdContent -match '(?m)^# (.+)$'
        $title = if ($titleMatch) { $Matches[1] } else { [System.IO.Path]::GetFileNameWithoutExtension($mdFile.Name) }
        
        # Create full HTML page
        $fullHtml = @"
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$title</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6; color: #333; background: #f5f5f5;
            padding: 20px; max-width: 1200px; margin: 0 auto;
        }
        .container {
            background: white; padding: 40px; border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { color: #e94560; border-bottom: 3px solid #e94560; padding-bottom: 10px; margin-bottom: 30px; }
        h2 { color: #0f3460; margin-top: 30px; margin-bottom: 15px; }
        h3 { color: #16213e; margin-top: 25px; margin-bottom: 10px; }
        h4 { color: #1a1a2e; margin-top: 20px; margin-bottom: 10px; }
        p { margin-bottom: 15px; }
        ul, ol { margin-left: 30px; margin-bottom: 15px; }
        li { margin-bottom: 8px; }
        pre {
            background: #f0f0f0; padding: 15px; border-radius: 5px;
            overflow-x: auto; border-left: 4px solid #e94560; margin: 15px 0;
        }
        code {
            background: #f0f0f0; padding: 2px 6px; border-radius: 3px;
            font-family: 'Courier New', monospace; font-size: 0.9em;
        }
        pre code { background: none; padding: 0; }
        a { color: #e94560; text-decoration: underline; }
        a:hover { color: #0f3460; }
        hr { border: none; border-top: 2px solid #e94560; margin: 30px 0; }
        .back-button {
            display: inline-block; margin-bottom: 20px; padding: 10px 20px;
            background: #e94560; color: white; text-decoration: none; border-radius: 5px;
        }
        .back-button:hover { background: #0f3460; }
        .footer {
            margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd;
            color: #666; font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <a href="javascript:history.back()" class="back-button">← Zurück</a>
        $html
        <div class="footer">
            <p><small>Quelle: $relativePath</small></p>
        </div>
    </div>
</body>
</html>
"@
        
        # Write HTML file
        [System.IO.File]::WriteAllText($htmlPath, $fullHtml, [System.Text.Encoding]::UTF8)
        
        Write-Host "✅ Konvertiert: $relativePath" -ForegroundColor Green
        $converted++
    }
    catch {
        Write-Host "❌ Fehler bei $($mdFile.Name): $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "📊 Zusammenfassung:" -ForegroundColor Cyan
Write-Host "  ✅ Konvertiert: $converted" -ForegroundColor Green
Write-Host "  ❌ Fehler: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host ""
Write-Host "✨ Fertig! Alle .md Dateien wurden zu .html konvertiert." -ForegroundColor Green

