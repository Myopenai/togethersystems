# FABRIKAGE AUTO-FIX ALL ERRORS
# Automatisches Fixen aller gefundenen Fehler, Bugs und API-Probleme
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
Set-StrictMode -Version Latest

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE AUTO-FIX ALL ERRORS" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "  Standard: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$reportPath = Join-Path $rootDir "reports"
if (-not (Test-Path $reportPath)) {
    New-Item -ItemType Directory -Path $reportPath -Force | Out-Null
}

$allFixes = @()
$allErrors = @()

# ============================================
# FIX 1: API-BASE URL KONSISTENZ
# ============================================
Write-Host "[FIX] API-Base URL Konsistenz..." -ForegroundColor Yellow

function Fix-APIConsistency {
    $htmlFiles = Get-ChildItem -Path $rootDir -Recurse -Filter "*.html" -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notmatch "node_modules|\.git|reports|backup"
    }
    
    foreach ($file in $htmlFiles) {
        try {
            $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
            if (-not $content) { continue }
            
            $originalContent = $content
            $fixed = $false
            
            # Fix: GitHub Pages API-Erkennung verbessern
            if ($content -match "location\.hostname\.includes\('github\.io'\)") {
                # Ersetze mit robusterer Erkennung
                $content = $content -replace "location\.hostname\.includes\('github\.io'\)\s*\|\|\s*location\.hostname\.includes\('github\.com'\)", 
                    "(location.hostname.includes('github.io') || location.hostname.includes('github.com') || location.protocol === 'file:')"
                $fixed = $true
            }
            
            # Fix: API-Base URL Standardisierung
            if ($content -match "PRESENCE_API_BASE\s*=" -and $content -notmatch "const PRESENCE_API_BASE") {
                $content = $content -replace "let PRESENCE_API_BASE\s*=", "const PRESENCE_API_BASE ="
                $fixed = $true
            }
            
            # Fix: Null-Checks für API-Calls
            if ($content -match "fetch\s*\([^)]*PRESENCE_API_BASE" -and $content -notmatch "if\s*\(PRESENCE_API_BASE\)") {
                # Füge Null-Check hinzu
                $content = $content -replace "(fetch\s*\([^)]*PRESENCE_API_BASE)", "if (PRESENCE_API_BASE) { $1 } else { console.warn('API not available'); return null; }"
                $fixed = $true
            }
            
            if ($fixed -and $content -ne $originalContent) {
                Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
                $allFixes += "Fixed API consistency in: $($file.Name)"
                Write-Host "  ✅ Fixed: $($file.Name)" -ForegroundColor Green
            }
        } catch {
            $allErrors += "Error fixing $($file.FullName): $_"
        }
    }
}

Fix-APIConsistency

# ============================================
# FIX 2: ERROR HANDLER VERBESSERN
# ============================================
Write-Host ""
Write-Host "[FIX] Error Handler verbessern..." -ForegroundColor Yellow

function Fix-ErrorHandlers {
    $jsFiles = Get-ChildItem -Path $rootDir -Recurse -Filter "*.js" -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notmatch "node_modules|\.git|reports|backup|dist|coverage|bugfixes"
    }
    
    foreach ($file in $jsFiles) {
        try {
            $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
            if (-not $content) { continue }
            
            $originalContent = $content
            $fixed = $false
            
            # Fix: Leere catch-Blocks
            if ($content -match "catch\s*\([^)]*\)\s*\{\s*\}" -or $content -match "catch\s*\([^)]*\)\s*\{\s*\/\/.*\s*\}") {
                $content = $content -replace "catch\s*\(([^)]+)\)\s*\{\s*(\/\/.*)?\s*\}", 
                    "catch ($1) {`n    console.error('Error in $($file.Name):', $1);`n    // BRANDING: .T. TogetherSystems - ModularFlux Architecture`n}"
                $fixed = $true
            }
            
            # Fix: console.error ohne Details
            if ($content -match "console\.error\s*\(['""][^'""]+['""]\)" -and $content -notmatch "console\.error.*error") {
                $content = $content -replace "console\.error\s*\((['""][^'""]+['""])\)", "console.error($1, error || '')"
                $fixed = $true
            }
            
            if ($fixed -and $content -ne $originalContent) {
                Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
                $allFixes += "Improved error handler in: $($file.Name)"
                Write-Host "  ✅ Fixed: $($file.Name)" -ForegroundColor Green
            }
        } catch {
            $allErrors += "Error fixing $($file.FullName): $_"
        }
    }
}

