# ============================================================================
# MAKE FACTORY
# TOGETHERSYSTEMS. INTERNATIONAL TTT
# T,. Make Factory - Initialisiert und fuehrt Factory aus
# ============================================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "T,. MAKE FACTORY" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
Set-Location $rootDir

# ============================================================================
# PHASE 1: CHECK PREREQUISITES
# ============================================================================

Write-Host "T,. Phase 1: Prerequisites pruefen..." -ForegroundColor Yellow

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "T,. Node.js gefunden: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "T,. FEHLER: Node.js nicht gefunden!" -ForegroundColor Red
    exit 1
}

# Check npm
try {
    $npmVersion = npm --version
    Write-Host "T,. npm gefunden: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "T,. FEHLER: npm nicht gefunden!" -ForegroundColor Red
    exit 1
}

# Check TypeScript
try {
    $tsVersion = npx tsc --version
    Write-Host "T,. TypeScript gefunden: $tsVersion" -ForegroundColor Green
} catch {
    Write-Host "T,. TypeScript wird installiert..." -ForegroundColor Yellow
    npm install -g typescript
}

# Check factory.manifest.yaml
if (-not (Test-Path "factory.manifest.yaml")) {
    Write-Host "T,. FEHLER: factory.manifest.yaml nicht gefunden!" -ForegroundColor Red
    exit 1
}
Write-Host "T,. factory.manifest.yaml gefunden" -ForegroundColor Green

Write-Host ""

# ============================================================================
# PHASE 2: INSTALL DEPENDENCIES
# ============================================================================

Write-Host "T,. Phase 2: Dependencies installieren..." -ForegroundColor Yellow

# Check package.json
if (Test-Path "package.json") {
    Write-Host "T,. package.json gefunden, installiere Dependencies..." -ForegroundColor Cyan
    npm install
    Write-Host "T,. Dependencies installiert" -ForegroundColor Green
} else {
    Write-Host "T,. package.json nicht gefunden, erstelle..." -ForegroundColor Yellow
    
    $packageJson = @{
        name = "together-systems-factory"
        version = "2.0.0-INFINITE"
        description = "TogetherSystems Factory - Industrial Supermax IBM"
        main = "Fabrikage.AutoExecution/bootstrap/a-start.ts"
        scripts = @{
            build = "tsc"
            start = "ts-node Fabrikage.AutoExecution/bootstrap/a-start.ts"
            factory = "ts-node Fabrikage.AutoExecution/bootstrap/a-start.ts"
        }
        dependencies = @{
            "js-yaml" = "^4.1.0"
        }
        devDependencies = @{
            "@types/node" = "^20.0.0"
            "typescript" = "^5.0.0"
            "ts-node" = "^10.9.0"
        }
    } | ConvertTo-Json -Depth 10
    
    $packageJson | Out-File -FilePath "package.json" -Encoding UTF8
    npm install
    Write-Host "T,. package.json erstellt und Dependencies installiert" -ForegroundColor Green
}

Write-Host ""

# ============================================================================
# PHASE 3: COMPILE TYPESCRIPT
# ============================================================================

Write-Host "T,. Phase 3: TypeScript kompilieren..." -ForegroundColor Yellow

# Check tsconfig.json
if (-not (Test-Path "tsconfig.json")) {
    Write-Host "T,. tsconfig.json nicht gefunden, erstelle..." -ForegroundColor Yellow
    
    $tsconfig = @{
        compilerOptions = @{
            target = "ES2020"
            module = "commonjs"
            lib = @("ES2020")
            outDir = "./dist"
            rootDir = "./"
            strict = $true
            esModuleInterop = $true
            skipLibCheck = $true
            forceConsistentCasingInFileNames = $true
            resolveJsonModule = $true
            moduleResolution = "node"
        }
        include = @("**/*.ts")
        exclude = @("node_modules", "dist")
    } | ConvertTo-Json -Depth 10
    
    $tsconfig | Out-File -FilePath "tsconfig.json" -Encoding UTF8
    Write-Host "T,. tsconfig.json erstellt" -ForegroundColor Green
}

# Compile TypeScript
Write-Host "T,. Kompiliere TypeScript..." -ForegroundColor Cyan
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) {
    Write-Host "T,. WARNUNG: TypeScript-Kompilierung hat Fehler, aber fahre fort..." -ForegroundColor Yellow
}

Write-Host ""

# ============================================================================
# PHASE 4: RUN A-START BOOTSTRAPPER
# ============================================================================

Write-Host "T,. Phase 4: A-Start Bootstrapper ausfuehren..." -ForegroundColor Yellow
Write-Host ""

# Run A-Start
try {
    npx ts-node Fabrikage.AutoExecution/bootstrap/a-start.ts
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -eq 0) {
        Write-Host ""
        Write-Host "=====================================" -ForegroundColor Green
        Write-Host "T,. FACTORY ERFOLGREICH AUSGEFUEHRT!" -ForegroundColor Green
        Write-Host "=====================================" -ForegroundColor Green
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "=====================================" -ForegroundColor Red
        Write-Host "T,. FACTORY MIT FEHLERN ABGESCHLOSSEN" -ForegroundColor Red
        Write-Host "=====================================" -ForegroundColor Red
        Write-Host ""
        exit $exitCode
    }
} catch {
    Write-Host ""
    Write-Host "T,. FEHLER beim Ausfuehren des A-Start Bootstrappers:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    exit 1
}

# ============================================================================
# PHASE 5: VERIFY RESULTS
# ============================================================================

Write-Host "T,. Phase 5: Ergebnisse verifizieren..." -ForegroundColor Yellow

# Check if artifacts were created
$artifactsCreated = $false

if (Test-Path "dist") {
    Write-Host "T,. dist-Verzeichnis gefunden" -ForegroundColor Green
    $artifactsCreated = $true
}

if (Test-Path "Fabrikage.ProvenanceLedger/registry/artifact-registry.json") {
    Write-Host "T,. Artifact-Registry gefunden" -ForegroundColor Green
    $artifactsCreated = $true
}

if ($artifactsCreated) {
    Write-Host "T,. Artefakte wurden erstellt" -ForegroundColor Green
} else {
    Write-Host "T,. WARNUNG: Keine Artefakte gefunden" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "T,. MAKE FACTORY ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host 'T,.&T,,.&T,,,.T.' -ForegroundColor Cyan
Write-Host ""

