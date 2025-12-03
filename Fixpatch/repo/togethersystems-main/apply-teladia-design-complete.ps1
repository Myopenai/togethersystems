# Apply TELADIA Design System to ALL HTML Pages
# IBM+++ MCP MCP MCP Standard - Industrial Fabrication Software
# 100% Complete Design Rollout

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TELADIA COMPLETE DESIGN ROLLOUT" -ForegroundColor Cyan
Write-Host "IBM+++ MCP MCP MCP STANDARD" -ForegroundColor Cyan
Write-Host "Industrial Fabrication Software" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Get all HTML files (excluding backups, node_modules, etc.)
$htmlFiles = Get-ChildItem -Path . -Filter "*.html" -Recurse -File | Where-Object {
    $_.FullName -notlike "*\node_modules\*" -and
    $_.FullName -notlike "*\backup\*" -and
    $_.FullName -notlike "*\archive\*" -and
    $_.FullName -notlike "*\Produktionsordner\*" -and
    $_.FullName -notlike "*\PRODUCTION-PACKAGE\*" -and
    $_.FullName -notlike "*\DEPLOY-PACKAGE\*" -and
    $_.FullName -notlike "*\Anweisungen\*" -and
    $_.FullName -notlike "*\.git\*"
}

Write-Host "Gefundene HTML-Dateien: $($htmlFiles.Count)" -ForegroundColor Yellow
Write-Host ""

# Read the complete TELADIA design CSS
$teladiaCSS = Get-Content "css/teladia-complete-design-system.css" -Raw -ErrorAction SilentlyContinue
if (-not $teladiaCSS) {
    Write-Host "FEHLER: css/teladia-complete-design-system.css nicht gefunden!" -ForegroundColor Red
    exit 1
}

$count = 0
$errors = 0

foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        if (-not $content) { continue }
        
        $modified = $false
        
        # 1. Check if teladia-complete-design-system.css is already linked
        $hasTeladiaCSS = $content -match 'teladia-complete-design-system\.css'
        
        if (-not $hasTeladiaCSS) {
            # Calculate relative path to css folder
            $fileDir = Split-Path $file.FullName -Parent
            $rootDir = Get-Location
            $relativePath = ""
            
            if ($fileDir -ne $rootDir) {
                $relativePath = "../" * (($fileDir -replace [regex]::Escape($rootDir.Path), "").Split([IO.Path]::DirectorySeparatorChar).Count - 1)
            }
            
            # Add link to teladia-complete-design-system.css before </head>
            if ($content -match '</head>') {
                $linkTag = "`n  <link rel=`"stylesheet`" href=`"${relativePath}css/teladia-complete-design-system.css`">"
                $content = $content -replace '</head>', "$linkTag`n</head>"
                $modified = $true
            } elseif ($content -match '<head>') {
                # If no </head> found, add after <head>
                $linkTag = "`n  <link rel=`"stylesheet`" href=`"${relativePath}css/teladia-complete-design-system.css`">"
                $content = $content -replace '<head>', "<head>$linkTag"
                $modified = $true
            }
        }
        
        # 2. Ensure T,. Symbol is present
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
        
        # 3. Ensure ORCID link is active
        if ($content -match 'https://orcid\.org/0009-0003-1328-2430' -and $content -notmatch '<a[^>]*href="https://orcid\.org/0009-0003-1328-2430"') {
            $content = $content -replace '(?<!href=")https://orcid\.org/0009-0003-1328-2430(?!")', '<a href="https://orcid.org/0009-0003-1328-2430" target="_blank" rel="noopener noreferrer" style="color:#a5b4fc;text-decoration:underline;">https://orcid.org/0009-0003-1328-2430</a>'
            $modified = $true
        }
        
        # 4. Ensure TELADIA link is present (if ts-brand-links exists)
        if ($content -match 'ts-brand-links' -and $content -notmatch 'TELADIA/teladia-portal-redesign\.html') {
            # Add TELADIA link after TELBANK
            if ($content -match '(TELBANK[^<]*</a>)') {
                $teladiaLink = '      <a href="TELADIA/teladia-portal-redesign.html" title="TELADIA Asset Exchange Sphere – Deutsche Bank Integration" style="background: linear-gradient(135deg, rgba(0, 24, 168, 0.3), rgba(0, 234, 255, 0.3)); border: 2px solid #0018a8; color: #00eaff; font-weight: 700; font-size: 1.05rem;">TELADIA</a>'
                $content = $content -replace '(TELBANK[^<]*</a>)', "`$1`n$teladiaLink"
                $modified = $true
            }
        }
        
        if ($modified) {
            # Use UTF-8 encoding to preserve special characters
            [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
            $count++
            Write-Host "  [OK] $($file.Name)" -ForegroundColor Green
        } else {
            Write-Host "  [OK] $($file.Name) (bereits aktualisiert)" -ForegroundColor Gray
        }
    } catch {
        $errors++
        Write-Host "  [FEHLER] $($file.Name): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "DESIGN ROLLOUT COMPLETE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "$count Dateien aktualisiert" -ForegroundColor White
if ($errors -gt 0) {
    Write-Host "$errors Fehler aufgetreten" -ForegroundColor Red
}
Write-Host ""








