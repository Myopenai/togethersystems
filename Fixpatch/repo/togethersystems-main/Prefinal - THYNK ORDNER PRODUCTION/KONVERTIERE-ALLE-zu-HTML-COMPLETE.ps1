# ================================================================
# VOLLSTÄNDIGE HTML-KONVERTIERUNG - ALLE .md DATEIEN
# ================================================================
# Konvertiert ALLE Markdown-Dateien zu HTML - KEINE AUSLASSEN!
# Erstellt auch eine klickbare Index-Seite mit allen Dokumentationen
# ================================================================

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🔄 VOLLSTÄNDIGE HTML-KONVERTIERUNG" -ForegroundColor Cyan
Write-Host "  ALLE .md DATEIEN → HTML (KEINE AUSLASSEN!)" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$baseDir = $PSScriptRoot
Write-Host "📁 Basis-Ordner: $baseDir" -ForegroundColor Yellow
Write-Host ""

# Finde ALLE .md Dateien - KEINE AUSLASSEN (außer node_modules, .git)
Write-Host "🔍 Suche nach ALLEN .md Dateien..." -ForegroundColor Cyan

$mdFiles = @(Get-ChildItem -Path $baseDir -Filter "*.md" -Recurse -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch '(\\node_modules\\|\\.git\\)' -and
    $_.FullName -notmatch '(\\dist\\|\\build\\)'
} | Sort-Object FullName)

Write-Host "📄 Gefunden: $($mdFiles.Count) .md Dateien" -ForegroundColor Green
Write-Host ""

# Statistik
$stats = @{
    Total = $mdFiles.Count
    Converted = 0
    Skipped = 0
    Failed = 0
    Categories = @{}
}

# Liste für Index
$indexList = @()

