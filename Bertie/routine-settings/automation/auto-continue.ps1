# ============================================================================
# AUTO-CONTINUE - Setzt Entwicklung automatisch fort
# ============================================================================
# Version: 1.0.0
# Erstellt: 2025-01-27
# Zweck: Automatische Fortsetzung nach Setup
# ============================================================================

$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"

function Write-Step {
    param([string]$Message, [string]$Status = "INFO")
    $color = switch ($Status) {
        "SUCCESS" { "Green" }
        "ERROR" { "Red" }
        "WARNING" { "Yellow" }
        "INFO" { "Cyan" }
        default { "White" }
    }
    Write-Host "[$Status] $Message" -ForegroundColor $color
}

$PROJECT_DIR = Get-Location
if (-not (Test-Path "package.json")) {
    Write-Step "❌ package.json nicht gefunden. Führe zuerst auto-setup.ps1 aus!" "ERROR"
    exit 1
}

Write-Step "=" * 80 "INFO"
Write-Step "STARTE AUTOMATISCHE FORTSETZUNG" "INFO"
Write-Step "=" * 80 "INFO"
Write-Step ""

# Dependencies installieren
Write-Step "📦 Installiere Dependencies..." "INFO"
try {
    if (Test-Path "node_modules") {
        Write-Step "ℹ️  node_modules existiert bereits" "INFO"
    } else {
        npm install 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Step "✅ Dependencies installiert" "SUCCESS"
        } else {
            Write-Step "❌ Fehler beim Installieren der Dependencies" "ERROR"
            exit 1
        }
    }
} catch {
    Write-Step "❌ Fehler: $_" "ERROR"
    exit 1
}

# .env Datei erstellen falls nicht vorhanden
Write-Step "⚙️  Prüfe .env Datei..." "INFO"
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Step "✅ .env aus .env.example erstellt" "SUCCESS"
        Write-Step "⚠️  Bitte .env mit echten Werten konfigurieren!" "WARNING"
    }
} else {
    Write-Step "ℹ️  .env existiert bereits" "INFO"
}

# Datenbank-Migration vorbereiten
Write-Step "🗄️  Prüfe Datenbank-Migration..." "INFO"
if (Test-Path "migrations/001_initial_schema.sql") {
    Write-Step "✅ Datenbank-Schema gefunden" "SUCCESS"
    Write-Step "ℹ️  Führe Migration manuell aus: psql -f migrations/001_initial_schema.sql" "INFO"
} else {
    Write-Step "⚠️  Datenbank-Schema nicht gefunden" "WARNING"
}

# Development Server starten
Write-Step "🚀 Starte Development Server..." "INFO"
Write-Step "ℹ️  Server wird gestartet. Drücke Ctrl+C zum Stoppen." "INFO"
Write-Step ""

npm run dev