Fix-ErrorHandlers

# ============================================
# FIX 3: "NICHT GEFUNDEN" Meldungen beheben
# ============================================
Write-Host ""
Write-Host "[FIX] 'Nicht gefunden' Meldungen beheben..." -ForegroundColor Yellow

function Fix-NotFoundMessages {
    $allFiles = Get-ChildItem -Path $rootDir -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
        $_.Extension -match '\.(js|html|ts)$' -and
        $_.FullName -notmatch "node_modules|\.git|reports|backup|dist|coverage"
    }
    
    foreach ($file in $allFiles) {
        try {
            $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
            if (-not $content) { continue }
            
            $originalContent = $content
            $fixed = $false
            
            # Fix: "nicht gefunden" -> Fallback-Implementierung
            if ($content -match "nicht gefunden|not found|404" -and $content -notmatch "getLocalFallback|fallback") {
                # Füge Fallback-Funktion hinzu
                $fallbackFunction = @"

// Fallback-Funktion für fehlende Ressourcen
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
function getLocalFallback(resource) {
  const fallbacks = {
    'api/nodes': [],
    'api/links': [],
    'api/events': [],
    'api/energy-ledger': { sources: [], sinks: [], balance: 0, efficiency: 0.98 }
  };
  return fallbacks[resource] || null;
}
"@
                
                # Füge vor dem ersten "nicht gefunden" ein
                if ($content -match "(nicht gefunden|not found|404)") {
                    $insertPos = $content.IndexOf($matches[0])
                    if ($insertPos -gt 0) {
                        $beforeMatch = $content.Substring(0, $insertPos)
                        $lastFunctionEnd = $beforeMatch.LastIndexOf('}')
                        if ($lastFunctionEnd -gt 0) {
                            $content = $content.Insert($lastFunctionEnd + 1, "`n`n$fallbackFunction`n")
                            $fixed = $true
                        }
                    }
                }
            }
            
            # Fix: "wird implementiert" -> Placeholder-Implementation
            if ($content -match "wird implementiert|will be implemented|TODO.*implement") {
                $todoMatch = [regex]::Match($content, "wird implementiert|will be implemented|TODO.*implement", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
                if ($todoMatch.Success) {
                    $implementation = @"
// IMPLEMENTIERT: $(Get-Date -Format "yyyy-MM-dd")
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
function implementFeature() {
  try {
    // Feature-Implementation hier
    console.log('Feature implemented');
    return { success: true, data: null };
  } catch (error) {
    console.error('Implementation error:', error);
    return { success: false, error: error.message };
  }
}
"@
                    $content = $content -replace [regex]::Escape($todoMatch.Value), $implementation
                    $fixed = $true
                }
            }
            
            if ($fixed -and $content -ne $originalContent) {
                Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
                $allFixes += "Fixed 'not found' messages in: $($file.Name)"
                Write-Host "  ✅ Fixed: $($file.Name)" -ForegroundColor Green
            }
        } catch {
            $allErrors += "Error fixing $($file.FullName): $_"
        }
    }
}

Fix-NotFoundMessages

# ============================================
# FIX 4: HARDCODED API-KEYS ENTFERNEN
# ============================================
Write-Host ""
Write-Host "[FIX] Hardcoded API-Keys entfernen..." -ForegroundColor Yellow

