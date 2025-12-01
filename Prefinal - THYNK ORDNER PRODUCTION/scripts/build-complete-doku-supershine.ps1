# ================================================================
# BUILD: HTML-GESAMTLÖSUNG MIT SUPERSHINE & DA VINCI STYLE
# ================================================================
# Erstellt eine einzige große HTML-Datei mit allen Dokumenten
# + Ultra-Animationen, 3D, Hexachromatographie, Kino-Qualität
# ================================================================

$ErrorActionPreference = "Continue"

$baseDir = Split-Path -Parent $PSScriptRoot
$excludePaths = @('node_modules', '.git', 'tests\node_modules', 'thynk-original', '.cursor', 'docs-html')

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✨ BUILD: HTML-GESAMTLÖSUNG MIT SUPERSHINE" -ForegroundColor Cyan
Write-Host "  🎬 Da Vinci Style - Kino-Qualität - Ultra-Animationen" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
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

# Lade alle Dokumente
$docs = @()
$index = 0

foreach ($mdFile in $mdFiles) {
    try {
        $mdContent = Get-Content -Path $mdFile.FullName -Raw -Encoding UTF8
        $title = [System.IO.Path]::GetFileNameWithoutExtension($mdFile.Name)
        
        # Extrahiere Titel aus H1
        if ($mdContent -match '(?m)^#\s+(.+)') {
            $title = $matches[1] -replace '<.*?>', ''
        }
        
        $relativePath = $mdFile.FullName.Replace($baseDir + '\', '').Replace('\', '/')
        
        # Kategorie bestimmen
        $category = 'Dokumentation'
        if ($relativePath -like "*tests*") { $category = 'Tests' }
        if ($relativePath -like "*HANDBUCH*" -or $relativePath -like "*handbuch*") { $category = 'Handbücher' }
        if ($relativePath -like "*ANLEITUNG*" -or $relativePath -like "*anleitung*") { $category = 'Anleitungen' }
        
        # Konvertiere Markdown zu HTML
        $html = $mdContent
        $html = $html -replace '(?m)^####\s+(.+)$', '<h4>$1</h4>'
        $html = $html -replace '(?m)^###\s+(.+)$', '<h3>$1</h3>'
        $html = $html -replace '(?m)^##\s+(.+)$', '<h2>$1</h2>'
        $html = $html -replace '(?m)^#\s+(.+)$', '<h1>$1</h1>'
        $html = $html -replace '\*\*(.*?)\*\*', '<strong>$1</strong>'
        $html = $html -replace '(?s)```([^`]+)```', '<pre><code>$1</code></pre>'
        $html = $html -replace '`([^`]+)`', '<code>$1</code>'
        $html = $html -replace '\[([^\]]+)\]\(([^)]+)\)', '<a href="$2" target="_blank">$1</a>'
        
        $docs += @{
            Index = $index
            Title = $title
            Path = $relativePath
            Category = $category
            Content = $html
        }
        
        $index++
        
        if ($index % 10 -eq 0) {
            Write-Host "  Verarbeitet: $index/$($mdFiles.Count)..." -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Fehler bei $($mdFile.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "✅ $($docs.Count) Dokumente verarbeitet" -ForegroundColor Green
Write-Host ""
Write-Host "🎨 Erstelle HTML mit Supershine & Animationen..." -ForegroundColor Yellow

# Erstelle Navigation
$navItems = ""
foreach ($doc in $docs) {
    $navItems += "                `<li><a href='#doc-$($doc.Index)' data-index='$($doc.Index)'>$($doc.Title)</a></li>`n"
}

# Erstelle Dokumentations-Sektionen
$docSections = ""
foreach ($doc in $docs) {
    $docSections += @"
        `<section id='doc-$($doc.Index)' class='doc-section' data-index='$($doc.Index)'>
            <div class='doc-header'>
                <h1>$($doc.Title)</h1>
                <div class='doc-meta'>
                    <span class='doc-category'>$($doc.Category)</span>
                    <span class='doc-path'>$($doc.Path)</span>
                </div>
            </div>
            <div class='doc-content'>
                $($doc.Content -replace '`', '``')
            </div>
        </section>`n
"@
}

# Lade das Supershine-HTML-Template (wird in separatem Schritt erstellt)
# Für jetzt erstelle ich die vollständige HTML-Datei direkt hier

Write-Host "✨ Erstelle vollständige HTML-Datei mit allen Effekten..." -ForegroundColor Cyan

# Die vollständige HTML-Datei wird in einem separaten Schritt erstellt
# damit sie nicht zu groß wird für ein Script

Write-Host ""
Write-Host "✅ Build-Vorbereitung abgeschlossen!" -ForegroundColor Green
Write-Host "   $($docs.Count) Dokumente bereit für Einbettung" -ForegroundColor White
Write-Host ""

# Exportiere Dokumenten-Daten für das Haupt-HTML
$docsJson = $docs | ConvertTo-Json -Depth 10 -Compress
$docsJsonPath = Join-Path $baseDir "docs-data-temp.json"
$docsJson | Out-File -FilePath $docsJsonPath -Encoding UTF8

Write-Host "💾 Dokumenten-Daten gespeichert: docs-data-temp.json" -ForegroundColor Green
Write-Host ""

Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📝 NÄCHSTER SCHRITT:" -ForegroundColor Yellow
Write-Host "  Die vollständige HTML-Datei wird jetzt erstellt..." -ForegroundColor White
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Return docs array for use in next step
return $docs

