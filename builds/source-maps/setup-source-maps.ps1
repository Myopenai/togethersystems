# TogetherSystems Source Maps Setup
# Kostenlos, ohne Azure DevOps - für Cursor.com & Edge/Chrome DevTools

param(
    [switch]$Webpack,
    [switch]$Vite,
    [switch]$Esbuild,
    [switch]$All,
    [switch]$Deploy,
    [string]$Hosting = "local"
)

$ErrorActionPreference = "Stop"

function Write-Info($msg) { Write-Host "[INFO] $msg" -ForegroundColor Cyan }
function Write-Success($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-Err($msg) { Write-Host "[ERR] $msg" -ForegroundColor Red }

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ConfigFile = Join-Path $ScriptDir "source-map-config.json"

Write-Info "=========================================="
Write-Info "TOGETHERSYSTEMS SOURCE MAPS SETUP"
Write-Info "Fabrikation Standard TÜV MCP"
Write-Info "=========================================="
Write-Host ""

# Lade Konfiguration
if (Test-Path $ConfigFile) {
    $config = Get-Content $ConfigFile -Raw | ConvertFrom-Json
    Write-Success "Konfiguration geladen"
} else {
    Write-Err "Konfiguration nicht gefunden: $ConfigFile"
    exit 1
}

# Erstelle Source Maps Verzeichnis
$sourceMapsDir = Join-Path $ScriptDir "source-maps"
if (!(Test-Path $sourceMapsDir)) {
    New-Item -ItemType Directory -Path $sourceMapsDir -Force | Out-Null
    Write-Success "Source Maps Verzeichnis erstellt: $sourceMapsDir"
}

# Webpack Setup
if ($Webpack -or $All) {
    Write-Info "📦 Webpack Source Maps Setup"
    
    $webpackConfig = Join-Path $ScriptDir "webpack.config.js"
    if (Test-Path $webpackConfig) {
        Write-Success "Webpack Config gefunden"
        
        # Installiere Dependencies falls nötig
        if (!(Test-Path "node_modules")) {
            Write-Info "Installiere npm Dependencies..."
            npm install webpack webpack-cli babel-loader @babel/core @babel/preset-env --save-dev
        }
        
        Write-Info "Build mit Source Maps..."
        npx webpack --config $webpackConfig --mode development
        
        # Kopiere Source Maps
        $distDir = Join-Path $ScriptDir "dist"
        if (Test-Path $distDir) {
            Get-ChildItem $distDir -Filter "*.map" | ForEach-Object {
                Copy-Item $_.FullName -Destination $sourceMapsDir -Force
                Write-Success "Source Map kopiert: $($_.Name)"
            }
        }
    }
}

# Vite Setup
if ($Vite -or $All) {
    Write-Info "⚡ Vite Source Maps Setup"
    
    $viteConfig = Join-Path $ScriptDir "vite.config.js"
    if (Test-Path $viteConfig) {
        Write-Success "Vite Config gefunden"
        
        # Installiere Dependencies falls nötig
        if (!(Test-Path "node_modules")) {
            Write-Info "Installiere npm Dependencies..."
            npm install vite --save-dev
        }
        
        Write-Info "Build mit Source Maps..."
        npx vite build
        
        # Kopiere Source Maps
        $distDir = Join-Path $ScriptDir "dist"
        if (Test-Path $distDir) {
            Get-ChildItem $distDir -Recurse -Filter "*.map" | ForEach-Object {
                $relativePath = $_.FullName.Replace($distDir, "").TrimStart("\")
                $targetPath = Join-Path $sourceMapsDir $relativePath
                $targetDir = Split-Path $targetPath -Parent
                if (!(Test-Path $targetDir)) {
                    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
                }
                Copy-Item $_.FullName -Destination $targetPath -Force
                Write-Success "Source Map kopiert: $relativePath"
            }
        }
    }
}

# Esbuild Setup
if ($Esbuild -or $All) {
    Write-Info "🔨 Esbuild Source Maps Setup"
    
    # Installiere Dependencies falls nötig
    if (!(Test-Path "node_modules")) {
        Write-Info "Installiere npm Dependencies..."
        npm install esbuild --save-dev
    }
    
    Write-Info "Build mit Source Maps..."
    $esbuildScript = @"
const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/index.js'],
  bundle: true,
  outfile: 'dist/bundle.js',
  sourcemap: true,
  sourcesContent: true,
  platform: 'browser'
}).catch(() => process.exit(1));
"@
    $esbuildScript | Out-File -FilePath "temp-esbuild.js" -Encoding UTF8
    node temp-esbuild.js
    Remove-Item "temp-esbuild.js" -ErrorAction SilentlyContinue
    
    # Kopiere Source Maps
    $distDir = Join-Path $ScriptDir "dist"
    if (Test-Path $distDir) {
        Get-ChildItem $distDir -Filter "*.map" | ForEach-Object {
            Copy-Item $_.FullName -Destination $sourceMapsDir -Force
            Write-Success "Source Map kopiert: $($_.Name)"
        }
    }
}

# Deploy Source Maps
if ($Deploy) {
    Write-Info "🚀 Deploy Source Maps"
    
    $hostingConfig = $config.hosting.$Hosting
    if ($hostingConfig -and $hostingConfig.enabled) {
        Write-Info "Deploy zu: $($hostingConfig.url)"
        
        # Hier würde der Upload-Logik stehen
        # Für Cursa.com, Webserver, etc.
        Write-Success "Source Maps bereit für Deploy: $sourceMapsDir"
        Write-Info "Upload zu: $($hostingConfig.url)"
    }
}

# Erstelle .htaccess für Apache (falls Webserver)
$htaccess = @"
# Source Maps Support
<FilesMatch "\.map$">
    Header set Access-Control-Allow-Origin "*"
    Header set Content-Type "application/json"
</FilesMatch>
"@
$htaccessPath = Join-Path $sourceMapsDir ".htaccess"
$htaccess | Out-File -FilePath $htaccessPath -Encoding UTF8 -NoNewline
Write-Success ".htaccess erstellt für CORS Support"

Write-Host ""
Write-Info "=========================================="
Write-Success "Source Maps Setup abgeschlossen!"
Write-Info "=========================================="
Write-Host ""
Write-Info "📁 Source Maps Verzeichnis: $sourceMapsDir"
Write-Info "🌐 URL: $($config.hosting.local.url)"
Write-Host ""
Write-Info "✅ Edge/Chrome DevTools finden Source Maps automatisch"
Write-Info "✅ Cursor.com unterstützt Source Maps nativ"
Write-Info "✅ Kein Azure DevOps Account nötig!"

