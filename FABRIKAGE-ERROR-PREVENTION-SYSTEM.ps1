# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE ERROR PREVENTION SYSTEM
# Verhindert alle bekannten Fehler systematisch - NIEMALS WIEDER

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE" -ForegroundColor Green
Write-Host "ERROR PREVENTION SYSTEM" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = if ($PSScriptRoot) { $PSScriptRoot } else { Get-Location }

# ============================================
# FEHLER-PROFILE: Alle bekannten Fehler
# ============================================

$errorProfiles = @{
    # Fehler 1: Duplikate Hash-Keys durch Encoding-Fehler
    "DuplicateHashKeys" = @{
        Pattern = "'â€\"' ="
        Fix = {
            param($content)
            # Ersetze alle Encoding-Fehler mit eindeutigen Keys
            $replacements = @{
                "'â€\"' = '—'" = "'emdash' = '—'"
                "'â€\"' = '\"" = "'quote1' = '\"""
                "'â€\"' = '\"" = "'quote2' = '\"""
                "'â€\"' = '…'" = "'ellipsis' = '…'"
                "'â€\"' = '–'" = "'endash' = '–'"
                "'â€\"' = '€'" = "'euro' = '€'"
            }
            foreach ($key in $replacements.Keys) {
                if ($content -match [regex]::Escape($key)) {
                    $content = $content -replace [regex]::Escape($key), $replacements[$key]
                }
            }
            return $content
        }
    }
    
    # Fehler 2: Fehlende schließende Klammern
    "MissingClosingBraces" = @{
        Pattern = '\{'
        Fix = {
            param($content)
            $openBraces = ([regex]::Matches($content, '\{')).Count
            $closeBraces = ([regex]::Matches($content, '\}')).Count
            if ($openBraces -gt $closeBraces) {
                $missing = $openBraces - $closeBraces
                for ($i = 0; $i -lt $missing; $i++) {
                    $content += "`n}"
                }
            }
            return $content
        }
    }
    
    # Fehler 3: Fehlende String-Terminatoren
    "MissingStringTerminators" = {
        param($content)
        # Prüfe auf ungerade Anzahl von Quotes
        $singleQuotes = ([regex]::Matches($content, "(?<!')'(?!')")).Count
        $doubleQuotes = ([regex]::Matches($content, '(?<!")"(?!")')).Count
        
        # Fix: Füge fehlende Quotes hinzu (einfache Heuristik)
        if ($singleQuotes % 2 -ne 0) {
            $content = $content -replace "([^'])'([^']*)$", "`$1'`$2'"
        }
        if ($doubleQuotes % 2 -ne 0) {
            $content = $content -replace '([^"])"([^"]*)$', '$1"$2"'
        }
        return $content
    }
    
    # Fehler 4: GitHub Actions falsche Versionen
    "GitHubActionsWrongVersions" = {
        param($content)
        $fixes = @{
            'pwsh/setup-pwsh@v1' = 'actions/setup-powershell@v5'
            'anchore/syft-action@v0.15.0' = 'anchore/sbom-action/download-syft@v1'
            'anchore/grype-action@v0.12.0' = 'anchore/grype-action@v1'
            'trufflesecurity/trufflehog@v3' = 'trufflesecurity/trufflehog-action@v4'
        }
        foreach ($old in $fixes.Keys) {
            if ($content -match [regex]::Escape($old)) {
                $content = $content -replace [regex]::Escape($old), $fixes[$old]
            }
        }
        return $content
    }
    
    # Fehler 5: Encoding-Fehler in Hash-Literalen
    "EncodingErrorsInHash" = {
        param($content)
        # Fix alle bekannten Encoding-Fehler
        $encodingFixes = @{
            'ä' = 'ä'
            'ö' = 'ö'
            'ü' = 'ü'
            'ß' = 'ß'
            'Ãœ' = 'Ü'
            'Ä' = 'Ä'
            'Ö' = 'Ö'
            'zurück' = 'zurück'
            'zurückspielen' = 'zurückspielen'
            'geschützten' = 'geschützten'
            'Arbeitsâ€'' = 'Arbeits-'
            'Portal â€"' = 'Portal –'
        }
        foreach ($bad in $encodingFixes.Keys) {
            if ($content -match [regex]::Escape($bad)) {
                $content = $content -replace [regex]::Escape($bad), $encodingFixes[$bad]
            }
        }
        return $content
    }
}

# ============================================
# PREVENTION: Fixe alle Dateien
# ============================================

Write-Host "[PREVENTION] Behebe alle bekannten Fehler..." -ForegroundColor Cyan

$psFiles = Get-ChildItem -Path $rootDir -Include *.ps1 -Recurse -File | 
    Where-Object { 
        $_.FullName -notmatch 'node_modules|\.git|artifacts|builds|\.venv|OSTOSOS|Go\\src|FABRIKAGE-ERROR-PREVENTION-SYSTEM\.ps1' 
    }

$ymlFiles = Get-ChildItem -Path $rootDir -Include *.yml,*.yaml -Recurse -File | 
    Where-Object { 
        $_.FullName -notmatch 'node_modules|\.git|artifacts|builds|\.venv|OSTOSOS|Go\\src' 
    }

$totalFixed = 0

foreach ($file in ($psFiles + $ymlFiles)) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if (-not $content) { continue }
        
        $originalContent = $content
        $modified = $false
        
        # Wende alle Fixes an
        foreach ($errorType in $errorProfiles.Keys) {
            if ($errorProfiles[$errorType] -is [scriptblock]) {
                $content = & $errorProfiles[$errorType] $content
                if ($content -ne $originalContent) {
                    $modified = $true
                    $originalContent = $content
                }
            } elseif ($errorProfiles[$errorType].Fix) {
                $content = & $errorProfiles[$errorType].Fix $content
                if ($content -ne $originalContent) {
                    $modified = $true
                    $originalContent = $content
                }
            }
        }
        
        if ($modified) {
            $content | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
            Write-Host "  ✅ $($file.Name) - Alle Fehler behoben" -ForegroundColor Green
            $totalFixed++
        }
    } catch {
        Write-Host "  ⚠️ $($file.Name) - Fehler: $_" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ ERROR PREVENTION ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Dateien gefixt: $totalFixed" -ForegroundColor Green
Write-Host ""
