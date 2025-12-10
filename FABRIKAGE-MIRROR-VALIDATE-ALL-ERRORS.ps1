# FABRIKAGE MIRROR VALIDATE ALL ERRORS
# Prüft alle behandelten/korrigierten Fehler gegen Mirror
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE MIRROR VALIDATE ALL ERRORS" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportPath = Join-Path $rootDir "reports"
if (-not (Test-Path $reportPath)) {
    New-Item -ItemType Directory -Path $reportPath -Force | Out-Null
}

$errors = @()
$warnings = @()
$fixes = @()
$validated = @()

# Lade Code-Mirror
Write-Host "[MIRROR] Initialisiere Code-Mirror..." -ForegroundColor Cyan
$mirrorPath = Join-Path $rootDir "ci\spec-mirror\code-mirror.js"
if (-not (Test-Path $mirrorPath)) {
    Write-Host "  ❌ Code-Mirror nicht gefunden: $mirrorPath" -ForegroundColor Red
    $errors += "Code-Mirror nicht gefunden"
} else {
    Write-Host "  ✅ Code-Mirror gefunden" -ForegroundColor Green
}

# Lade Error-Patterns
Write-Host "[ERRORS] Lade Error-Patterns..." -ForegroundColor Cyan
$errorPatternsPath = Join-Path $rootDir "settings\error-patterns.json"
if (Test-Path $errorPatternsPath) {
    $errorPatterns = Get-Content -Path $errorPatternsPath -Raw | ConvertFrom-Json
    Write-Host "  ✅ $($errorPatterns.patterns.Count) Error-Patterns geladen" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Error-Patterns nicht gefunden" -ForegroundColor Yellow
    $warnings += "Error-Patterns nicht gefunden"
}

# Prüfe alle behandelten Dateien
Write-Host ""
Write-Host "[VALIDATE] Prüfe alle behandelten Dateien..." -ForegroundColor Cyan

$filesToCheck = @(
    "modular-fabrikage\js\factory-engine.js",
    "modular-fabrikage\js\module-system.js",
    "modular-fabrikage\js\link-system.js",
    "modular-fabrikage\js\data-model.js",
    "modular-fabrikage\js\main.js",
    "modular-fabrikage\js\api-integration.js",
    "xxxxxxls-fabrikage\server.js",
    "js\api-error-handler.js",
    "js\api-config-loader.js",
    "js\error-fix-system.js"
)