# HTML-Template für einzelne Dateien
function Get-HTMLTemplate {
    param($title, $body, $relativePath, $navLinks)
    
    $navHtml = if ($navLinks.Count -gt 0) {
        $links = $navLinks | ForEach-Object {
            "<a href='$($_.Path)' class='nav-link'>$($_.Title)</a>"
        }
        "<div class='navigation'><h4>Navigation:</h4>$($links -join ' | ')</div>"
    } else { "" }
    
    return @"
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$($title -replace '<.*?>', '')</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            background: white;
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        .header {
            border-bottom: 3px solid #e94560;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        h1 {
            color: #e94560;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        h2 {
            color: #0f3460;
            margin-top: 40px;
            margin-bottom: 20px;
            border-left: 4px solid #0f3460;
            padding-left: 15px;
        }
        h3 {
            color: #16213e;
            margin-top: 30px;
            margin-bottom: 15px;
        }
        h4 {
            color: #1a1a2e;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        p {
            margin-bottom: 15px;
            text-align: justify;
        }
        ul, ol {
            margin-left: 30px;
            margin-bottom: 15px;
        }
        li {
            margin-bottom: 8px;
        }
        pre {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 5px;
            overflow-x: auto;
            border-left: 4px solid #e94560;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
        }
        code {
            background: #f5f5f5;
            padding: 3px 8px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            font-size: 0.9em;
        }
        pre code {
            background: none;
            padding: 0;
        }
        a {
            color: #e94560;
            text-decoration: none;
            font-weight: 500;
        }
        a:hover {
            color: #0f3460;
            text-decoration: underline;
        }
        .navigation {
            background: #f0f0f0;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        .navigation h4 {
            margin: 0 0 10px 0;
            color: #0f3460;
        }
        .nav-link {
            color: #e94560;
            margin: 0 10px;
        }
        hr {
            border: none;
            border-top: 2px solid #e94560;
            margin: 30px 0;
        }
        .back-button {
            display: inline-block;
            margin-bottom: 20px;
            padding: 12px 25px;
            background: linear-gradient(135deg, #e94560 0%, #c93550 100%);
            color: white;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            transition: transform 0.2s;
        }
        .back-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(233, 69, 96, 0.3);
        }
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 0.9em;
            text-align: center;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #0f3460;
            color: white;
        }
        tr:hover {
            background: #f5f5f5;
        }
        blockquote {
            border-left: 4px solid #e94560;
            padding-left: 20px;
            margin: 20px 0;
            font-style: italic;
            color: #666;
        }
        @media (max-width: 768px) {
            .container {
                padding: 20px;
            }
            h1 {
                font-size: 1.8em;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="javascript:history.back()" class="back-button">← Zurück</a>
            <a href="DOKU-INDEX-ALL.html" class="back-button" style="margin-left: 10px;">📚 Alle Dokumentationen</a>
        </div>
        $navHtml
        $body
        <div class="footer">
            <p><small>Quelle: $relativePath</small></p>
        </div>
    </div>
</body>
</html>
"@
}

# Markdown zu HTML konvertieren
function Convert-MarkdownToHTML {
    param($markdown)
    
    $html = $markdown
    
    # Headers (wichtig: in umgekehrter Reihenfolge!)
    $html = $html -replace '(?m)^####\s+(.+)$', '<h4>$1</h4>'
    $html = $html -replace '(?m)^###\s+(.+)$', '<h3>$1</h3>'
    $html = $html -replace '(?m)^##\s+(.+)$', '<h2>$1</h2>'
    $html = $html -replace '(?m)^#\s+(.+)$', '<h1>$1</h1>'
    
    # Horizontal Rules
    $html = $html -replace '(?m)^---$', '<hr>'
    $html = $html -replace '(?m)^\*\*\*$', '<hr>'
    
    # Bold & Italic
    $html = $html -replace '\*\*([^*]+)\*\*', '<strong>$1</strong>'
    $html = $html -replace '(?<!\*)\*([^*]+?)\*(?!\*)', '<em>$1</em>'
    
    # Code Blocks (vor inline code!)
    $html = $html -replace '(?s)```(\w+)?\n?([^`]+)```', '<pre><code>$2</code></pre>'
    
    # Inline Code
    $html = $html -replace '`([^`]+)`', '<code>$1</code>'
    
    # Links
    $html = $html -replace '\[([^\]]+)\]\(([^)]+)\)', '<a href="$2" target="_blank">$1</a>'
    
    # Images
    $html = $html -replace '!\[([^\]]*)\]\(([^)]+)\)', '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 5px; margin: 15px 0;">'
    
    # Blockquotes
    $html = $html -replace '(?m)^>\s+(.+)$', '<blockquote>$1</blockquote>'
    
    # Tables (basic)
    $html = $html -replace '(?m)^\|(.+)\|$', { param($m)
        $cells = $m.Groups[1].Value -split '\|' | Where-Object { $_.Trim() }
        if ($cells -and $cells[0] -match '---') {
            return '' # Skip separator row
        }
        $tag = if ($m.Groups[1].Value -match '^[:\-\s|]+$') { 'th' } else { 'td' }
        $cellHtml = $cells | ForEach-Object { "<$tag>$($_.Trim())</$tag>" }
        return "<tr>$($cellHtml -join '')</tr>"
    }
    
    # Lists
    $lines = $html -split "`n"
    $result = @()
    $inList = $false
    $listType = $null
    
    foreach ($line in $lines) {
        $trimmed = $line.Trim()
        
        # Unordered list
        if ($trimmed -match '^[\-\*\+]\s+(.+)') {
            if (-not $inList -or $listType -ne 'ul') {
                if ($inList) { $result += "</$listType>" }
                $result += '<ul>'
                $inList = $true
                $listType = 'ul'
            }
            $result += "<li>$($matches[1])</li>"
        }
        # Ordered list
        elseif ($trimmed -match '^\d+\.\s+(.+)') {
            if (-not $inList -or $listType -ne 'ol') {
                if ($inList) { $result += "</$listType>" }
                $result += '<ol>'
                $inList = $true
                $listType = 'ol'
            }
            $result += "<li>$($matches[1])</li>"
        }
        else {
            if ($inList) {
                $result += "</$listType>"
                $inList = $false
                $listType = $null
            }
            
            if ($trimmed -and $trimmed -notmatch '^<[h1-6]|^<pre|^<ul|^<ol|^<table|^<blockquote') {
                if ($trimmed -notmatch '^<') {
                    $result += "<p>$trimmed</p>"
                } else {
                    $result += $line
                }
            } elseif ($trimmed) {
                $result += $line
            }
        }
    }
    
    if ($inList) {
        $result += "</$listType>"
    }
    
    $html = $result -join "`n"
    
    # Clean up
    $html = $html -replace '</p>\s*<p>', '<br>'
    
    return $html
}

# Konvertiere alle Dateien
Write-Host "🔄 Starte Konvertierung..." -ForegroundColor Cyan
Write-Host ""

$count = 0
foreach ($mdFile in $mdFiles) {
    $count++
    $htmlPath = $mdFile.FullName -replace '\.md$', '.html'
    $relativePath = $mdFile.FullName.Replace($baseDir + '\', '').Replace('\', '/')
    
    try {
        # Prüfe ob bereits konvertiert (und neuer)
        $skip = $false
        if (Test-Path $htmlPath) {
            $mdTime = $mdFile.LastWriteTime
            $htmlTime = (Get-Item $htmlPath).LastWriteTime
            if ($htmlTime -ge $mdTime) {
                $stats.Skipped++
                $skip = $true
                Write-Host "[$count/$($stats.Total)] ⏭️  Übersprungen: $relativePath" -ForegroundColor Yellow
            }
        }
        
        if (-not $skip) {
            # Lese Markdown
            $mdContent = Get-Content -Path $mdFile.FullName -Raw -Encoding UTF8
            
            # Extrahiere Titel
            $titleMatch = [regex]::Match($mdContent, '(?m)^#\s+(.+)')
            $title = if ($titleMatch.Success) {
                $titleMatch.Groups[1].Value.Trim()
            } else {
                [System.IO.Path]::GetFileNameWithoutExtension($mdFile.Name)
            }
            $title = $title -replace '<.*?>', ''
            
            # Kategorie bestimmen
            $category = "Dokumentation"
            if ($relativePath -match 'tests|test') { $category = "Tests" }
            elseif ($relativePath -match 'handbuch|handbook|guide') { $category = "Handbücher" }
            elseif ($relativePath -match 'anleitung|anweisung|instruction') { $category = "Anleitungen" }
            elseif ($relativePath -match 'readme|index') { $category = "Übersicht" }
            
            if (-not $stats.Categories.ContainsKey($category)) {
                $stats.Categories[$category] = 0
            }
            $stats.Categories[$category]++
            
            # Konvertiere zu HTML
            $htmlBody = Convert-MarkdownToHTML $mdContent
            
            # Erstelle HTML-Datei
            $htmlContent = Get-HTMLTemplate -title $title -body $htmlBody -relativePath $relativePath
            
            # Speichere
            [System.IO.File]::WriteAllText($htmlPath, $htmlContent, [System.Text.Encoding]::UTF8)
            
            # Für Index sammeln
            $indexList += [PSCustomObject]@{
                Title = $title
                Path = $relativePath -replace '\.md$', '.html'
                Category = $category
                OriginalPath = $relativePath
            }
            
            $stats.Converted++
            Write-Host "[$count/$($stats.Total)] ✅ $relativePath" -ForegroundColor Green
        }
    }
    catch {
        $stats.Failed++
        Write-Host "[$count/$($stats.Total)] ❌ $relativePath : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Erstelle Index-Seite
Write-Host ""
Write-Host "📚 Erstelle Index-Seite..." -ForegroundColor Cyan

$indexHtml = @"
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Alle Dokumentationen - Think Orders</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            background: white;
            max-width: 1400px;
            margin: 0 auto;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h1 {
            color: #e94560;
            font-size: 3em;
            margin-bottom: 10px;
            text-align: center;
        }
        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 40px;
            font-size: 1.2em;
        }
        .stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-bottom: 40px;
            flex-wrap: wrap;
        }
        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .stat-number {
            font-size: 2.5em;
            font-weight: bold;
        }
        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
        }
        .category-section {
            margin-bottom: 50px;
        }
        .category-title {
            color: #0f3460;
            font-size: 2em;
            margin-bottom: 20px;
            border-left: 5px solid #e94560;
            padding-left: 15px;
        }
        .doc-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        .doc-card {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #e94560;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .doc-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.15);
        }
        .doc-card a {
            color: #e94560;
            text-decoration: none;
            font-weight: bold;
            font-size: 1.1em;
            display: block;
            margin-bottom: 10px;
        }
        .doc-card a:hover {
            color: #0f3460;
            text-decoration: underline;
        }
        .doc-path {
            color: #666;
            font-size: 0.85em;
            font-family: monospace;
            margin-top: 10px;
        }
        .search-box {
            width: 100%;
            padding: 15px;
            font-size: 1.1em;
            border: 2px solid #e94560;
            border-radius: 5px;
            margin-bottom: 30px;
        }
        .search-box:focus {
            outline: none;
            border-color: #0f3460;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📚 Alle Dokumentationen</h1>
        <p class="subtitle">Vollständige Sammlung aller konvertierten Dokumentationen</p>
        
        <div class="stats">
            <div class="stat-card">
                <div class="stat-number">$($stats.Total)</div>
                <div class="stat-label">Dokumentationen</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$($stats.Converted)</div>
                <div class="stat-label">Konvertiert</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">$($stats.Categories.Count)</div>
                <div class="stat-label">Kategorien</div>
            </div>
        </div>
        
        <input type="text" class="search-box" id="searchBox" placeholder="🔍 Suche in allen Dokumentationen...">
        
        <div id="content">
"@

# Gruppiere nach Kategorien
$categories = $indexList | Group-Object Category | Sort-Object Name

foreach ($category in $categories) {
    $indexHtml += @"
            <div class="category-section">
                <h2 class="category-title">$($category.Name) ($($category.Count))</h2>
                <div class="doc-grid">
"@
    
    foreach ($doc in $category.Group | Sort-Object Title) {
        $indexHtml += @"
                    <div class="doc-card">
                        <a href="$($doc.Path)">$($doc.Title)</a>
                        <div class="doc-path">$($doc.OriginalPath)</div>
                    </div>
"@
    }
    
    $indexHtml += @"
                </div>
            </div>
"@
}

$indexHtml += @"
        </div>
    </div>
    
    <script>
        const searchBox = document.getElementById('searchBox');
        const content = document.getElementById('content');
        const allCards = content.querySelectorAll('.doc-card');
        
        searchBox.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            
            allCards.forEach(card => {
                const text = card.textContent.toLowerCase();
                const categorySection = card.closest('.category-section');
                
                if (text.includes(query)) {
                    card.style.display = 'block';
                    if (categorySection) {
                        categorySection.style.display = 'block';
                    }
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Verstecke leere Kategorien
            document.querySelectorAll('.category-section').forEach(section => {
                const visibleCards = section.querySelectorAll('.doc-card[style="display: block;"], .doc-card:not([style*="display: none"])');
                if (visibleCards.length === 0 && query) {
                    section.style.display = 'none';
                } else {
                    section.style.display = 'block';
                }
            });
        });
    </script>
</body>
</html>
"@

$indexPath = Join-Path $baseDir "DOKU-INDEX-ALL.html"
[System.IO.File]::WriteAllText($indexPath, $indexHtml, [System.Text.Encoding]::UTF8)

Write-Host "✅ Index-Seite erstellt: DOKU-INDEX-ALL.html" -ForegroundColor Green

# Zusammenfassung
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📊 ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "  📄 Gesamt:       $($stats.Total)" -ForegroundColor White
Write-Host "  ✅ Konvertiert:  $($stats.Converted)" -ForegroundColor Green
Write-Host "  ⏭️  Übersprungen: $($stats.Skipped)" -ForegroundColor Yellow
Write-Host "  ❌ Fehler:       $($stats.Failed)" -ForegroundColor $(if ($stats.Failed -eq 0) { "Green" } else { "Red" })
Write-Host ""
Write-Host "  📚 Kategorien:" -ForegroundColor Cyan
foreach ($cat in $stats.Categories.GetEnumerator() | Sort-Object Key) {
    Write-Host "     • $($cat.Key): $($cat.Value)" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "  🌐 Index-Seite: DOKU-INDEX-ALL.html" -ForegroundColor Green
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✨ FERTIG! Alle Dokumentationen wurden konvertiert!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

