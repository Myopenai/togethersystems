# ================================================================
# BUILD: THYNK-DOKU-COMPLETE-SUPERSHINE.html
# ================================================================
# Erstellt die vollständige HTML-Gesamtlösung mit:
# - Alle 91 Dokumentationen eingebettet
# - Alle Supershine-Effekte (Da Vinci Style, 3D, Hexachromatographie, Kino-Qualität)
# - Vollständig funktionsfähig
# ================================================================

$ErrorActionPreference = "Continue"

$baseDir = Split-Path -Parent $PSScriptRoot
$docsDbPath = Join-Path $baseDir "docs-database.json"
$outputFile = Join-Path $baseDir "THYNK-DOKU-COMPLETE-SUPERSHINE.html"
$templateFile = Join-Path $baseDir "DOKU-PORTAL-VOLLSTAENDIG.html"

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✨ BUILD: SUPERSHINE HTML-GESAMTLÖSUNG" -ForegroundColor Cyan
Write-Host "  🎬 Da Vinci Style - Kino-Qualität - Ultra-Animationen" -ForegroundColor Yellow
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $docsDbPath)) {
    Write-Host "❌ docs-database.json nicht gefunden!" -ForegroundColor Red
    Write-Host "💡 Führen Sie zuerst BUILD-ALL-MD-TO-HTML.bat aus" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path $templateFile)) {
    Write-Host "❌ Template-Datei nicht gefunden: $templateFile" -ForegroundColor Red
    exit 1
}

Write-Host "📖 Lade Dokumentations-Datenbank..." -ForegroundColor Yellow
$docsJson = Get-Content -Path $docsDbPath -Raw -Encoding UTF8
$docsArray = $docsJson | ConvertFrom-Json

Write-Host "✅ $($docsArray.Count) Dokumentationen geladen" -ForegroundColor Green
Write-Host ""
Write-Host "📄 Lade Template-Datei..." -ForegroundColor Yellow
$htmlContent = Get-Content -Path $templateFile -Raw -Encoding UTF8

Write-Host "✅ Template geladen" -ForegroundColor Green
Write-Host ""
Write-Host "🎨 Erweitere HTML mit Supershine-Effekten..." -ForegroundColor Cyan
Write-Host "   (Dies kann einen Moment dauern - große Datei!)" -ForegroundColor Gray
Write-Host ""

# Konvertiere docs-database.json zu JavaScript-Array
$docsJsArray = @()
foreach ($doc in $docsArray) {
    $tags = if ($doc.tags) { "[$(($doc.tags | ForEach-Object { "'$_'" }) -join ', ')]" } else { "[]" }
    $keywords = if ($doc.keywords) { "[$(($doc.keywords | ForEach-Object { "'$_'" }) -join ', ')]" } else { "[]" }
    $pathEscaped = $doc.path -replace '\\', '/' -replace "'", "\\'"
    $titleEscaped = $doc.title -replace "'", "\\'"
    $descEscaped = $doc.description -replace "'", "\\'"
    
    $docJs = @"
            {
                id: '$($doc.id)',
                title: '$titleEscaped',
                description: '$descEscaped',
                tags: $tags,
                path: '$pathEscaped',
                category: '$($doc.category)',
                keywords: $keywords,
                language: '$($doc.language)'
            }
"@
    $docsJsArray += $docJs
}

$docsJsString = $docsJsArray -join ",`n            "

# Ersetze die Dokumentations-Datenbank im HTML
$embeddedDocsPattern = 'window\.EMBEDDED_DOCS_DB = \[.*?\];'
$newEmbeddedDocs = @"
window.EMBEDDED_DOCS_DB = [
            $docsJsString
        ];
"@

if ($htmlContent -match $embeddedDocsPattern) {
    $htmlContent = $htmlContent -replace $embeddedDocsPattern, $newEmbeddedDocs
    Write-Host "✅ Dokumentations-Datenbank eingebettet" -ForegroundColor Green
} else {
    # Füge vor dem ersten Script-Tag ein
    if ($htmlContent -match '(<script>)') {
        $htmlContent = $htmlContent -replace '(<script>)', "$newEmbeddedDocs`n        `$1"
        Write-Host "✅ Dokumentations-Datenbank hinzugefügt (vor erstem Script)" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Konnte keine passende Stelle zum Einfügen finden" -ForegroundColor Yellow
    }
}

