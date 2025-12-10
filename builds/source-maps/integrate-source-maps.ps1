# Integriere Source Maps in bestehende Projekte
# Automatisch für alle Build-Tools

param(
    [Parameter(Mandatory = $true)]
    [string]$ProjectPath,
    
    [ValidateSet("webpack", "vite", "esbuild", "rollup", "all")]
    [string]$BuildTool = "all"
)

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host "[INTEGRATE] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Err($msg) { Write-Host "[ERR] $msg" -ForegroundColor Red }

Write-Info "=========================================="
Write-Info "INTEGRIERE SOURCE MAPS"
Write-Info "Fabrikation Standard TÜV MCP"
Write-Info "=========================================="
Write-Host ""

if (!(Test-Path $ProjectPath)) {
    Write-Err "Projekt-Pfad nicht gefunden: $ProjectPath"
    exit 1
}

$projectDir = Resolve-Path $ProjectPath
Write-Info "Projekt: $projectDir"

# Webpack Integration
if ($BuildTool -eq "webpack" -or $BuildTool -eq "all") {
    $webpackConfig = Join-Path $projectDir "webpack.config.js"
    if (Test-Path $webpackConfig) {
        Write-Info "Webpack Config gefunden - aktualisiere..."
        
        $content = Get-Content $webpackConfig -Raw
        
        # Füge Source Maps hinzu falls nicht vorhanden
        if ($content -notmatch "devtool.*source-map") {
            $content = $content -replace "module\.exports\s*=\s*\{", "module.exports = {`n  devtool: 'source-map',"
            $content | Out-File -FilePath $webpackConfig -Encoding UTF8 -NoNewline
            Write-Success "Webpack Source Maps aktiviert"
        }
    }
}

# Vite Integration
if ($BuildTool -eq "vite" -or $BuildTool -eq "all") {
    $viteConfig = Join-Path $projectDir "vite.config.js"
    if (Test-Path $viteConfig) {
        Write-Info "Vite Config gefunden - aktualisiere..."
        
        $content = Get-Content $viteConfig -Raw
        
        # Füge Source Maps hinzu falls nicht vorhanden
        if ($content -notmatch "sourcemap.*true") {
            $content = $content -replace "build:\s*\{", "build: {`n    sourcemap: true,"
            $content | Out-File -FilePath $viteConfig -Encoding UTF8 -NoNewline
            Write-Success "Vite Source Maps aktiviert"
        }
    }
}

# Package.json Scripts hinzufügen
$packageJson = Join-Path $projectDir "package.json"
if (Test-Path $packageJson) {
    Write-Info "Package.json gefunden - füge Scripts hinzu..."
    
    $package = Get-Content $packageJson -Raw | ConvertFrom-Json
    
    if (!$package.scripts) {
        $package | Add-Member -MemberType NoteProperty -Name "scripts" -Value @{}
    }
    
    if (!$package.scripts."build:sourcemaps") {
        $package.scripts | Add-Member -MemberType NoteProperty -Name "build:sourcemaps" -Value "webpack --mode production --devtool source-map"
    }
    
    $package | ConvertTo-Json -Depth 10 | Out-File -FilePath $packageJson -Encoding UTF8
    Write-Success "Package.json Scripts hinzugefügt"
}

# Erstelle Source Maps Verzeichnis im Projekt
$projectSourceMaps = Join-Path $projectDir "source-maps"
if (!(Test-Path $projectSourceMaps)) {
    New-Item -ItemType Directory -Path $projectSourceMaps -Force | Out-Null
    Write-Success "Source Maps Verzeichnis erstellt"
}

# Kopiere .htaccess
$htaccess = @"
# Source Maps CORS Support
<FilesMatch "\.map$">
    Header set Access-Control-Allow-Origin "*"
    Header set Content-Type "application/json"
</FilesMatch>
"@
$htaccessPath = Join-Path $projectSourceMaps ".htaccess"
$htaccess | Out-File -FilePath $htaccessPath -Encoding UTF8 -NoNewline
Write-Success ".htaccess erstellt"

Write-Host ""
Write-Success "Source Maps Integration abgeschlossen!"
Write-Info "Projekt: $projectDir"
Write-Info "Source Maps: $projectSourceMaps"

