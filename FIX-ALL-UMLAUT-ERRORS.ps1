# [.SYSTEMS.T.SYSTEMS.] FIX ALL UMLAUT ERRORS
# Behebt alle Umlaut-Encoding-Fehler in HTML-Dateien

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] FIX ALL UMLAUT ERRORS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$ROOT = $PSScriptRoot
$htmlFiles = Get-ChildItem -Path $ROOT -Recurse -Filter "*.html" -File | Where-Object { 
    $_.FullName -notmatch "node_modules|\.git|build|Fixpatch" 
}

$fixes = @{
    "•" = "•"
    "â€" = "—"
    """ = """"
    "â€" = """"
    "â†'" = "→"
    "ä" = "ä"
    "ö" = "ö"
    "ü" = "ü"
    "ß" = "ß"
    "Ä" = "Ä"
    "Ö" = "Ö"
    "Ãœ" = "Ü"
    "Ã©" = "é"
    "Ã¨" = "è"
    "Ã§" = "ç"
    "Ã " = "à"
    "Ã¢" = "â"
    "Ãª" = "ê"
    "Ã®" = "î"
    "Ã´" = "ô"
    "Ã»" = "û"
    "Ã±" = "ñ"
    "Ã¡" = "á"
    "Ã­" = "í"
    "Ã³" = "ó"
    "Ãº" = "ú"
    "Ã½" = "ý"
}

$totalFixed = 0
$filesFixed = 0

foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $originalContent = $content
        $fileFixed = $false
        
        foreach ($wrong in $fixes.Keys) {
            if ($content -match [regex]::Escape($wrong)) {
                $content = $content -replace [regex]::Escape($wrong), $fixes[$wrong]
                $fileFixed = $true
            }
        }
        
        if ($fileFixed) {
            $content | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
            $filesFixed++
            $totalFixed++
            Write-Host "  ✅ Behoben: $($file.Name)" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ❌ Fehler bei $($file.Name): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "UMLAUT-FIX ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "Dateien behoben: $filesFixed" -ForegroundColor White
Write-Host "Gesamt-Fixes: $totalFixed" -ForegroundColor White
Write-Host ""