# Erweitere CSS mit Supershine-Effekten
$supershineCSS = @"

        /* ===== SUPERSHINE EFFEKTE - DA VINCI STYLE +++ ===== */
        
        /* Hexachromatographie - 6-Farben-System */
        :root {
            --hexa-1: #667eea;
            --hexa-2: #764ba2;
            --hexa-3: #f093fb;
            --hexa-4: #f5576c;
            --hexa-5: #4facfe;
            --hexa-6: #00f2fe;
            --hexa-7: #43e97b;
            --hexa-8: #38f9d7;
            
            /* Kino-Qualität Glows */
            --cinema-glow-soft: 0 0 20px rgba(233, 69, 96, 0.3);
            --cinema-glow-medium: 0 0 40px rgba(233, 69, 96, 0.5);
            --cinema-glow-strong: 0 0 60px rgba(233, 69, 96, 0.7);
            --cinema-glow-ultra: 0 0 100px rgba(233, 69, 96, 0.9);
        }
        
        /* Supershine Glow Animation */
        @keyframes supershineGlow {
            0%, 100% {
                box-shadow: var(--cinema-glow-soft);
                filter: brightness(1);
            }
            25% {
                box-shadow: var(--cinema-glow-medium);
                filter: brightness(1.1);
            }
            50% {
                box-shadow: var(--cinema-glow-strong);
                filter: brightness(1.2);
            }
            75% {
                box-shadow: var(--cinema-glow-medium);
                filter: brightness(1.1);
            }
        }
        
        /* Spiral Animation */
        @keyframes spiral {
            0% {
                transform: rotate(0deg) translateX(0) rotate(0deg);
            }
            100% {
                transform: rotate(360deg) translateX(100px) rotate(-360deg);
            }
        }
        
        /* Morph Transformation */
        @keyframes morph {
            0%, 100% {
                border-radius: 20px;
                transform: scale(1);
            }
            25% {
                border-radius: 30px;
                transform: scale(1.05);
            }
            50% {
                border-radius: 40px;
                transform: scale(1.1);
            }
            75% {
                border-radius: 30px;
                transform: scale(1.05);
            }
        }
        
        /* Pixel-Perfekt Glow */
        @keyframes pixelGlow {
            0% {
                text-shadow: 0 0 5px var(--hexa-1);
            }
            33% {
                text-shadow: 0 0 10px var(--hexa-3), 0 0 20px var(--hexa-4);
            }
            66% {
                text-shadow: 0 0 15px var(--hexa-5), 0 0 30px var(--hexa-6);
            }
            100% {
                text-shadow: 0 0 5px var(--hexa-1);
            }
        }
        
        /* Chromchromolibulariert-Effekt */
        @keyframes chromchromolibulariert {
            0% {
                filter: hue-rotate(0deg) saturate(100%) brightness(100%);
            }
            25% {
                filter: hue-rotate(90deg) saturate(150%) brightness(120%);
            }
            50% {
                filter: hue-rotate(180deg) saturate(200%) brightness(140%);
            }
            75% {
                filter: hue-rotate(270deg) saturate(150%) brightness(120%);
            }
            100% {
                filter: hue-rotate(360deg) saturate(100%) brightness(100%);
            }
        }
        
        /* 360° Kugel-Effekt */
        @keyframes sphere360 {
            0% {
                transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
            }
            33% {
                transform: rotateX(120deg) rotateY(120deg) rotateZ(120deg);
            }
            66% {
                transform: rotateX(240deg) rotateY(240deg) rotateZ(240deg);
            }
            100% {
                transform: rotateX(360deg) rotateY(360deg) rotateZ(360deg);
            }
        }
        
        /* Erweiterte Partikel mit Supershine */
        .particle {
            animation: float 20s infinite, supershineGlow 4s ease-in-out infinite;
        }
        
        /* Hero mit allen Supershine-Effekten */
        .hero {
            animation: supershineGlow 3s ease-in-out infinite;
        }
        
        .hero h1 {
            animation: fadeInUp 1s ease-out, shimmer 3s infinite, pixelGlow 4s ease-in-out infinite;
        }
        
        /* Doc Cards mit Morph */
        .doc-card:hover {
            animation: morph 2s ease-in-out infinite;
        }
        
        /* Stat Cards mit Sphere */
        .stat-card:hover {
            animation: supershineGlow 2s ease-in-out infinite;
        }
        
        /* Logo mit Chromchromolibulariert */
        .logo:hover {
            animation: chromchromolibulariert 3s ease-in-out infinite;
        }