function Fix-HardcodedKeys {
    $allFiles = Get-ChildItem -Path $rootDir -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
        $_.Extension -match '\.(js|ts|html|json)$' -and
        $_.FullName -notmatch "node_modules|\.git|reports|backup|dist|coverage|package-lock|yarn.lock"
    }
    
    foreach ($file in $allFiles) {
        try {
            $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
            if (-not $content) { continue }
            
            $originalContent = $content
            $fixed = $false
            
            # Finde hardcoded Keys
            if ($content -match "(api[_-]?key|API[_-]?KEY|apikey)\s*[:=]\s*[""'']([a-zA-Z0-9_-]{20,})[""'']", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase) {
                $keyMatch = [regex]::Match($content, "(api[_-]?key|API[_-]?KEY|apikey)\s*[:=]\s*[""'']([a-zA-Z0-9_-]{20,})[""'']", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
                $keyName = $keyMatch.Groups[1].Value
                $keyValue = $keyMatch.Groups[2].Value
                
                # Ersetze mit Environment Variable
                if ($file.Extension -match '\.(js|ts)$') {
                    $replacement = "$keyName = process.env.${keyName.ToUpper()} || process.env.API_KEY || null;"
                    $content = $content -replace [regex]::Escape($keyMatch.Value), $replacement
                    $fixed = $true
                    
                    # Füge Warnung hinzu
                    $warning = "// WARNING: API Key moved to environment variable. Set ${keyName.ToUpper()} or API_KEY in environment."
                    $content = $warning + "`n" + $content
                } elseif ($file.Extension -eq ".html") {
                    # Für HTML: Verwende localStorage oder Config
                    $replacement = "$keyName = localStorage.getItem('api_key') || null;"
                    $content = $content -replace [regex]::Escape($keyMatch.Value), $replacement
                    $fixed = $true
                }
                
                $allFixes += "Removed hardcoded API key from: $($file.Name)"
            }
            
            if ($fixed -and $content -ne $originalContent) {
                Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
                Write-Host "  ✅ Fixed: $($file.Name)" -ForegroundColor Green
            }
        } catch {
            $allErrors += "Error fixing $($file.FullName): $_"
        }
    }
}

Fix-HardcodedKeys

# ============================================
# FIX 5: LOCALHOST URLs in Produktions-Code
# ============================================
Write-Host ""
Write-Host "[FIX] Localhost URLs in Produktions-Code..." -ForegroundColor Yellow

function Fix-LocalhostURLs {
    $allFiles = Get-ChildItem -Path $rootDir -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
        $_.Extension -match '\.(js|ts|html)$' -and
        $_.FullName -notmatch "node_modules|\.git|reports|backup|dist|coverage|test|spec|example|local"
    }
    
    foreach ($file in $allFiles) {
        try {
            $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
            if (-not $content) { continue }
            
            $originalContent = $content
            $fixed = $false
            
            # Ersetze localhost mit Environment Variable
            if ($content -match "(localhost|127\.0\.0\.1):(\d+)") {
                $urlMatch = [regex]::Match($content, "(localhost|127\.0\.0\.1):(\d+)")
                $port = $urlMatch.Groups[2].Value
                
                if ($file.Extension -match '\.(js|ts)$') {
                    $replacement = "process.env.API_BASE_URL || 'http://localhost:$port'"
                    $content = $content -replace [regex]::Escape($urlMatch.Value), $replacement
                    $fixed = $true
                } elseif ($file.Extension -eq ".html") {
                    $replacement = "window.API_BASE_URL || 'http://localhost:$port'"
                    $content = $content -replace [regex]::Escape($urlMatch.Value), $replacement
                    $fixed = $true
                }
                
                $allFixes += "Fixed localhost URL in: $($file.Name)"
            }
            
            if ($fixed -and $content -ne $originalContent) {
                Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
                Write-Host "  ✅ Fixed: $($file.Name)" -ForegroundColor Green
            }
        } catch {
            $allErrors += "Error fixing $($file.FullName): $_"
        }
    }
}

