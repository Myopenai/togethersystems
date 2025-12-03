# ================================================================
# AUTOMATISCHE ÜBERWACHUNG: NEUE .md DATEIEN → HTML
# ================================================================
# Überwacht alle .md Dateien und konvertiert neue automatisch
# Läuft kontinuierlich im Hintergrund
# ================================================================

$ErrorActionPreference = "Continue"

$baseDir = Split-Path -Parent $PSScriptRoot
$logFile = Join-Path $baseDir "md-to-html-watch-log.txt"
$stateFile = Join-Path $baseDir ".md-to-html-watch-state.json"

function Write-Log {
    param($message, $color = "White")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $message"
    Write-Host $logMessage -ForegroundColor $color
    Add-Content -Path $logFile -Value $logMessage
}

function Get-FileHash {
    param($filePath)
    if (Test-Path $filePath) {
        $file = Get-Item $filePath
        return "$($file.LastWriteTime.Ticks)-$($file.Length)"
    }
    return $null
}

function Load-State {
    if (Test-Path $stateFile) {
        try {
            $content = Get-Content -Path $stateFile -Raw | ConvertFrom-Json
            return @{}
        }
        catch {
            return @{}
        }
    }
    return @{}
}

function Save-State {
    param($state)
    try {
        $state | ConvertTo-Json | Set-Content -Path $stateFile
    }
    catch {
        Write-Log "Fehler beim Speichern des States: $($_.Exception.Message)" "Red"
    }
}

function Convert-MarkdownToHTML {
    param($mdPath)
    
    try {
        $content = Get-Content -Path $mdPath -Raw -Encoding UTF8
        $title = if ($content -match '(?m)^#\s+(.+)') { $matches[1] } else { [System.IO.Path]::GetFileNameWithoutExtension($mdPath) }
        $title = $title -replace '<.*?>', ''
        
        # Einfache Konvertierung
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
        
        $htmlPath = $mdPath -replace '\.md$', '.html'
        [System.IO.File]::WriteAllText($htmlPath, $html, [System.Text.Encoding]::UTF8)
        return $true
    }
    catch {
        Write-Log "Fehler bei Konvertierung: $($_.Exception.Message)" "Red"
        return $false
    }
}

Write-Log "🔍 Starte Überwachung von .md Dateien..." "Cyan"

$state = Load-State
$changed = 0
$converted = 0

# Finde alle .md Dateien
$mdFiles = Get-ChildItem -Path $baseDir -Filter "*.md" -Recurse -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch '(\\node_modules\\|\\.git\\)'
}

foreach ($mdFile in $mdFiles) {
    $relativePath = $mdFile.FullName.Replace($baseDir + '\', '').Replace('\', '/')
    $currentHash = Get-FileHash $mdFile.FullName
    $htmlPath = $mdFile.FullName -replace '\.md$', '.html'
    
    # Prüfe ob geändert oder neu
    $shouldConvert = $false
    
    if (-not (Test-Path $htmlPath)) {
        # HTML existiert nicht - konvertiere
        $shouldConvert = $true
        Write-Log "📄 Neue Datei gefunden: $relativePath" "Yellow"
    }
    elseif ($state[$relativePath] -ne $currentHash) {
        # Datei wurde geändert - konvertiere erneut
        $shouldConvert = $true
        Write-Log "📝 Datei geändert: $relativePath" "Yellow"
    }
    
    if ($shouldConvert) {
        if (Convert-MarkdownToHTML -mdPath $mdFile.FullName) {
            $state[$relativePath] = $currentHash
            $converted++
            Write-Log "✅ Konvertiert: $relativePath" "Green"
        }
        $changed++
    }
    else {
        # State aktualisieren falls nicht vorhanden
        if (-not $state[$relativePath]) {
            $state[$relativePath] = $currentHash
        }
    }
}

Save-State $state

Write-Log "✨ Überwachung abgeschlossen: $converted Dateien konvertiert, $changed geändert" "Green"

