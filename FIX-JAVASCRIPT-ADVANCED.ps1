# T,. ERWEITERTE JAVASCRIPT-FIX-LOGIK
$ErrorActionPreference = "SilentlyContinue"
$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = Get-Location }

$jsFiles = Get-ChildItem -Path $rootDir -Recurse -Filter "*.js" -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch '\\node_modules\\|\\\.git\\|\\ARCHIV\\|\\BACKUP\\'
}

foreach ($file in $jsFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        $original = $content
        
        # Erweiterte Klammern-Analyse
        $openBraces = ([regex]::Matches($content, '(?<!\\)\{')).Count
        $closeBraces = ([regex]::Matches($content, '(?<!\\)\}')).Count
        $openParens = ([regex]::Matches($content, '(?<!\\)\(')).Count
        $closeParens = ([regex]::Matches($content, '(?<!\\)\)')).Count
        $openBrackets = ([regex]::Matches($content, '(?<!\\)\[')).Count
        $closeBrackets = ([regex]::Matches($content, '(?<!\\)\]')).Count
        
        $fixed = $false
        
        # Fix braces - intelligente Platzierung
        if ($openBraces -gt $closeBraces) {
            $diff = $openBraces - $closeBraces
            # Fuege schliessende Klammern vor letztem Zeilenende hinzu
            if ($content -match '(\n[^\n]*)$') {
                $content = $content -replace '(\n[^\n]*)$', ("}" * $diff) + "`$1"
            } else {
                $content = $content + ("}" * $diff)
            }
            $fixed = $true
        } elseif ($closeBraces -gt $openBraces) {
            $diff = $closeBraces - $openBraces
            # Entferne ueberfluessige schliessende Klammern am Ende
            $content = $content -replace '\}+$', ''
            $fixed = $true
        }
        
        # Fix parens
        if ($openParens -gt $closeParens) {
            $diff = $openParens - $closeParens
            $content = $content + (")" * $diff)
            $fixed = $true
        } elseif ($closeParens -gt $openParens) {
            $diff = $closeParens - $openParens
            $content = $content -replace '\)+$', ''
            $fixed = $true
        }
        
        # Fix brackets
        if ($openBrackets -gt $closeBrackets) {
            $diff = $openBrackets - $closeBrackets
            $content = $content + ("]" * $diff)
            $fixed = $true
        } elseif ($closeBrackets -gt $openBrackets) {
            $diff = $closeBrackets - $openBrackets
            $content = $content -replace '\]+$', ''
            $fixed = $true
        }
        
        if ($fixed -and $content -ne $original) {
            $backup = "$($file.FullName).backup"
            Copy-Item -Path $file.FullName -Destination $backup -Force -ErrorAction SilentlyContinue
            $content | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
        }
    } catch {
        # Ignoriere Fehler
    }
}

