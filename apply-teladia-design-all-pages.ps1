# Apply Teladia Design to All Pages
# IBM+++ MCP MCP MCP Standard

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TELADIA DESIGN ROLLOUT" -ForegroundColor Cyan
Write-Host "IBM+++ MCP MCP MCP STANDARD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$htmlFiles = @(
    "index.html",
    "manifest-portal.html",
    "manifest-forum.html",
    "honeycomb.html",
    "legal-hub.html",
    "admin.html",
    "admin-monitoring.html",
    "business-admin.html",
    "help-portal.html",
    "help-manifest.html",
    "help-online-portal.html",
    "help-honeycomb.html",
    "help-legal-hub.html",
    "suppliers-story.html"
)

$count = 0
foreach ($file in $htmlFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "  [SKIP] $file (nicht gefunden)" -ForegroundColor Yellow
        continue
    }
    
    $content = Get-Content $file -Raw -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    $modified = $false
    
    # 1. TELADIA Link korrigieren
    if ($content -match 'TELADIA/teladia-portal\.html' -and $content -notmatch 'teladia-portal-redesign\.html') {
        $content = $content -replace 'TELADIA/teladia-portal\.html', 'TELADIA/teladia-portal-redesign.html'
        $modified = $true
    }
    
    # 2. ORCID Link aktiv machen (falls noch nicht aktiv)
    if ($content -match 'https://orcid\.org/0009-0003-1328-2430' -and $content -notmatch '<a[^>]*href="https://orcid\.org/0009-0003-1328-2430"') {
        $content = $content -replace '(?<!href=")https://orcid\.org/0009-0003-1328-2430(?!")', '<a href="https://orcid.org/0009-0003-1328-2430" target="_blank" rel="noopener noreferrer" style="color:#a5b4fc;text-decoration:underline;">https://orcid.org/0009-0003-1328-2430</a>'
        $modified = $true
    }
    
    # 3. TELADIA Link hinzufügen (falls nicht vorhanden)
    if ($content -match 'ts-brand-links' -and $content -notmatch 'TELADIA') {
        # Füge TELADIA Link nach TELBANK ein
        if ($content -match '(TELBANK[^<]*</a>)') {
            $teladiaLink = '      <a href="TELADIA/teladia-portal-redesign.html" title="TELADIA Asset Exchange Sphere – Deutsche Bank Integration" style="background: linear-gradient(135deg, rgba(0, 24, 168, 0.3), rgba(0, 234, 255, 0.3)); border: 2px solid #0018a8; color: #00eaff; font-weight: 700; font-size: 1.05rem;">TELADIA</a>'
            $content = $content -replace '(TELBANK[^<]*</a>)', "`$1`n$teladiaLink"
            $modified = $true
        }
    }
    
    # 4. T,. Symbol hinzufügen (falls nicht vorhanden)
    if ($content -match '\.ts-brand-links a' -and $content -notmatch '\.ts-brand-links a::before') {
        $tsSymbolStyle = @"

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
        if ($content -match '</style>') {
            $content = $content -replace '</style>', "$tsSymbolStyle`n</style>"
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file -Value $content -NoNewline
        $count++
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [OK] $file (bereits aktualisiert)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DESIGN ROLLOUT COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "$count Dateien aktualisiert" -ForegroundColor White
Write-Host ""