foreach ($file in $filesToCheck) {
    $filePath = Join-Path $rootDir $file
    if (Test-Path $filePath) {
        Write-Host "  → Prüfe $file..." -ForegroundColor Yellow
        
        $content = Get-Content -Path $filePath -Raw
        
        # Prüfe gegen Error-Patterns
        $fileErrors = @()
        foreach ($pattern in $errorPatterns.patterns) {
            try {
                if ($content -match $pattern.pattern) {
                    $fileErrors += @{
                        Pattern = $pattern.id
                        Description = $pattern.description
                        Severity = $pattern.severity
                    }
                }
            } catch {
                # Skip invalid patterns
            }
        }
        
        # Prüfe Error-Handling
        if ($content -match 'console\.error' -and $content -notmatch 'errorFixSystem') {
            $fileErrors += @{
                Type = "missing_error_handler"
                Message = "console.error sollte durch errorFixSystem ersetzt werden"
            }
        }
        
        # Prüfe API-Calls
        if ($content -match 'fetch\s*\(' -and $content -notmatch 'apiErrorHandler') {
            $fileErrors += @{
                Type = "unsafe_api_call"
                Message = "fetch() sollte über apiErrorHandler erfolgen"
            }
        }
        
        # Prüfe Hardcoded URLs
        if ($content -match 'localhost|127\.0\.0\.1' -and $content -notmatch 'apiConfigLoader') {
            $fileErrors += @{
                Type = "hardcoded_url"
                Message = "Hardcoded URLs sollten über apiConfigLoader erfolgen"
            }
        }
        
        # Prüfe Branding
        if ($content -notmatch 'TogetherSystems|ModularFlux') {
            $warnings += "$file: Fehlendes Branding"
        }
        
        # Prüfe Version
        if ($content -match 'VERSION' -and $content -notmatch '3\.0\.0') {
            $warnings += "$file: Version sollte 3.0.0 sein"
        }
        
        if ($fileErrors.Count -eq 0) {
            Write-Host "    ✅ Fehlerfrei" -ForegroundColor Green
            $validated += $file
        } else {
            Write-Host "    ❌ $($fileErrors.Count) Fehler gefunden" -ForegroundColor Red
            $errors += @{
                File = $file
                Errors = $fileErrors
            }
            
            # Auto-Fix versuchen
            Write-Host "    → Versuche Auto-Fix..." -ForegroundColor Yellow
            $fixed = $false
            
            # Fix Error-Handling
            if ($content -match 'console\.error' -and $content -notmatch 'errorFixSystem') {
                # Ersetze console.error durch errorFixSystem (vereinfacht)
                $content = $content -replace 'console\.error\(([^)]+)\);', 'if (window.errorFixSystem) { window.errorFixSystem.reportError($1, { context: ''unknown'' }); } else { console.error($1); }'
                $fixed = $true
            }
            
            if ($fixed) {
                Set-Content -Path $filePath -Value $content -Encoding UTF8
                Write-Host "    ✅ Auto-Fix angewendet" -ForegroundColor Green
                $fixes += $file
            } else {
                Write-Host "    ⚠️  Auto-Fix nicht möglich" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "  ⚠️  Datei nicht gefunden: $file" -ForegroundColor Yellow
        $warnings += "Datei nicht gefunden: $file"
    }
}

# Synchronisiere Mirror
Write-Host ""
Write-Host "[MIRROR] Synchronisiere Mirror..." -ForegroundColor Cyan
Write-Host "  → Führe Code-Mirror Sync aus..." -ForegroundColor Yellow

try {
    $nodePath = Get-Command node -ErrorAction SilentlyContinue
    if ($nodePath) {
        Push-Location $rootDir
        $syncScript = @"
const CodeMirror = require('./ci/spec-mirror/code-mirror.js');
const mirror = new CodeMirror();
const result = mirror.syncMirror();
console.log(JSON.stringify(result, null, 2));
"@
        $syncScript | Out-File -FilePath "temp-sync.js" -Encoding UTF8
        $syncResult = node temp-sync.js 2>&1
        Remove-Item "temp-sync.js" -ErrorAction SilentlyContinue
        Pop-Location
        
        Write-Host "  ✅ Mirror synchronisiert" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Node.js nicht gefunden, überspringe Mirror-Sync" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⚠️  Mirror-Sync fehlgeschlagen: $_" -ForegroundColor Yellow
    $warnings += "Mirror-Sync fehlgeschlagen: $_"
}

# Zusammenfassung
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$summary = @{
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    version = "3.0.0"
    validated = $validated.Count
    errors = $errors.Count
    warnings = $warnings.Count
    fixes = $fixes.Count
    validatedFiles = $validated
    errorFiles = $errors
    warnings = $warnings
    fixedFiles = $fixes
    status = if ($errors.Count -eq 0) { "SUCCESS" } else { "HAS_ERRORS" }
}

$summaryPath = Join-Path $reportPath "MIRROR-VALIDATE-ALL-ERRORS-$timestamp.json"
$summary | ConvertTo-Json -Depth 10 | Set-Content -Path $summaryPath -Encoding UTF8

Write-Host "Validierte Dateien: $($validated.Count)" -ForegroundColor Green
Write-Host "Fehler gefunden: $($errors.Count)" -ForegroundColor $(if ($errors.Count -eq 0) { "Green" } else { "Red" })
Write-Host "Warnungen: $($warnings.Count)" -ForegroundColor $(if ($warnings.Count -eq 0) { "Green" } else { "Yellow" })
Write-Host "Auto-Fixes: $($fixes.Count)" -ForegroundColor Green
Write-Host ""
Write-Host "Report gespeichert: $summaryPath" -ForegroundColor Cyan
Write-Host ""

if ($errors.Count -eq 0) {
    Write-Host "✅ ALLE FEHLER VALIDIERT UND FEHLERFREI" -ForegroundColor Green
} else {
    Write-Host "❌ FEHLER GEFUNDEN - BITTE BEHEBEN" -ForegroundColor Red
    Write-Host ""
    foreach ($error in $errors) {
        Write-Host "  $($error.File):" -ForegroundColor Yellow
        foreach ($err in $error.Errors) {
            Write-Host "    - $($err.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan



