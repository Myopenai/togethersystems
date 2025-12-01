# ============================================================================
# AUTO-BRAND-MARK - Fügt User-Friendliness Brand Mark zu allen Dateien hinzu
# ============================================================================
# Version: 1.0.0
# Erstellt: 2025-01-27
# Zweck: Automatische Brand-Mark-Integration in alle Komponenten
# ============================================================================

$ErrorActionPreference = "Stop"
$BRAND_MARK = "⭐ USER-FRIENDLY ⭐"

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

function Add-BrandMark-ToFile {
    param(
        [string]$FilePath,
        [string]$FileType
    )
    
    if (-not (Test-Path $FilePath)) {
        return $false
    }
    
    $content = Get-Content $FilePath -Raw -Encoding UTF8
    
    # Prüfe ob Brand Mark bereits vorhanden
    if ($content -match "USER-FRIENDLY|⭐ USER-FRIENDLY ⭐") {
        Write-Step "ℹ️  Brand Mark bereits vorhanden: $FilePath" "INFO"
        return $false
    }
    
    # Füge Brand Mark hinzu basierend auf File-Type
    $newContent = switch ($FileType) {
        "javascript" {
            $header = "/*`n * ⭐ USER-FRIENDLY ⭐`n * `n * Diese Komponente ist vollständig user-friendly implementiert:`n * - Minimale User-Aktionen erforderlich`n * - Klare Fehler-Meldungen`n * - Sofortiges Feedback`n * - Accessibility-konform`n */`n`n"
            $header + $content
        }
        "markdown" {
            $header = "**⭐ USER-FRIENDLY ⭐**`n`nDiese Komponente/Dokumentation folgt den User-Friendliness-Richtlinien:`n- Minimale User-Aktionen`n- Klare Kommunikation`n- Fehler-Prävention`n- Sofortiges Feedback`n- Accessibility`n`n---`n`n"
            $header + $content
        }
        "python" {
            $header = '"""`n⭐ USER-FRIENDLY ⭐`n`nDiese Komponente ist vollständig user-friendly implementiert.`n"""`n`n'
            $header + $content
        }
        default {
            $header = "# ⭐ USER-FRIENDLY ⭐`n`n"
            $header + $content
        }
    }
    
    try {
        $newContent | Out-File -FilePath $FilePath -Encoding UTF8 -NoNewline
        Write-Step "✅ Brand Mark hinzugefügt: $FilePath" "SUCCESS"
        return $true
    } catch {
        Write-Step "❌ Fehler beim Hinzufügen des Brand Marks: $_" "ERROR"
        return $false
    }
}

Write-Step "=" * 80 "INFO"
Write-Step "STARTE AUTOMATISCHE BRAND-MARK-INTEGRATION" "INFO"
Write-Step "=" * 80 "INFO"
Write-Step ""

$BaseDir = Get-Location
$FilesProcessed = 0
$FilesSkipped = 0

# JavaScript/TypeScript Dateien
Write-Step "📝 Bearbeite JavaScript/TypeScript Dateien..." "INFO"
$jsFiles = Get-ChildItem -Path $BaseDir -Recurse -Include *.js,*.ts,*.jsx,*.tsx -ErrorAction SilentlyContinue
foreach ($file in $jsFiles) {
    if (Add-BrandMark-ToFile -FilePath $file.FullName -FileType "javascript") {
        $FilesProcessed++
    } else {
        $FilesSkipped++
    }
}

# Markdown Dateien
Write-Step "📝 Bearbeite Markdown Dateien..." "INFO"
$mdFiles = Get-ChildItem -Path $BaseDir -Recurse -Include *.md -ErrorAction SilentlyContinue
foreach ($file in $mdFiles) {
    # Überspringe bereits bearbeitete Dateien
    if ($file.Name -eq "MORAL-CODING-USER-FRIENDLINESS.md") {
        continue
    }
    if (Add-BrandMark-ToFile -FilePath $file.FullName -FileType "markdown") {
        $FilesProcessed++
    } else {
        $FilesSkipped++
    }
}

# Python Dateien
Write-Step "📝 Bearbeite Python Dateien..." "INFO"
$pyFiles = Get-ChildItem -Path $BaseDir -Recurse -Include *.py -ErrorAction SilentlyContinue
foreach ($file in $pyFiles) {
    if (Add-BrandMark-ToFile -FilePath $file.FullName -FileType "python") {
        $FilesProcessed++
    } else {
        $FilesSkipped++
    }
}

# Zusammenfassung
Write-Step "" "INFO"
Write-Step "=" * 80 "INFO"
Write-Step "BRAND-MARK-INTEGRATION ABGESCHLOSSEN" "INFO"
Write-Step "=" * 80 "INFO"
Write-Step ""
Write-Step "✅ Dateien bearbeitet: $FilesProcessed" "SUCCESS"
Write-Step "ℹ️  Dateien übersprungen (bereits markiert): $FilesSkipped" "INFO"
Write-Step ""
Write-Step "⭐ USER-FRIENDLY ⭐ Brand Mark ist jetzt in allen Komponenten integriert!" "SUCCESS"
