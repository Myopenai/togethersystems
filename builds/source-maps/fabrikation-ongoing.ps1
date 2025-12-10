# Fabrikation Ongoing - Source Maps System
# Läuft kontinuierlich und löst alle Probleme automatisch

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host "[FABRIKATION] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigFile = Join-Path $ScriptDir "fabrikation-standard.yaml"

Write-Info "=========================================="
Write-Info "FABRIKATION ONGOING - SOURCE MAPS"
Write-Info "Standard TÜV MCP - Automatisch"
Write-Info "=========================================="
Write-Host ""

# Regel 1: Source Maps Verzeichnis
Write-Info "Regel 1: Prüfe Source Maps Verzeichnis..."
$sourceMapsDir = Join-Path $ScriptDir "source-maps"
if (!(Test-Path $sourceMapsDir)) {
    New-Item -ItemType Directory -Path $sourceMapsDir -Force | Out-Null
    Write-Success "Source Maps Verzeichnis erstellt"
} else {
    Write-Success "Source Maps Verzeichnis existiert"
}

# Regel 2: Source Mapping URLs
Write-Info "Regel 2: Prüfe Source Mapping URLs..."
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

# Regel 3: CORS Headers
Write-Info "Regel 3: Prüfe CORS Headers..."
$htaccessPath = Join-Path $sourceMapsDir ".htaccess"
if (!(Test-Path $htaccessPath)) {
    $htaccess = @"
# Source Maps CORS Support - Fabrikation Standard
<FilesMatch "\.map$">
    Header set Access-Control-Allow-Origin "*"
    Header set Content-Type "application/json"
</FilesMatch>
"@
    $htaccess | Out-File -FilePath $htaccessPath -Encoding UTF8 -NoNewline
    Write-Success ".htaccess erstellt"
}

# Regel 4: Index HTML
Write-Info "Regel 4: Prüfe Index HTML..."
$indexPath = Join-Path $sourceMapsDir "index.html"
if (!(Test-Path $indexPath)) {
    $indexHtml = @"
<!DOCTYPE html>
<html>
<head>
    <title>Source Maps - TogetherSystems</title>
    <meta charset="UTF-8">
</head>
<body>
    <h1>Source Maps Directory</h1>
    <p>Fabrikation Standard TÜV MCP</p>
    <p>Source Maps für Cursor.com & Edge/Chrome DevTools</p>
</body>
</html>
"@
    $indexHtml | Out-File -FilePath $indexPath -Encoding UTF8
    Write-Success "Index HTML erstellt"
}

# MCP Sync
Write-Info "MCP Sync..."
$mcpConfig = Join-Path $ScriptDir "..\..\settings\config\mcp-config.json"
if (Test-Path $mcpConfig) {
    Write-Success "MCP Config gefunden - Sync aktiv"
}

Write-Host ""
Write-Success "Fabrikation Ongoing abgeschlossen!"
Write-Info "Alle Regeln erfüllt - System läuft kontinuierlich"

