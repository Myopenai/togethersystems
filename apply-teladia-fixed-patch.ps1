# Apply Teladia Fixed Patch - IBM+++ MCP MCP MCP Standard
# 1. ORCID Links aktiv machen
# 2. TELADIA Bank sichtbar machen
# 3. Teladia Design auf alle Seiten ausrollen
# 4. T,. Symbol vor jedem Menüpunkt

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TELADIA FIXED PATCH APPLIER" -ForegroundColor Cyan
Write-Host "IBM+++ MCP MCP MCP STANDARD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$htmlFiles = Get-ChildItem -Path . -Filter "*.html" -Recurse -File | Where-Object {
    $_.FullName -notlike "*\node_modules\*" -and
    $_.FullName -notlike "*\backup\*" -and
    $_.FullName -notlike "*\archive\*" -and
    $_.FullName -notlike "*\Produktionsordner\*" -and
    $_.FullName -notlike "*\PRODUCTION-PACKAGE\*" -and
    $_.FullName -notlike "*\DEPLOY-PACKAGE\*"
}

$telbankStyle = Get-Content "TELBANK/index.html" -Raw | Select-String -Pattern '(?s)<style>(.*?)</style>' | ForEach-Object { $_.Matches[0].Groups[1].Value }

Write-Host "Verarbeite $($htmlFiles.Count) HTML-Dateien..." -ForegroundColor Yellow
Write-Host ""

$count = 0
foreach ($file in $htmlFiles) {
    $content = Get-Content $file.FullName -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $modified = $false
    
    # 1. ORCID Links aktiv machen
    if ($content -match 'https://orcid\.org/0009-0003-1328-2430' -and $content -notmatch '<a[^>]*href="https://orcid\.org/0009-0003-1328-2430"') {
        $content = $content -replace '(?<!href=")https://orcid\.org/0009-0003-1328-2430(?!")', '<a href="https://orcid.org/0009-0003-1328-2430" target="_blank" rel="noopener noreferrer" style="color:#a5b4fc;text-decoration:underline;">https://orcid.org/0009-0003-1328-2430</a>'
        $modified = $true
    }
    
    # 2. TELADIA Link prüfen und korrigieren
    if ($content -match 'TELADIA/teladia-portal\.html' -and -not (Test-Path "TELADIA/teladia-portal.html")) {
        if (Test-Path "TELADIA/teladia-portal-redesign.html") {
            $content = $content -replace 'TELADIA/teladia-portal\.html', 'TELADIA/teladia-portal-redesign.html'
            $modified = $true
        }
    }
    
    # 3. T,. Symbol vor Menüpunkten hinzufügen
    if ($content -match '\.ts-brand-links a' -and $content -notmatch '\.ts-brand-links a::before') {
        $tsBrandLinksStyle = @"

/* T,. Symbol vor jedem Menüpunkt */
.ts-brand-links a::before {
  content: "T,.";
  display: inline-block;
  margin-right: 4px;
  font-weight: 700;
  color: var(--accent, #10b981);
  font-size: 0.9em;
}

"@
        # Füge nach .ts-brand-links a Regel hinzu
        if ($content -match '(\.ts-brand-links a\{[^}]*\})') {
            $content = $content -replace '(\.ts-brand-links a\{[^}]*\})', "`$1`n$tsBrandLinksStyle"
            $modified = $true
        } elseif ($content -match '(\.ts-brand-links a[^\{]*\{[^}]*\})') {
            $content = $content -replace '(\.ts-brand-links a[^\{]*\{[^}]*\})', "`$1`n$tsBrandLinksStyle"
            $modified = $true
        } elseif ($content -match '</style>') {
            $content = $content -replace '</style>', "$tsBrandLinksStyle`n</style>"
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $count++
        Write-Host "  [OK] $($file.Name)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "PATCH APPLIED" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "$count Dateien aktualisiert" -ForegroundColor White
Write-Host ""