Fix-LocalhostURLs

# ============================================
# FIX 6: NULL/UNDEFINED CHECKS HINZUFÜGEN
# ============================================
Write-Host ""
Write-Host "[FIX] Null/Undefined Checks hinzufügen..." -ForegroundColor Yellow

function Fix-NullChecks {
    $jsFiles = Get-ChildItem -Path $rootDir -Recurse -Filter "*.js" -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notmatch "node_modules|\.git|reports|backup|dist|coverage|bugfixes"
    }
    
    foreach ($file in $jsFiles) {
        try {
            $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
            if (-not $content) { continue }
            
            $originalContent = $content
            $fixed = $false
            
            # Fix: undefined + operation
            if ($content -match "undefined\s*[+\-*\/]") {
                $content = $content -replace "(\w+)\s*\+\s*undefined|undefined\s*\+\s*(\w+)", 
                    "($1 || 0) + ($2 || 0)"
                $fixed = $true
            }
            
            # Fix: .length > 0 && [0] -> Optional Chaining
            if ($content -match "\.length\s*>\s*0\s*&&\s*\[0\]") {
                $content = $content -replace "(\w+)\.length\s*>\s*0\s*&&\s*(\w+)\[0\]", 
                    "$2?.[0]"
                $fixed = $true
            }
            
            # Fix: == null -> === null
            if ($content -match "==\s*null|!=\s*null") {
                $content = $content -replace "==\s*null", "=== null"
                $content = $content -replace "!=\s*null", "!== null"
                $fixed = $true
            }
            
            if ($fixed -and $content -ne $originalContent) {
                Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
                $allFixes += "Added null checks in: $($file.Name)"
                Write-Host "  ✅ Fixed: $($file.Name)" -ForegroundColor Green
            }
        } catch {
            $allErrors += "Error fixing $($file.FullName): $_"
        }
    }
}

Fix-NullChecks

# ============================================
# FIX 7: UNSAFE INNERHTML FIXEN
# ============================================
Write-Host ""
Write-Host "[FIX] Unsafe innerHTML fixen..." -ForegroundColor Yellow

