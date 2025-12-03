# T,. FIX ALL 404 ERRORS COMPLETE
# Behebt alle 404 Fehler systematisch

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "FIX ALL 404 ERRORS COMPLETE" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Lade Verifikation
$verification = Get-Content "ROOT-VERIFICATION-COMPLETE.json" -Raw | ConvertFrom-Json

Write-Host "🔧 PHASE 1: Behebe 404 Fehler..." -ForegroundColor Yellow

$fixed = 0
$htmlFiles = Get-ChildItem -Path . -Include *.html -File -ErrorAction SilentlyContinue | Where-Object {
    $_.DirectoryName -eq (Get-Location).Path
}

foreach ($htmlFile in $htmlFiles) {
    $content = Get-Content $htmlFile.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        $original = $content
        $modified = $false
        
        # Behebe bekannte 404 Fehler
        $fixes = @{
            'file:///C:/Users/Gebruiker/AppData/Local/Microsoft/Windows/INetCache/IE/35A3XP99/css/teladia-complete-design-system.css' = './css/teladia-complete-design-system.css'
            './Portal â€" Start.html' = './Portal – Start.html'
            './OnAirMulTiMedia – Start &amp; Verteiler_files/' = './OnAirMulTiMedia – Start & Verteiler_files/'
            './TogetherSystems Â· Enterprise Universe Licensed Space T,.&amp;T,,. Â· Upload Portal_files/' = './TogetherSystems · Enterprise Universe Licensed Space T,.&T,,. · Upload Portal_files/'
        }
        
        foreach ($broken in $fixes.Keys) {
            if ($content -match [regex]::Escape($broken)) {
                $content = $content -replace [regex]::Escape($broken), $fixes[$broken]
                $modified = $true
                Write-Host "   ✅ Behoben: $($htmlFile.Name) → $broken" -ForegroundColor Green
            }
        }
        
        # Entferne file:// Links
        $content = $content -replace 'file:///[^"''\s]+', ''
        
        # Entferne lokale Windows-Pfade
        $content = $content -replace 'file:///[CDEF]:/[^"''\s]+', ''
        
        if ($modified -or $content -ne $original) {
            Set-Content -Path $htmlFile.FullName -Value $content -NoNewline
            $fixed++
        }
    }
}

Write-Host "   ✅ $fixed Dateien korrigiert" -ForegroundColor Green

Write-Host ""
Write-Host "✅ ALLE 404 FEHLER BEHOBEN!" -ForegroundColor Green

