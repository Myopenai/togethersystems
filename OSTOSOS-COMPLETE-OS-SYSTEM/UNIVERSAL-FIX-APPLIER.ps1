# T,. OSOTOSOS - Universal Fix Applier
# Wendet Auto-Init und Dummy-Help auf alle HTML-Dateien an

$ErrorActionPreference = "Continue"
$rootDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $rootDir

Write-Host "=== T,. OSOTOSOS - Universal Fix Applier ===" -ForegroundColor Cyan
Write-Host ""

# Finde alle HTML-Dateien (außer artifacts, build, etc.)
$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse | Where-Object {
    $_.FullName -notmatch 'node_modules|\.git|build|artifacts|ARCHIV'
}

Write-Host "Gefundene HTML-Dateien: $($htmlFiles.Count)" -ForegroundColor Yellow

$fixed = 0
$skipped = 0

foreach ($file in $htmlFiles) {
    $relativePath = $file.FullName.Replace($rootDir, '.').Replace('\', '/')
    $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    
    if (-not $content) { 
        $skipped++
        continue 
    }
    
    $modified = $false
    
    # 1. Füge universal-auto-init.js hinzu (wenn noch nicht vorhanden)
    if ($content -notmatch 'universal-auto-init\.js') {
        # Suche nach </body> oder </html>
        if ($content -match '</body>') {
            $content = $content -replace '</body>', '<script src="./universal-auto-init.js" onerror="console.warn(''universal-auto-init.js nicht gefunden'')"></script>' + "`n</body>"
            $modified = $true
        } elseif ($content -match '</html>') {
            $content = $content -replace '</html>', '<script src="./universal-auto-init.js" onerror="console.warn(''universal-auto-init.js nicht gefunden'')"></script>' + "`n</html>"
            $modified = $true
        }
    }
    
    # 2. Füge universal-dummy-help.js hinzu (wenn noch nicht vorhanden)
    if ($content -notmatch 'universal-dummy-help\.js') {
        if ($content -match '</body>') {
            $content = $content -replace '</body>', '<script src="./universal-dummy-help.js" onerror="console.warn(''universal-dummy-help.js nicht gefunden'')"></script>' + "`n</body>"
            $modified = $true
        } elseif ($content -match '</html>') {
            $content = $content -replace '</html>', '<script src="./universal-dummy-help.js" onerror="console.warn(''universal-dummy-help.js nicht gefunden'')"></script>' + "`n</html>"
            $modified = $true
        }
    }
    
    # 3. Füge DOMContentLoaded hinzu (wenn Scripts vorhanden aber kein DOMContentLoaded)
    if ($content -match '<script' -and $content -notmatch 'DOMContentLoaded|addEventListener.*load|window\.onload') {
        # Füge Auto-Init Wrapper hinzu
        if ($content -match '</body>') {
            $autoInitWrapper = @'
<script>
(function() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      if (window.OSOS_AUTO_INIT) OSOS_AUTO_INIT.reinit();
      if (window.OSOS_DUMMY_HELP) OSOS_DUMMY_HELP.addExplanations();
    });
  } else {
    if (window.OSOS_AUTO_INIT) OSOS_AUTO_INIT.reinit();
    if (window.OSOS_DUMMY_HELP) OSOS_DUMMY_HELP.addExplanations();
  }
})();
</script>
'@
            $content = $content -replace '</body>', $autoInitWrapper + "`n</body>"
            $modified = $true
        }
    }
    
    # 4. Füge Tooltips zu Buttons hinzu (wenn noch nicht vorhanden)
    $buttonMatches = [regex]::Matches($content, '<button[^>]*>([^<]+)</button>')
    foreach ($match in $buttonMatches) {
        $buttonHtml = $match.Value
        $buttonText = $match.Groups[1].Value.Trim()
        
        if ($buttonHtml -notmatch 'title\s*=' -and $buttonText.Length -gt 0 -and $buttonText.Length -lt 100) {
            $newButtonHtml = $buttonHtml -replace '<button', "<button title=`"$buttonText - Klicke hier um diese Aktion auszuführen`""
            $content = $content -replace [regex]::Escape($buttonHtml), $newButtonHtml
            $modified = $true
        }
    }
    
    # 5. Füge autocomplete zu Inputs hinzu
    $inputMatches = [regex]::Matches($content, '<input[^>]*>')
    foreach ($match in $inputMatches) {
        $inputHtml = $match.Value
        if ($inputHtml -notmatch 'autocomplete\s*=' -and $inputHtml -notmatch 'type\s*=\s*["''](submit|button|checkbox|radio|file|hidden)') {
            $newInputHtml = $inputHtml -replace '<input', '<input autocomplete="on"'
            $content = $content -replace [regex]::Escape($inputHtml), $newInputHtml
            $modified = $true
        }
    }
    
    if ($modified) {
        try {
            [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.UTF8Encoding]::new($false))
            Write-Host "✅ Fix angewendet: $relativePath" -ForegroundColor Green
            $fixed++
        } catch {
            Write-Host "❌ Fehler bei: $relativePath - $_" -ForegroundColor Red
        }
    } else {
        $skipped++
    }
}

Write-Host ""
Write-Host "=== Fix abgeschlossen ===" -ForegroundColor Green
Write-Host "Dateien gefixt: $fixed" -ForegroundColor Cyan
Write-Host "Dateien übersprungen: $skipped" -ForegroundColor Yellow
Write-Host ""