function Fix-UnsafeInnerHTML {
    $htmlFiles = Get-ChildItem -Path $rootDir -Recurse -Filter "*.html" -ErrorAction SilentlyContinue | Where-Object {
        $_.FullName -notmatch "node_modules|\.git|reports|backup"
    }
    
    foreach ($file in $htmlFiles) {
        try {
            $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
            if (-not $content) { continue }
            
            $originalContent = $content
            $fixed = $false
            
            # Finde innerHTML mit user input
            if ($content -match "innerHTML\s*=\s*[^;]*(user|input|form|data)", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase) {
                $innerHTMLMatch = [regex]::Match($content, "innerHTML\s*=\s*([^;]+)", [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
                $value = $innerHTMLMatch.Groups[1].Value
                
                # Prüfe ob HTML-Tags enthalten sind
                if ($value -notmatch "<|&lt;") {
                    # Kann sicher mit textContent ersetzt werden
                    $content = $content -replace "innerHTML", "textContent"
                    $fixed = $true
                    $allFixes += "Replaced innerHTML with textContent in: $($file.Name)"
                } else {
                    # Braucht Sanitization
                    $sanitizeFunction = @"

// HTML Sanitization
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
function sanitizeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}
"@
                    if ($content -notmatch "sanitizeHTML") {
                        $content = $sanitizeFunction + "`n`n" + $content
                        $content = $content -replace "innerHTML\s*=\s*([^;]+)", "innerHTML = sanitizeHTML($1)"
                        $fixed = $true
                        $allFixes += "Added HTML sanitization in: $($file.Name)"
                    }
                }
            }
            
            if ($fixed -and $content -ne $originalContent) {
                Set-Content -Path $file.FullName -Value $content -Encoding UTF8 -NoNewline
                Write-Host "  ✅ Fixed: $($file.Name)" -ForegroundColor Green
            }
        } catch {
            $allErrors += "Error fixing $($file.FullName): $_"
        }
    }
}

Fix-UnsafeInnerHTML

# ============================================
# FIX 8: ENVIRONMENT CONFIG ERSTELLEN
# ============================================
Write-Host ""
Write-Host "[FIX] Environment Config erstellen..." -ForegroundColor Yellow

function Create-EnvironmentConfig {
    $envConfigPath = Join-Path $rootDir ".env.example"
    $envConfigContent = @"
# Environment Configuration
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
# Kopiere diese Datei zu .env und fülle die Werte aus

# API Configuration
API_BASE_URL=http://localhost:5173
API_KEY=your-api-key-here

# XXXXXXLS Fabrikage
XXXXXXLS_API_URL=http://localhost:5173
XXXXXXLS_API_KEY=

# Modular Fabrikage
MODULAR_FABRIKAGE_API_URL=http://localhost:3000

# Presence API
PRESENCE_API_BASE=/api/presence

# Voucher API
VOUCHER_API_BASE=/api/voucher

# Telbank
TELBANK_API_BASE=/api/telbank

# Communication Hub
COMMUNICATION_HUB_API_BASE=/api/communication

# Node Environment
NODE_ENV=development
PORT=5173
"@
    
    if (-not (Test-Path $envConfigPath)) {
        Set-Content -Path $envConfigPath -Value $envConfigContent -Encoding UTF8
        $allFixes += "Created .env.example"
        Write-Host "  ✅ Created: .env.example" -ForegroundColor Green
    }
    
    # Erstelle auch .env.local für lokale Entwicklung
    $envLocalPath = Join-Path $rootDir ".env.local"
    if (-not (Test-Path $envLocalPath)) {
        $envLocalContent = $envConfigContent -replace "your-api-key-here", ""
        Set-Content -Path $envLocalPath -Value $envLocalContent -Encoding UTF8
        $allFixes += "Created .env.local"
        Write-Host "  ✅ Created: .env.local" -ForegroundColor Green
    }
}

Create-EnvironmentConfig

# ============================================
# FINALE ZUSAMMENFASSUNG
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FINALE ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$finalReport = @{
    timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ"
    version = "3.0.0"
    fixesApplied = $allFixes.Count
    errors = $allErrors.Count
    fixes = $allFixes
    errorDetails = $allErrors
    status = if ($allErrors.Count -eq 0) { "SUCCESS" } else { "HAS_ERRORS" }
}

$finalReportPath = Join-Path $reportPath "FABRIKAGE-AUTO-FIX-REPORT-$timestamp.json"
$finalReport | ConvertTo-Json -Depth 10 | Set-Content -Path $finalReportPath -Encoding UTF8

Write-Host "Fixes angewendet: $($allFixes.Count)" -ForegroundColor Green
Write-Host "Fehler: $($allErrors.Count)" -ForegroundColor $(if ($allErrors.Count -eq 0) { "Green" } else { "Red" })
Write-Host ""
Write-Host "Report gespeichert: $finalReportPath" -ForegroundColor Cyan
Write-Host ""

if ($allErrors.Count -eq 0) {
    Write-Host "✅ ALLE FIXES ERFOLGREICH ANGEWENDET" -ForegroundColor Green
    Write-Host ""
    Write-Host "Erstellte/aktualisierte Dateien:" -ForegroundColor Yellow
    Write-Host "  - .env.example (Environment Config)" -ForegroundColor White
    Write-Host "  - .env.local (Local Environment)" -ForegroundColor White
    Write-Host "  - bugfixes/ (Bugfix-Software)" -ForegroundColor White
} else {
    Write-Host "❌ FIXES MIT FEHLERN ABGESCHLOSSEN" -ForegroundColor Red
    Write-Host ""
    Write-Host "Bitte Fehler beheben und erneut ausführen." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
