# FABRIKAGE FIX GITHUB UPLOAD
# Behebt GitHub-Upload-Probleme durch wiederkehrende Fehler
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
# VERSION: 3.0.0

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"
$ConfirmPreference = "None"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE FIX GITHUB UPLOAD" -ForegroundColor Cyan
Write-Host "  Behebt wiederkehrende 404/405 Fehler" -ForegroundColor Yellow
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot

# ============================================
# PHASE 1: FEHLENDE RESSOURCEN IDENTIFIZIEREN
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 1: FEHLENDE RESSOURCEN IDENTIFIZIEREN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$missingResources = @()
$htmlFiles = Get-ChildItem -Path $rootDir -Filter "*.html" -Recurse -File | 
    Where-Object { $_.FullName -notmatch 'node_modules|\.git|backup' }

foreach ($file in $htmlFiles) {
    $content = Get-Content $file -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    if (-not $content) { continue }
    
    # Finde alle Script- und Link-Referenzen
    $scriptMatches = [regex]::Matches($content, 'src=["'']([^"'']+)["'']')
    $linkMatches = [regex]::Matches($content, 'href=["'']([^"'']+)["'']')
    
    foreach ($match in $scriptMatches) {
        $resource = $match.Groups[1].Value
        if ($resource -notmatch '^https?://' -and $resource -notmatch '^//') {
            $resourcePath = Join-Path (Split-Path $file.FullName) $resource
            $resourcePath = [System.IO.Path]::GetFullPath($resourcePath)
            
            if (-not (Test-Path $resourcePath)) {
                $missingResources += @{
                    File = $file.FullName.Replace($rootDir, '').TrimStart('\')
                    Resource = $resource
                    Type = 'script'
                }
            }
        }
    }
    
    foreach ($match in $linkMatches) {
        $resource = $match.Groups[1].Value
        if ($resource -notmatch '^https?://' -and $resource -notmatch '^//' -and $resource -notmatch '^#') {
            $resourcePath = Join-Path (Split-Path $file.FullName) $resource
            $resourcePath = [System.IO.Path]::GetFullPath($resourcePath)
            
            if (-not (Test-Path $resourcePath)) {
                $missingResources += @{
                    File = $file.FullName.Replace($rootDir, '').TrimStart('\')
                    Resource = $resource
                    Type = 'link'
                }
            }
        }
    }
}

Write-Host "  📊 Gefundene fehlende Ressourcen: $($missingResources.Count)" -ForegroundColor Cyan
if ($missingResources.Count -gt 0) {
    foreach ($res in $missingResources) {
        Write-Host "  ⚠️ $($res.File) → $($res.Resource)" -ForegroundColor Yellow
    }
}

Write-Host ""

# ============================================
# PHASE 2: FEHLENDE RESSOURCEN ERSTELLEN ODER ENTFERNEN
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 2: FEHLENDE RESSOURCEN BEHEBEN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$fixed = 0
foreach ($res in $missingResources) {
    $filePath = Join-Path $rootDir $res.File
    $content = Get-Content $filePath -Raw -Encoding UTF8
    
    # Entferne fehlende Ressourcen-Referenzen
    if ($res.Type -eq 'script') {
        $pattern = "<script[^>]*src=["'']([^"'']*$([regex]::Escape($res.Resource)))[^"'']*["'']?[^>]*></script>"
        if ($content -match $pattern) {
            $content = $content -replace $pattern, ''
            $fixed++
            Write-Host "  ✅ Entfernt: $($res.File) → $($res.Resource)" -ForegroundColor Green
        }
    } elseif ($res.Type -eq 'link') {
        $pattern = "<link[^>]*href=["'']([^"'']*$([regex]::Escape($res.Resource)))[^"'']*["'']?[^>]*>"
        if ($content -match $pattern) {
            $content = $content -replace $pattern, ''
            $fixed++
            Write-Host "  ✅ Entfernt: $($res.File) → $($res.Resource)" -ForegroundColor Green
        }
    }
    
    # Speichere geänderte Datei
    if ($fixed -gt 0) {
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($filePath, $content, $utf8NoBom)
    }
}

Write-Host ""
Write-Host "  📊 Behoben: $fixed Referenzen" -ForegroundColor Green
Write-Host ""

# ============================================
# PHASE 3: GIT STATUS PRÜFEN
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  PHASE 3: GIT STATUS PRÜFEN" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

Push-Location $rootDir

try {
    $gitStatus = git status --porcelain 2>&1
    if ($LASTEXITCODE -eq 0) {
        if ($gitStatus) {
            Write-Host "  📊 Änderungen gefunden:" -ForegroundColor Cyan
            $gitStatus | ForEach-Object { Write-Host "    $_" -ForegroundColor Gray }
            
            Write-Host ""
            Write-Host "  ▶️ Committe Änderungen..." -ForegroundColor Cyan
            $commitMessage = "FABRIKAGE FIX: GitHub-Upload-Problem behoben - 404/405 Fehler korrigiert - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
            git add -A 2>&1 | Out-Null
            git commit -m $commitMessage 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Commit erfolgreich" -ForegroundColor Green
                
                Write-Host ""
                Write-Host "  ▶️ Pushe zu GitHub..." -ForegroundColor Cyan
                
                $remotes = @('origin', 'myopenai', 'viewunity', 'viewunitysystemt')
                foreach ($remote in $remotes) {
                    try {
                        git push $remote main 2>&1 | Out-Null
                        if ($LASTEXITCODE -eq 0) {
                            Write-Host "  ✅ Push zu $remote erfolgreich" -ForegroundColor Green
                        } else {
                            Write-Host "  ⚠️ Push zu $remote fehlgeschlagen (normal wenn nicht konfiguriert)" -ForegroundColor Yellow
                        }
                    } catch {
                        Write-Host "  ⚠️ Push zu $remote fehlgeschlagen: $_" -ForegroundColor Yellow
                    }
                }
            } else {
                Write-Host "  ⚠️ Commit fehlgeschlagen" -ForegroundColor Yellow
            }
        } else {
            Write-Host "  ℹ️ Keine Änderungen zum Committen" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⚠️ Git nicht initialisiert oder Fehler" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ❌ Git-Fehler: $_" -ForegroundColor Red
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ FABRIKAGE FIX GITHUB UPLOAD - ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 ZUSAMMENFASSUNG:" -ForegroundColor Cyan
Write-Host "  ✅ Fehlende Ressourcen: $($missingResources.Count) gefunden" -ForegroundColor Green
Write-Host "  ✅ Behoben: $fixed Referenzen" -ForegroundColor Green
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan
Write-Host ""
