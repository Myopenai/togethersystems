# T,. FIX JAVASCRIPT BRACES
# Behebt automatisch ungleiche Klammern in JavaScript-Dateien

$ErrorActionPreference = "Continue"
$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = Get-Location }

Write-Host "T,. FIX JAVASCRIPT BRACES" -ForegroundColor Green
Write-Host ""

$jsFiles = Get-ChildItem -Path $rootDir -Recurse -Filter "*.js" -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch '\\node_modules\\|\\\.git\\|\\ARCHIV\\|\\BACKUP\\'
}

$fixed = 0
$errors = @()

foreach ($file in $jsFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        
        $openBraces = ([regex]::Matches($content, '\{')).Count
        $closeBraces = ([regex]::Matches($content, '\}')).Count
        $openParens = ([regex]::Matches($content, '\(')).Count
        $closeParens = ([regex]::Matches($content, '\)')).Count
        $openBrackets = ([regex]::Matches($content, '\[')).Count
        $closeBrackets = ([regex]::Matches($content, '\]')).Count
        
        $needsFix = $false
        $newContent = $content
        
        # Fix braces
        if ($openBraces -ne $closeBraces) {
            $diff = $openBraces - $closeBraces
            if ($diff > 0) {
                # Fehlende schliessende Klammern
                $newContent = $newContent + ("}" * $diff)
                $needsFix = $true
            } else {
                # Zu viele schliessende Klammern - entferne am Ende
                $newContent = $newContent -replace '\}+$', ''
                $needsFix = $true
            }
        }
        
        # Fix parens
        if ($openParens -ne $closeParens) {
            $diff = $openParens - $closeParens
            if ($diff > 0) {
                $newContent = $newContent + (")" * $diff)
                $needsFix = $true
            } else {
                $newContent = $newContent -replace '\)+$', ''
                $needsFix = $true
            }
        }
        
        # Fix brackets
        if ($openBrackets -ne $closeBrackets) {
            $diff = $openBrackets - $closeBrackets
            if ($diff > 0) {
                $newContent = $newContent + ("]" * $diff)
                $needsFix = $true
            } else {
                $newContent = $newContent -replace '\]+$', ''
                $needsFix = $true
            }
        }
        
        if ($needsFix) {
            # Backup erstellen
            $backup = "$($file.FullName).backup"
            Copy-Item -Path $file.FullName -Destination $backup -Force
            
            # Speichere korrigierte Version
            $newContent | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
            $fixed++
            Write-Host "  [FIX] $($file.Name) - Klammern korrigiert" -ForegroundColor Green
        }
    } catch {
        $errors += "$($file.Name): $_"
    }
}

Write-Host ""
Write-Host "Korrigiert: $fixed Dateien" -ForegroundColor Green
if ($errors.Count -gt 0) {
    Write-Host "Fehler: $($errors.Count)" -ForegroundColor Red
}

Write-Host ""
Write-Host "T,.&T,,.&T,,,.T." -ForegroundColor Cyan

