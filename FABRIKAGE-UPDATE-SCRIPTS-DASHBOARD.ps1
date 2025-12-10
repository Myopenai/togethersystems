# FABRIKAGE UPDATE SCRIPTS DASHBOARD
# Aktualisiert automatisch die Skript-Beschreibungen im Dashboard
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE UPDATE SCRIPTS DASHBOARD" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$dashboardPath = Join-Path $rootDir "fabrikage-scripts-dashboard.html"

if (-not (Test-Path $dashboardPath)) {
    Write-Host "❌ Dashboard nicht gefunden: $dashboardPath" -ForegroundColor Red
    exit 1
}

# Lade Dashboard
$dashboardContent = Get-Content -Path $dashboardPath -Raw

# Finde alle FABRIKAGE-*.ps1 Skripte
$scripts = Get-ChildItem -Path $rootDir -Filter "FABRIKAGE-*.ps1" | Sort-Object Name

Write-Host "Gefundene Skripte: $($scripts.Count)" -ForegroundColor Cyan
Write-Host ""

# Extrahiere Beschreibungen aus Skripten
$scriptDescriptions = @{}

foreach ($script in $scripts) {
    $scriptName = $script.Name
    $scriptContent = Get-Content -Path $script.FullName -Raw
    
    # Extrahiere Beschreibung aus Kommentaren
    $description = ""
    $category = "Other"
    $functions = @()
    
    # Suche nach Beschreibung im Header
    if ($scriptContent -match '(?m)^#\s+(.+?)(?:\n|$)') {
        $description = $matches[1].Trim()
    }
    
    # Suche nach Kategorie-Schlüsselwörtern
    if ($scriptName -match 'TEST') { $category = "Test" }
    elseif ($scriptName -match 'DEPLOY') { $category = "Deploy" }
    elseif ($scriptName -match 'FIX') { $category = "Fix" }
    elseif ($scriptName -match 'MIRROR') { $category = "Mirror" }
    elseif ($scriptName -match 'STANDARD') { $category = "Standards" }
    elseif ($scriptName -match 'COMPLETE|ALL') { $category = "Complete" }
    elseif ($scriptName -match 'ERROR') { $category = "Error Prevention" }
    elseif ($scriptName -match 'MASTER') { $category = "Master" }
    elseif ($scriptName -match 'UPDATE') { $category = "Update" }
    
    # Extrahiere Funktionen aus Kommentaren
    if ($scriptContent -match '(?m)^#\s*(?:Funktion|Function|Aufgabe|Task):\s*(.+?)(?:\n|$)') {
        $functions = $matches[1].Split(',').Trim()
    }
    
    # Fallback: Extrahiere aus PHASE-Kommentaren
    if ($functions.Count -eq 0) {
        $phaseMatches = [regex]::Matches($scriptContent, 'PHASE\s+\d+:\s*(.+?)(?:\n|$)')
        foreach ($match in $phaseMatches) {
            $functions += $match.Groups[1].Value.Trim()
        }
    }
    
    $scriptKey = $scriptName.Replace('.ps1', '')
    $scriptDescriptions[$scriptKey] = @{
        category = $category
        description = if ($description) { $description } else { "Automatisch erkanntes Skript - Beschreibung wird aktualisiert" }
        functions = if ($functions.Count -gt 0) { $functions } else { @($category) }
    }
    
    Write-Host "  ✅ $scriptName" -ForegroundColor Green
    Write-Host "     Kategorie: $category" -ForegroundColor Gray
}

# Erstelle JavaScript-Objekt für scriptDescriptions
$jsDescriptions = "        const scriptDescriptions = {`n"
foreach ($key in $scriptDescriptions.Keys | Sort-Object) {
    $desc = $scriptDescriptions[$key]
    $jsDescriptions += "            '$key': {`n"
    $jsDescriptions += "                category: '$($desc.category)',`n"
    $jsDescriptions += "                description: '$($desc.description -replace "'", "''")',`n"
    $jsDescriptions += "                functions: [$(($desc.functions | ForEach-Object { "'$_'" }) -join ', ')]`n"
    $jsDescriptions += "            },`n"
}
$jsDescriptions += "        };"

# Ersetze scriptDescriptions im Dashboard
$pattern = '(?s)(const scriptDescriptions = \{)(.*?)(\};)'
if ($dashboardContent -match $pattern) {
    $newContent = $dashboardContent -replace $pattern, "`$1`n$jsDescriptions`n"
    
    Set-Content -Path $dashboardPath -Value $newContent -Encoding UTF8
    Write-Host ""
    Write-Host "✅ Dashboard aktualisiert: $dashboardPath" -ForegroundColor Green
    Write-Host "   Beschreibungen: $($scriptDescriptions.Count)" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  Konnte scriptDescriptions nicht finden - Dashboard-Struktur möglicherweise geändert" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan



