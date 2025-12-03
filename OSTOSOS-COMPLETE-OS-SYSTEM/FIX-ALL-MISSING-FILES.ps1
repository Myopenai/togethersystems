# T,. OSOTOSOS - Fix All Missing Files
# Erstellt alle fehlenden JavaScript-Dateien oder entfernt Referenzen

$ErrorActionPreference = "Continue"
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir

Write-Host "=== T,. OSOTOSOS - Fix All Missing Files ===" -ForegroundColor Cyan
Write-Host ""

# Fehlende JS-Dateien die erstellt werden sollen
$missingFiles = @{
    "autofix-client.js" = @"
// T,. OSOTOSOS - AutoFix Client (Fallback)
// Wird automatisch geladen falls nicht vorhanden

(function() {
  'use strict';
  if (typeof window.AutoFixClient === 'undefined') {
    window.AutoFixClient = {
      fix: function() { console.log('AutoFix Client: Fix function called'); },
      scan: function() { console.log('AutoFix Client: Scan function called'); }
    };
  }
  console.log('T,. AutoFix Client loaded (fallback)');
})();
"@
    "room-image-carousel.js" = @"
// T,. OSOTOSOS - Room Image Carousel (Fallback)
(function() {
  'use strict';
  if (typeof window.RoomImageCarousel === 'undefined') {
    window.RoomImageCarousel = {
      init: function() { console.log('Room Image Carousel: Init'); },
      next: function() { console.log('Room Image Carousel: Next'); },
      prev: function() { console.log('Room Image Carousel: Prev'); }
    };
  }
  console.log('T,. Room Image Carousel loaded (fallback)');
})();
"@
    "dashboard.js" = @"
// T,. OSOTOSOS - Dashboard (Fallback)
(function() {
  'use strict';
  if (typeof window.Dashboard === 'undefined') {
    window.Dashboard = {
      init: function() { console.log('Dashboard: Init'); },
      update: function() { console.log('Dashboard: Update'); }
    };
  }
  console.log('T,. Dashboard loaded (fallback)');
})();
"@
}

$created = 0
$removed = 0

# Erstelle fehlende Dateien
foreach ($file in $missingFiles.Keys) {
    $filePath = Join-Path $rootDir $file
    if (-not (Test-Path $filePath)) {
        try {
            Set-Content -Path $filePath -Value $missingFiles[$file] -Encoding UTF8
            Write-Host "✅ Erstellt: $file" -ForegroundColor Green
            $created++
        } catch {
            $errMsg = $_.Exception.Message
            Write-Host "FAIL Fehler bei $file: $errMsg" -ForegroundColor Red
        }
    }
}

# Entferne Referenzen zu nicht-existierenden Dateien in documentation-portal.html
$docPortal = Join-Path $rootDir "documentation-portal.html"
if (Test-Path $docPortal) {
    $content = Get-Content $docPortal -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if ($content) {
        $modified = $false
        
        # Entferne Referenzen zu nicht-existierenden Dateien
        $nonExistentFiles = @(
            "verification/master-verification-system.js",
            "./YORDY/integration-script.js",
            "./portal-entry-notice/js/config.js",
            "./portal-entry-notice/js/entryNotice.js",
            "./backup-restore-enhanced.js"
        )
        
        foreach ($file in $nonExistentFiles) {
            $pattern = [regex]::Escape($file)
            if ($content -match $pattern) {
                # Entferne script tag
                $content = $content -replace "<script[^>]*src\s*=\s*['`"]$pattern['`"][^>]*></script>", ""
                $modified = $true
                $removed++
            }
        }
        
        if ($modified) {
            try {
                [System.IO.File]::WriteAllText($docPortal, $content, [System.Text.UTF8Encoding]::new($false))
                Write-Host "✅ documentation-portal.html bereinigt" -ForegroundColor Green
            } catch {
                Write-Host "❌ Fehler beim Schreiben: $_" -ForegroundColor Red
            }
        }
    }
}

Write-Host ""
Write-Host "Dateien erstellt: $created" -ForegroundColor Cyan
Write-Host "Referenzen entfernt: $removed" -ForegroundColor Cyan
Write-Host "=== Fix abgeschlossen ===" -ForegroundColor Green
Write-Host ""

