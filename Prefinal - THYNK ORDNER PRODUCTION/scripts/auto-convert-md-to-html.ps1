# ================================================================
# AUTOMATISCHE MD-ZU-HTML KONVERTIERUNG
# ================================================================
# Konvertiert automatisch alle .md Dateien zu HTML
# OHNE USER-HANDLUNG - Läuft im Hintergrund
# ================================================================

$ErrorActionPreference = "Continue"

$baseDir = Split-Path -Parent $PSScriptRoot
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$logFile = Join-Path $baseDir "auto-convert-log.txt"

function Write-Log {
    param($message, $color = "White")
    $logMessage = "[$timestamp] $message"
    Write-Host $logMessage -ForegroundColor $color
    Add-Content -Path $logFile -Value $logMessage
}

Write-Log "🔄 Automatische MD-zu-HTML Konvertierung gestartet" "Cyan"

# Prüfe ob Konvertierungs-Script existiert
$convertScript = Join-Path $baseDir "KONVERTIERE-ALLE-zu-HTML-COMPLETE.ps1"

if (-not (Test-Path $convertScript)) {
    Write-Log "⚠️ Konvertierungs-Script nicht gefunden: $convertScript" "Yellow"
    Write-Log "ℹ️ Erstelle einfache Konvertierung..." "Yellow"
    
    # Einfache automatische Konvertierung
    $mdFiles = Get-ChildItem -Path $baseDir -Filter "*.md" -Recurse -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notmatch '(\\node_modules\\|\\.git\\)'
    }
    
    $converted = 0
    foreach ($mdFile in $mdFiles) {
        $htmlPath = $mdFile.FullName -replace '\.md$', '.html'
        
        # Nur konvertieren wenn HTML nicht existiert oder älter ist
        $shouldConvert = $true
        if (Test-Path $htmlPath) {
            $mdTime = $mdFile.LastWriteTime
            $htmlTime = (Get-Item $htmlPath).LastWriteTime
            if ($htmlTime -ge $mdTime) {
                $shouldConvert = $false
            }
        }
        
        if ($shouldConvert) {
            try {
                $content = Get-Content -Path $mdFile.FullName -Raw -Encoding UTF8
                
                # Einfache Konvertierung
                $html = @"
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>$(if ($content -match '(?m)^#\s+(.+)') { $matches[1] } else { $mdFile.BaseName })</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1000px; margin: 40px auto; padding: 20px; line-height: 1.6; }
        h1 { color: #e94560; border-bottom: 3px solid #e94560; padding-bottom: 10px; }
        h2 { color: #0f3460; margin-top: 30px; }
        pre { background: #f5f5f5; padding: 15px; border-left: 4px solid #e94560; overflow-x: auto; }
        code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
        a { color: #e94560; }
    </style>
</head>
<body>
    <a href="javascript:history.back()" style="display: inline-block; margin-bottom: 20px; padding: 10px 20px; background: #e94560; color: white; text-decoration: none; border-radius: 5px;">← Zurück</a>
    $($content -replace '(?m)^#\s+(.+)$', '<h1>$1</h1>' -replace '(?m)^##\s+(.+)$', '<h2>$1</h2>' -replace '\*\*(.*?)\*\*', '<strong>$1</strong>' -replace '(?s)```([^`]+)```', '<pre><code>$1</code></pre>')
</body>
</html>
"@
                
                [System.IO.File]::WriteAllText($htmlPath, $html, [System.Text.Encoding]::UTF8)
                $converted++
                Write-Log "✅ Konvertiert: $($mdFile.Name)" "Green"
            }
            catch {
                Write-Log "❌ Fehler bei $($mdFile.Name): $($_.Exception.Message)" "Red"
            }
        }
    }
    
    Write-Log "✨ Fertig: $converted Dateien konvertiert" "Green"
}
else {
    # Verwende vollständiges Konvertierungs-Script
    Write-Log "📄 Verwende vollständiges Konvertierungs-Script..." "Cyan"
    
    try {
        & powershell -ExecutionPolicy Bypass -File $convertScript -NoExit:$false
        Write-Log "✅ Vollständige Konvertierung abgeschlossen" "Green"
    }
    catch {
        Write-Log "❌ Fehler bei Konvertierung: $($_.Exception.Message)" "Red"
    }
}

Write-Log "🏁 Automatische Konvertierung beendet" "Cyan"

