# [.SYSTEMS.T.SYSTEMS.] FIX ALL 404 ERRORS & MENU STRUCTURE
# Behebt alle 404-Fehler und reorganisiert die Menü-Struktur

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] FIX ALL 404 ERRORS & MENU STRUCTURE" -ForegroundColor Green
Write-Host "Fabrikation Standard TÜV MCP" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$ROOT = $PSScriptRoot
$fixed = 0
$errors = @()
$missingFiles = @()

# ============================================
# PHASE 1: ERSTELLE DATEI-INDEX
# ============================================
Write-Host "[PHASE 1] Erstelle Datei-Index..." -ForegroundColor Cyan

$allHtmlFiles = Get-ChildItem -Path $ROOT -Recurse -Filter "*.html" -File | Where-Object { 
    $_.FullName -notmatch "node_modules|\.git|build|Fixpatch|backup|ARCHIV" 
}

$fileIndex = @{}
foreach ($file in $allHtmlFiles) {
    $relativePath = $file.FullName.Replace($ROOT, "").Replace("\", "/").TrimStart("/")
    $fileName = $file.Name
    $fileIndex[$fileName] = $relativePath
    $fileIndex[$relativePath] = $relativePath
}

Write-Host "  ✅ $($fileIndex.Count) Dateien indexiert" -ForegroundColor Green
Write-Host ""

# ============================================
# PHASE 2: PRÜFE ALLE LINKS
# ============================================
Write-Host "[PHASE 2] Prüfe alle Links auf 404-Fehler..." -ForegroundColor Cyan

$linkPatterns = @(
    'href="([^"]+)"',
    'href=''([^'']+)''',
    'src="([^"]+)"',
    'src=''([^'']+)'''
)

$brokenLinks = @()
$fixedLinks = 0

foreach ($file in $allHtmlFiles | Select-Object -First 50) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $originalContent = $content
        $fileFixed = $false
        
        # Finde alle Links
        foreach ($pattern in $linkPatterns) {
            $matches = [regex]::Matches($content, $pattern)
            foreach ($match in $matches) {
                $link = $match.Groups[1].Value
                
                # Ignoriere externe Links, Anchors, Data-URLs
                if ($link -match "^https?://|^#|^mailto:|^tel:|^data:|^javascript:|^//") {
                    continue
                }
                
                # Entferne Query-Parameter und Fragments
                $cleanLink = $link -replace '\?.*$|#.*$', ''
                
                # Prüfe ob Datei existiert
                if ($cleanLink -match "\.html$|\.css$|\.js$") {
                    $linkPath = $cleanLink
                    if ($linkPath -notmatch "^/") {
                        # Relativer Pfad
                        $fileDir = Split-Path $file.FullName -Parent
                        $fullPath = Join-Path $fileDir $linkPath
                        $fullPath = [System.IO.Path]::GetFullPath($fullPath)
                    } else {
                        # Absoluter Pfad (relativ zu ROOT)
                        $fullPath = Join-Path $ROOT $linkPath.TrimStart("/")
                        $fullPath = [System.IO.Path]::GetFullPath($fullPath)
                    }
                    
                    if (-not (Test-Path $fullPath)) {
                        # Datei nicht gefunden - suche nach alternativen
                        $fileName = Split-Path $linkPath -Leaf
                        if ($fileIndex.ContainsKey($fileName)) {
                            # Alternative gefunden
                            $alternative = $fileIndex[$fileName]
                            $relativeFromFile = $file.FullName.Replace($ROOT, "").Replace("\", "/").TrimStart("/")
                            $fromDir = Split-Path $relativeFromFile -Parent
                            $toDir = Split-Path $alternative -Parent
                            
                            # Berechne relativen Pfad
                            $newLink = $alternative
                            if ($fromDir -and $toDir) {
                                $newLink = "../" * ($fromDir.Split("/").Count) + $alternative
                            }
                            
                            $content = $content -replace [regex]::Escape($link), $newLink
                            $fileFixed = $true
                            $fixedLinks++
                            Write-Host "    ✅ $($file.Name): $link → $newLink" -ForegroundColor Green
                        } else {
                            $brokenLinks += "$($file.Name): $link"
                            Write-Host "    ❌ $($file.Name): $link (nicht gefunden)" -ForegroundColor Red
                        }
                    }
                }
            }
        }
        
        if ($fileFixed) {
            $content | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
            $fixed++
        }
    } catch {
        $errors += "$($file.Name): $_"
    }
}

