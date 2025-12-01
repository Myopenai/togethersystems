# T,. FIX ALL 404 AND GITHUB URLS
# Behebt alle 404-Fehler und korrigiert GitHub-URLs

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "FIX ALL 404 AND GITHUB URLS" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Korrigiere falsche GitHub-URLs
Write-Host "🔧 PHASE 1: Korrigiere GitHub-URLs..." -ForegroundColor Yellow

$htmlFiles = Get-ChildItem -Path . -Include *.html -Recurse -ErrorAction SilentlyContinue | Where-Object { 
    $_.FullName -notmatch "node_modules|\.git|archive|backup|gentlyoverdone|Anweisungen|Prefinal" 
}

$fixed = 0
foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if ($content) {
        $original = $content
        
        # Korrigiere falsche GitHub-URLs
        $content = $content -replace 'https://github\.com/T-T-T-Sysytems-T-T-T-Systems-com-T-T/\.github/blob/main/TGPA_Businessplan_DE\.pdf', 'https://github.com/myopenai/togethersystems/blob/main/TGPA_Businessplan_DE.pdf'
        $content = $content -replace 'https://github\.com/[^/]+/[^/]+/\.github/blob/', 'https://github.com/myopenai/togethersystems/blob/'
        
        # Entferne MD-Datei-Referenzen aus Code (nur in Script-Tags)
        $content = $content -replace '(?s)(<script[^>]*>.*?)(\.md|\.MD)(.*?</script>)', '$1$3'
        
        # Korrigiere GitHub Pages URLs
        $content = $content -replace 'https://[^/]+\.github\.io/[^/]+/', 'https://myopenai.github.io/togethersystems/'
        $content = $content -replace 'https://businessconnecthub\.pages\.dev/', 'https://togethersystems.pages.dev/'
        
        if ($content -ne $original) {
            Set-Content -Path $file.FullName -Value $content -NoNewline
            $fixed++
            Write-Host "   ✅ Korrigiert: $($file.Name)" -ForegroundColor Green
        }
    }
}

Write-Host "   ✅ $fixed Dateien korrigiert" -ForegroundColor Green
Write-Host ""
Write-Host "✅ ALLE URLS KORRIGIERT!" -ForegroundColor Green