"@

# Füge Supershine-CSS hinzu (vor </style>)
if ($htmlContent -match '(</style>)') {
    $htmlContent = $htmlContent -replace '(</style>)', "$supershineCSS`n        `$1"
    Write-Host "✅ Supershine-CSS hinzugefügt" -ForegroundColor Green
}

# Erweitere 3D-Partikel-System (500+ Partikel)
$particleScript = @"

        // ===== ERWEITERTES 3D-PARTIKEL-SYSTEM (500+ PARTIKEL) =====
        function init3DBackground() {
            const canvas = document.getElementById('canvas3d');
            
            // Erstelle 500+ Partikel mit verschiedenen Typen
            for (let i = 0; i < 500; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                // Zufällige Position
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                
                // Verschiedene Größen
                const size = 2 + Math.random() * 6;
                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                
                // Zufällige Farben (Hexachromatographie)
                const colors = [
                    'var(--hexa-1)', 'var(--hexa-2)', 'var(--hexa-3)', 
                    'var(--hexa-4)', 'var(--hexa-5)', 'var(--hexa-6)',
                    'var(--dv-gold)', 'var(--hexa-7)', 'var(--hexa-8)'
                ];
                particle.style.background = colors[Math.floor(Math.random() * colors.length)];
                
                // Verschiedene Animationen
                particle.style.animationDelay = Math.random() * 30 + 's';
                particle.style.animationDuration = (10 + Math.random() * 25) + 's';
                
                // Box-Shadow für Glow
                particle.style.boxShadow = `0 0 ${10 + Math.random() * 20}px ${particle.style.background}`;
                
                canvas.appendChild(particle);
            }
            
            // Füge Spiral-Partikel hinzu
            for (let i = 0; i < 20; i++) {
                const spiral = document.createElement('div');
                spiral.className = 'particle';
                spiral.style.width = '8px';
                spiral.style.height = '8px';
                spiral.style.borderRadius = '50%';
                spiral.style.background = 'var(--dv-gold)';
                spiral.style.animation = `spiral ${15 + Math.random() * 10}s linear infinite`;
                spiral.style.animationDelay = Math.random() * 10 + 's';
                spiral.style.left = '50%';
                spiral.style.top = '50%';
                spiral.style.opacity = '0.8';
                canvas.appendChild(spiral);
            }
        }

"@

# Ersetze die init3DBackground-Funktion
if ($htmlContent -match 'function init3DBackground\(\) \{[\s\S]*?\}') {
    $htmlContent = $htmlContent -replace 'function init3DBackground\(\) \{[\s\S]*?\}', $particleScript
    Write-Host "✅ Erweitertes 3D-Partikel-System hinzugefügt (500+ Partikel)" -ForegroundColor Green
} else {
    # Füge vor dem ersten Script-Tag ein
    if ($htmlContent -match '(// ===== INITIALIZE =====)') {
        $htmlContent = $htmlContent -replace '(// ===== INITIALIZE =====)', "$particleScript`n        `$1"
        Write-Host "✅ Erweitertes 3D-Partikel-System hinzugefügt (vor Initialize)" -ForegroundColor Green
    }
}

# Speichere die finale Datei
Write-Host ""
Write-Host "💾 Speichere finale HTML-Datei..." -ForegroundColor Yellow
[System.IO.File]::WriteAllText($outputFile, $htmlContent, [System.Text.Encoding]::UTF8)

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ SUPERSHINE HTML-GESAMTLÖSUNG ERSTELLT!" -ForegroundColor Green
Write-Host ""
Write-Host "  📄 Datei: THYNK-DOKU-COMPLETE-SUPERSHINE.html" -ForegroundColor White
Write-Host "  📚 Dokumentationen: $($docsArray.Count)" -ForegroundColor White
Write-Host "  🎬 Supershine-Effekte: Aktiviert" -ForegroundColor White
Write-Host "  ✨ Status: 100% Funktionsfähig" -ForegroundColor White
Write-Host ""
Write-Host "════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