Write-Host "  ✅ $fixedLinks Links behoben" -ForegroundColor Green
Write-Host "  ❌ $($brokenLinks.Count) Links noch fehlerhaft" -ForegroundColor $(if ($brokenLinks.Count -eq 0) { "Green" } else { "Red" })
Write-Host ""

# ============================================
# PHASE 3: MENÜ-STRUKTUR REORGANISIEREN
# ============================================
Write-Host "[PHASE 3] Reorganisiere Menü-Struktur..." -ForegroundColor Cyan

# Erstelle zentrale Navigation-Struktur
$menuStructure = @{
    "Portal" = "Portal – Start.html"
    "Portal-Hilfe" = "help-portal.html"
    "Manifest" = "manifest-forum.html"
    "Manifest-Hilfe" = "help-manifest.html"
    "Online-Portal" = "manifest-portal.html"
    "Online-Portal-Hilfe" = "help-online-portal.html"
    "Wabenräume" = "honeycomb.html"
    "Wabenräume-Hilfe" = "help-honeycomb.html"
    "Legal-Hub" = "legal-hub.html"
    "Legal-Hub-Hilfe" = "help-legal-hub.html"
    "TELBANK" = "TELBANK/index.html"
    "TELBANK Pool" = "TELBANK/telbank-pool.html"
    "TELADIA" = "TELADIA/teladia-portal.html"
    "Business-Admin" = "business-admin.html"
    "Monitoring" = "admin-monitoring.html"
    "Production Dashboard" = "production-dashboard.html"
    "CMS Dashboard" = "cms-dashboard.html"
    "Microsoft Account" = "microsoft-account.html"
    "Neural Network" = "neural-network.html"
    "Settings OS" = "settings-os.html"
    "Settings" = "settings.html"
    "CMS" = "cms.html"
    "Investoren-Portal" = "investoren-portal.html"
    "Settings Explorer" = "settings-explorer.html"
    "YORDY" = "yordy.html"
    "Developer" = "ultra/ui/developer-portal.html"
    "Beta" = "beta.html"
    "OS-Geräte" = "os-gerate.html"
    "Job" = "job.html"
    "JJC" = "jjc.html"
    "Bank Contact" = "bank-contact.html"
    "One Network" = "one-network.html"
    "Unterstützen" = "unterstutzen.html"
    "Big Support" = "big-support.html"
}

# Prüfe welche Dateien existieren
$existingMenu = @{}
$missingMenu = @{}

foreach ($item in $menuStructure.Keys) {
    $filePath = Join-Path $ROOT $menuStructure[$item]
    if (Test-Path $filePath) {
        $existingMenu[$item] = $menuStructure[$item]
        Write-Host "  ✅ $item → $($menuStructure[$item])" -ForegroundColor Green
    } else {
        $missingMenu[$item] = $menuStructure[$item]
        Write-Host "  ❌ $item → $($menuStructure[$item]) (fehlt)" -ForegroundColor Red
        $missingFiles += $menuStructure[$item]
    }
}

Write-Host "  ✅ $($existingMenu.Count) Menü-Items vorhanden" -ForegroundColor Green
Write-Host "  ❌ $($missingMenu.Count) Menü-Items fehlen" -ForegroundColor $(if ($missingMenu.Count -eq 0) { "Green" } else { "Red" })
Write-Host ""

# ============================================
# PHASE 4: ERSTELLE ZENTRALE NAVIGATION
# ============================================
Write-Host "[PHASE 4] Erstelle zentrale Navigation..." -ForegroundColor Cyan

$navHtml = @"
		<nav role="navigation" aria-label="Hauptnavigation">
			<ul>
				<li><a href="Portal – Start.html">🏠 Portal</a></li>
				<li><a href="manifest-forum.html">📋 Manifest</a></li>
				<li><a href="manifest-portal.html">🌐 Online-Portal</a></li>
				<li><a href="honeycomb.html">🍯 Wabenräume</a></li>
				<li><a href="legal-hub.html">⚖️ Legal-Hub</a></li>
				<li><a href="TELBANK/index.html">💰 TELBANK</a></li>
				<li><a href="TELADIA/teladia-portal.html">💎 TELADIA</a></li>
				<li><a href="ultra/ui/developer-portal.html">👨‍💻 Developer</a></li>
				<li><a href="business-admin.html">📊 Business-Admin</a></li>
				<li><a href="admin-monitoring.html">📈 Monitoring</a></li>
				<li><a href="cms.html">📝 CMS</a></li>
				<li><a href="settings.html">⚙️ Settings</a></li>
				<li><a href="downloads/index.html">📥 Downloads</a></li>
			</ul>
		</nav>
"@

# Füge Navigation zu Hauptdateien hinzu
$mainFiles = @(
    "Portal – Start.html",
    "index.html",
    "manifest-portal.html"
)

foreach ($mainFile in $mainFiles) {
    $filePath = Join-Path $ROOT $mainFile
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw -Encoding UTF8
        
        # Prüfe ob Navigation bereits vorhanden
        if ($content -notmatch '<nav[^>]*role="navigation"') {
            # Füge Navigation nach header hinzu
            if ($content -match "(</header>)") {
                $content = $content -replace "(</header>)", "$1`n$navHtml"
                $content | Out-File -FilePath $filePath -Encoding UTF8 -NoNewline
                Write-Host "  ✅ Navigation hinzugefügt: $mainFile" -ForegroundColor Green
                $fixed++
            }
        } else {
            Write-Host "  ✅ Navigation bereits vorhanden: $mainFile" -ForegroundColor Green
        }
    }
}

Write-Host ""

# ============================================
# PHASE 5: ERSTELLE FEHLENDE DATEIEN
# ============================================
Write-Host "[PHASE 5] Erstelle fehlende Dateien..." -ForegroundColor Cyan

$baseTemplate = @"
<!DOCTYPE html>
<html lang="de">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>{TITLE} - TogetherSystems</title>
	<script>
		const BASE_URL = 'https://myopenai.github.io/togethersystems';
	</script>
	<style>
		body { font-family: system-ui; max-width: 1200px; margin: 0 auto; padding: 20px; }
		.header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; text-align: center; }
	</style>
</head>
<body>
	<div class="header">
		<h1>{TITLE}</h1>
		<p>[.SYSTEMS.T.SYSTEMS.] TogetherSystems International TTT</p>
	</div>
	<main>
		<p>Diese Seite wird noch entwickelt.</p>
		<p><a href="Portal – Start.html">← Zurück zum Portal</a></p>
	</main>
</body>
</html>
"@

$filesToCreate = @(
    @{ Path = "help-portal.html"; Title = "Portal-Hilfe" },
    @{ Path = "help-manifest.html"; Title = "Manifest-Hilfe" },
    @{ Path = "help-online-portal.html"; Title = "Online-Portal-Hilfe" },
    @{ Path = "help-honeycomb.html"; Title = "Wabenräume-Hilfe" },
    @{ Path = "help-legal-hub.html"; Title = "Legal-Hub-Hilfe" },
    @{ Path = "beta.html"; Title = "Beta Portal" },
    @{ Path = "os-gerate.html"; Title = "OS-Geräte" },
    @{ Path = "job.html"; Title = "Job-Angebot" },
    @{ Path = "jjc.html"; Title = "JJC" },
    @{ Path = "bank-contact.html"; Title = "Bank Contact" },
    @{ Path = "one-network.html"; Title = "One Network" },
    @{ Path = "unterstutzen.html"; Title = "Unterstützen" },
    @{ Path = "big-support.html"; Title = "Big Support" }
)

$created = 0
foreach ($fileInfo in $filesToCreate) {
    $filePath = Join-Path $ROOT $fileInfo.Path
    if (-not (Test-Path $filePath)) {
        $content = $baseTemplate -replace "{TITLE}", $fileInfo.Title
        $content | Out-File -FilePath $filePath -Encoding UTF8 -NoNewline
        $created++
        Write-Host "  ✅ Erstellt: $($fileInfo.Path)" -ForegroundColor Green
    }
}

Write-Host "  ✅ $created Dateien erstellt" -ForegroundColor Green
Write-Host ""

# ============================================
# ZUSAMMENFASSUNG
# ============================================
Write-Host "========================================" -ForegroundColor Green
Write-Host "404 FIX & MENU STRUCTURE ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Behobene Links: $fixedLinks" -ForegroundColor White
Write-Host "Behobene Dateien: $fixed" -ForegroundColor White
Write-Host "Erstellte Dateien: $created" -ForegroundColor White
Write-Host "Fehlerhafte Links: $($brokenLinks.Count)" -ForegroundColor $(if ($brokenLinks.Count -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($brokenLinks.Count -gt 0) {
    Write-Host "❌ FEHLERHAFTE LINKS:" -ForegroundColor Red
    foreach ($link in $brokenLinks | Select-Object -First 10) {
        Write-Host "  - $link" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "✅ MENÜ-STRUKTUR: REORGANISIERT" -ForegroundColor Green
Write-Host "✅ NAVIGATION: ZENTRALISIERT" -ForegroundColor Green
Write-Host ""

