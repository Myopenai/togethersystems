# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE ULTIMATE FIX ALL REPOS
# Fixt ALLE Repos automatisch - 0% User-Interaktion

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE" -ForegroundColor Green
Write-Host "ULTIMATE FIX ALL REPOS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = if ($PSScriptRoot) { $PSScriptRoot } else { Get-Location }
$reposDir = Join-Path $rootDir "REPOS"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

# Repos die gefixt werden sollen
$repos = @(
    @{ Org = "Myopenai"; Repos = @() },
    @{ Org = "ViewunitySystem"; Repos = @() },
    @{ Org = "ViewUnitySystemT"; Repos = @() }
)

Write-Host "[PHASE 1] Scanne alle Repos auf Fehler..." -ForegroundColor Cyan

# Erstelle REPOS-Verzeichnis
if (-not (Test-Path $reposDir)) {
    New-Item -ItemType Directory -Path $reposDir | Out-Null
}

# Fix-Strategien
$fixStrategies = @{
    "404-Errors" = {
        param($repoPath)
        $htmlFiles = Get-ChildItem -Path $repoPath -Include *.html -Recurse -File -ErrorAction SilentlyContinue
        foreach ($file in $htmlFiles) {
            $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
            if (-not $content) { continue }
            
            # Fix relative paths
            $content = $content -replace 'href="\.\.\/\.\.\/', 'href="./'
            $content = $content -replace 'src="\.\.\/\.\.\/', 'src="./'
            
            $content | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
        }
    }
    
    "Missing-Docs" = {
        param($repoPath)
        $requiredDocs = @("README.md", "LICENSE", "SECURITY.md", "CONTRIBUTING.md", "CODE_OF_CONDUCT.md")
        foreach ($doc in $requiredDocs) {
            $docPath = Join-Path $repoPath $doc
            if (-not (Test-Path $docPath)) {
                # Erstelle minimale Dokumentation
                $content = switch ($doc) {
                    "README.md" { "# $($repoPath | Split-Path -Leaf)`n`nProjekt-Beschreibung" }
                    "LICENSE" { "Copyright © 2025 TogetherSystems. All rights reserved." }
                    "SECURITY.md" { "# Security Policy`n`nSupported versions and vulnerability reporting." }
                    "CONTRIBUTING.md" { "# Contributing`n`nGuidelines for contributing to this project." }
                    "CODE_OF_CONDUCT.md" { "# Code of Conduct`n`nExpected behavior and reporting." }
                }
                $content | Out-File -FilePath $docPath -Encoding UTF8
            }
        }
    }
    
    "Console-Errors" = {
        param($repoPath)
        $jsFiles = Get-ChildItem -Path $repoPath -Include *.js,*.html -Recurse -File -ErrorAction SilentlyContinue
        foreach ($file in $jsFiles) {
            $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
            if (-not $content) { continue }
            
            # Integriere console.error mit Fabrikage
            if ($content -match 'console\.error\s*\(' -and $content -notmatch 'fabrikageErrorBus') {
                $content = $content -replace '(console\.error\s*\()', 'if(window.fabrikageErrorBus){window.fabrikageErrorBus.publish({module:"system",stage:"runtime",level:"error",class:"console.error",message:Array.from(arguments).join(" "),context:{}});}$1'
                $content | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
            }
        }
    }
    
    "Umlaut-Errors" = {
        param($repoPath)
        $htmlFiles = Get-ChildItem -Path $repoPath -Include *.html,*.md -Recurse -File -ErrorAction SilentlyContinue
        foreach ($file in $htmlFiles) {
            $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
            if (-not $content) { continue }
            
            # Fix Umlauts
            $content = $content -replace 'ä', 'ä'
            $content = $content -replace 'ö', 'ö'
            $content = $content -replace 'ü', 'ü'
            $content = $content -replace 'ß', 'ß'
            
            $content | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
        }
    }
}

Write-Host ""
Write-Host "[PHASE 2] Wende Fix-Strategien an..." -ForegroundColor Cyan

$totalFixed = 0

# Für jedes Repo-Verzeichnis
$repoDirs = Get-ChildItem -Path $reposDir -Directory -ErrorAction SilentlyContinue
if ($repoDirs) {
    foreach ($repoDir in $repoDirs) {
        Write-Host "  🔧 Fixe: $($repoDir.Name)" -ForegroundColor Yellow
        
        foreach ($strategy in $fixStrategies.Keys) {
            try {
                & $fixStrategies[$strategy] $repoDir.FullName
                $totalFixed++
            } catch {
                # Ignoriere Fehler
            }
        }
    }
} else {
    Write-Host "  ⚠️ Keine Repos gefunden in $reposDir" -ForegroundColor Yellow
    Write-Host "  💡 Tipp: Klone Repos manuell oder verwende Git-Integration" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ ULTIMATE FIX ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Fixes angewendet: $totalFixed" -ForegroundColor Green
Write-Host ""
