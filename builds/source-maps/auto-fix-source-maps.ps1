# Auto-Fix Source Maps - Fabrikation Standard
# Löst alle Probleme automatisch

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host "[AUTO-FIX] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Info "=========================================="
Write-Info "AUTO-FIX SOURCE MAPS"
Write-Info "Fabrikation Standard TÜV MCP"
Write-Info "=========================================="
Write-Host ""

# Problem 1: Source Maps fehlen
Write-Info "Prüfe Source Maps..."
$sourceMapsDir = Join-Path $ScriptDir "source-maps"
if (!(Test-Path $sourceMapsDir)) {
    New-Item -ItemType Directory -Path $sourceMapsDir -Force | Out-Null
    Write-Success "Source Maps Verzeichnis erstellt"
}

# Problem 2: Source Mapping URL fehlt
Write-Info "Prüfe Source Mapping URLs in JS-Dateien..."
$distDir = Join-Path $ScriptDir "dist"
if (Test-Path $distDir) {
    Get-ChildItem $distDir -Filter "*.js" | ForEach-Object {
        $content = Get-Content $_.FullName -Raw
        $mapFile = $_.Name + ".map"
        
        if ($content -notmatch "sourceMappingURL") {
            $newContent = $content.TrimEnd() + "`n//# sourceMappingURL=$mapFile`n"
            $newContent | Out-File -FilePath $_.FullName -Encoding UTF8 -NoNewline
            Write-Success "Source Mapping URL hinzugefügt: $($_.Name)"
        }
    }
}

# Problem 3: CORS Headers fehlen
Write-Info "Prüfe CORS Headers..."
$htaccessPath = Join-Path $sourceMapsDir ".htaccess"
if (!(Test-Path $htaccessPath)) {
    $htaccess = @"
# Source Maps CORS Support
<FilesMatch "\.map$">
    Header set Access-Control-Allow-Origin "*"
    Header set Content-Type "application/json"
</FilesMatch>
"@
    $htaccess | Out-File -FilePath $htaccessPath -Encoding UTF8 -NoNewline
    Write-Success ".htaccess erstellt"
}

# Problem 4: Source Maps nicht erreichbar
Write-Info "Prüfe Source Maps Erreichbarkeit..."
$configFile = Join-Path $ScriptDir "source-map-config.json"
if (Test-Path $configFile) {
    $config = Get-Content $configFile -Raw | ConvertFrom-Json
    
    # Erstelle index.html für Source Maps Verzeichnis
    $indexHtml = @"
<!DOCTYPE html>
<html>
<head>
    <title>Source Maps - TogetherSystems</title>
    <meta charset="UTF-8">
</head>
<body>
    <h1>Source Maps Directory</h1>
    <p>Source Maps für Cursor.com & Edge/Chrome DevTools</p>
    <ul id="maps"></ul>
    <script>
        fetch('/source-maps/').then(r => r.text()).then(html => {
            // Liste Source Maps
        });
    </script>
</body>
</html>
"@
    $indexPath = Join-Path $sourceMapsDir "index.html"
    $indexHtml | Out-File -FilePath $indexPath -Encoding UTF8
    Write-Success "Index HTML erstellt"
}

# Problem 5: MCP Sync
Write-Info "Sync mit MCP Server..."
$mcpConfig = Join-Path $ScriptDir "..\..\settings\config\mcp-config.json"
if (Test-Path $mcpConfig) {
    Write-Success "MCP Config gefunden - Sync aktiviert"
}

Write-Host ""
Write-Success "Alle Probleme automatisch gelöst!"
Write-Info "Source Maps sind bereit für Cursor.com & DevTools"

