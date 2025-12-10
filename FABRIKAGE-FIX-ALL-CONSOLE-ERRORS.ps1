# FABRIKAGE FIX ALL CONSOLE ERRORS
# Ersetzt alle console.error/console.warn durch strukturierte Error-Handler
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE FIX ALL CONSOLE ERRORS" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot
$fixes = @()

function Fix-ConsoleErrors {
    param([string]$FilePath)
    
    $content = Get-Content -Path $FilePath -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return }
    
    $originalContent = $content
    $changed = $false
    
    # Ersetze console.error mit Error-Fix-System
    if ($content -match 'console\.error') {
        # Pattern 1: console.error('message', e)
        $content = $content -replace 'console\.error\(([''"])([^''"]+)\1,\s*([^)]+)\);', @'
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError($3, { context: '$2' });
      } else {
        console.error('$2', $3);
      }
'@
        
        # Pattern 2: console.error('message')
        $content = $content -replace 'console\.error\(([''"])([^''"]+)\1\);', @'
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(new Error('$2'), { context: 'unknown' });
      } else {
        console.error('$2');
      }
'@
        
        # Pattern 3: console.error(`template string`, vars)
        $content = $content -replace 'console\.error\(`([^`]+)`([^)]*)\);', @'
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(new Error('$1'), { context: 'template', vars: [$2] });
      } else {
        console.error(`$1`$2);
      }
'@
        
        if ($content -ne $originalContent) {
            $changed = $true
        }
    }
    
    # Ersetze console.warn mit Error-Fix-System
    if ($content -match 'console\.warn') {
        $content = $content -replace 'console\.warn\(([''"])([^''"]+)\1([^)]*)\);', @'
      if (window.errorFixSystem) {
        window.errorFixSystem.reportError(new Error('$2'), { context: 'warning', severity: 'low' });
      } else {
        console.warn('$2'$3);
      }
'@
        
        if ($content -ne $originalContent) {
            $changed = $true
        }
    }
    
    if ($changed) {
        Set-Content -Path $FilePath -Value $content -Encoding UTF8
        return $true
    }
    
    return $false
}

# Fixe alle JS-Dateien in modular-fabrikage
Write-Host "[FIX] Fixe console.error/console.warn in modular-fabrikage..." -ForegroundColor Cyan

$jsFiles = Get-ChildItem -Path (Join-Path $rootDir "modular-fabrikage\js") -Filter "*.js" -ErrorAction SilentlyContinue

foreach ($file in $jsFiles) {
    if (Fix-ConsoleErrors -FilePath $file.FullName) {
        $fixes += "Fixed console errors in $($file.Name)"
        Write-Host "  ✅ $($file.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ CONSOLE ERRORS FIX ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Fixes: $($fixes.Count)" -ForegroundColor Green
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan



