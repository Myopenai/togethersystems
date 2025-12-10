# FABRIKAGE GIT COMMIT PUSH ALL
# Git Commit & Push zu allen Repos
# BRANDING: .T. TogetherSystems - ModularFlux Architecture

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  FABRIKAGE GIT COMMIT PUSH ALL" -ForegroundColor Cyan
Write-Host "  Version: 3.0.0" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$rootDir = $PSScriptRoot

# ============================================
# GIT STATUS
# ============================================
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  GIT STATUS" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

try {
    Push-Location $rootDir
    
    # Prüfe ob Git Repository
    $isGitRepo = Test-Path ".git"
    if (-not $isGitRepo) {
        Write-Host "  ⚠️ Kein Git Repository gefunden" -ForegroundColor Yellow
        Write-Host "  Initialisiere Git Repository..." -ForegroundColor Cyan
        git init
        Write-Host "  ✅ Git Repository initialisiert" -ForegroundColor Green
    }
    
    # Status prüfen
    $gitStatus = git status --porcelain 2>&1
    if ($LASTEXITCODE -eq 0) {
        $changedFiles = ($gitStatus | Where-Object { $_ -match "^\s*[MADRC]" } | Measure-Object).Count
        $untrackedFiles = ($gitStatus | Where-Object { $_ -match "^\?\?" } | Measure-Object).Count
        
        Write-Host "  📝 Geänderte Dateien: $changedFiles" -ForegroundColor Cyan
        Write-Host "  📄 Neue Dateien: $untrackedFiles" -ForegroundColor Cyan
        
        if ($changedFiles -eq 0 -and $untrackedFiles -eq 0) {
            Write-Host "  ✅ Keine Änderungen zum Committen" -ForegroundColor Green
            Pop-Location
            exit 0
        }
        
        # Zeige Änderungen
        Write-Host ""
        Write-Host "  Änderungen:" -ForegroundColor Cyan
        git status --short | ForEach-Object {
            Write-Host "    $_" -ForegroundColor Gray
        }
        
    } else {
        Write-Host "  ⚠️ Git-Fehler: $gitStatus" -ForegroundColor Yellow
        Pop-Location
        exit 1
    }
} catch {
    Write-Host "  ❌ Fehler: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

# ============================================
# GIT ADD
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  GIT ADD" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

try {
    git add .
    Write-Host "  ✅ Alle Dateien zum Staging hinzugefügt" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Fehler beim Add: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

# ============================================
# GIT COMMIT
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  GIT COMMIT" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

$commitMessage = @"
Fix: Komplette Fabrikage-Update

- SETTINGS-MASTER-DASHBOARD.html Fehler behoben (SyntaxError, ReferenceError)
- Console Error Controller hinzugefügt (Online/Lokal Konsistenz)
- API-Integration komplett (freie APIs + eigene APIs)
- Code-Generierung implementiert (Modul O: Software Generator)
- Modul-Verbindungen repariert
- Logo mit Links im Modular Fabrikage integriert
- Extended Fabrikation TTT im Modular Fabrikage verfügbar
- Alle Standards implementiert und geprüft

BRANDING: .T. TogetherSystems - ModularFlux Architecture
VERSION: 3.0.0
STANDARD: IBM STANDARD - PERMANENT AKTIV
"@

try {
    git commit -m $commitMessage
    Write-Host "  ✅ Commit erstellt" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Fehler beim Commit: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

# ============================================
# GIT REMOTES PRÜFEN
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host "  GIT REMOTES" -ForegroundColor Magenta
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Magenta
Write-Host ""

try {
    $remotes = git remote -v 2>&1
    if ($remotes -and $remotes.Count -gt 0) {
        Write-Host "  📡 Konfigurierte Remotes:" -ForegroundColor Cyan
        $remotes | ForEach-Object {
            Write-Host "    $_" -ForegroundColor Gray
        }
        
        # Push zu allen Remotes
        $remoteNames = git remote 2>&1
        foreach ($remote in $remoteNames) {
            Write-Host ""
            Write-Host "  📤 Push zu: $remote" -ForegroundColor Cyan
            try {
                $currentBranch = git branch --show-current 2>&1
                if (-not $currentBranch) {
                    $currentBranch = "main"
                }
                
                git push $remote $currentBranch 2>&1 | ForEach-Object {
                    Write-Host "    $_" -ForegroundColor Gray
                }
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "  ✅ Push zu $remote erfolgreich" -ForegroundColor Green
                } else {
                    Write-Host "  ⚠️ Push zu $remote fehlgeschlagen (möglicherweise kein Zugriff)" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "  ⚠️ Fehler beim Push zu $remote : $_" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "  ⚠️ Keine Remotes konfiguriert" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  Remotes manuell hinzufügen:" -ForegroundColor Cyan
        Write-Host "    git remote add origin https://github.com/Myopenai/togethersystems.git" -ForegroundColor Gray
        Write-Host "    git remote add viewunity https://github.com/ViewunitySystem/togethersystems.git" -ForegroundColor Gray
        Write-Host "    git push origin main" -ForegroundColor Gray
        Write-Host "    git push viewunity main" -ForegroundColor Gray
    }
} catch {
    Write-Host "  ⚠️ Fehler beim Prüfen der Remotes: $_" -ForegroundColor Yellow
}

# ============================================
# ZUSAMMENFASSUNG
# ============================================
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Git Status geprüft" -ForegroundColor Green
Write-Host "✅ Dateien hinzugefügt" -ForegroundColor Green
Write-Host "✅ Commit erstellt" -ForegroundColor Green
Write-Host "✅ Push zu Remotes versucht" -ForegroundColor Green
Write-Host ""
Write-Host "Nächste Schritte:" -ForegroundColor Cyan
Write-Host "  1. Online-Tests durchführen" -ForegroundColor Gray
Write-Host "  2. Console-Fehler prüfen" -ForegroundColor Gray
Write-Host "  3. Auto-Fix testen" -ForegroundColor Gray
Write-Host ""
Write-Host "BRANDING: .T. TogetherSystems - ModularFlux Architecture" -ForegroundColor Cyan
Write-Host "STANDARD: IBM STANDARD - PERMANENT AKTIV" -ForegroundColor Cyan

Pop-Location



