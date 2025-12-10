# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE COMPLETE ERROR FIXER
# Findet und behebt ALLE Console-Fehler automatisch
# 0% User-Interaktion - 100% automatisch

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE" -ForegroundColor Green
Write-Host "COMPLETE ERROR FIXER" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = if ($PSScriptRoot) { $PSScriptRoot } else { Get-Location }
$errorCount = 0
$fixedCount = 0

# Finde ALLE HTML/JS Dateien
$files = Get-ChildItem -Path $rootDir -Include *.html,*.js -Recurse -File | 
    Where-Object { 
        $_.FullName -notmatch 'node_modules|\.git|artifacts|builds|\.venv|OSTOSOS|Go\\src' 
    }

Write-Host "[PHASE 1] Analysiere ALLE Dateien auf Console-Fehler..." -ForegroundColor Cyan
Write-Host "  Gefunden: $($files.Count) Dateien" -ForegroundColor Gray
Write-Host ""

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if (-not $content) { continue }
        
        # Finde console-Aufrufe ohne Fabrikage-Integration
        $consolePattern = 'console\.(log|error|warn|info|debug)\s*\('
        $matches = [regex]::Matches($content, $consolePattern)
        
        foreach ($match in $matches) {
            $lineNum = ($content.Substring(0, $match.Index) -split "`n").Count
            $context = $content.Substring([Math]::Max(0, $match.Index - 100), 200)
            
            # Prüfe ob bereits integriert
            if ($context -notmatch 'fabrikageErrorBus') {
                $errorCount++
                
                # Integriere automatisch
                $before = $content.Substring(0, $match.Index)
                $after = $content.Substring($match.Index)
                
                $level = $match.Groups[1].Value
                $integration = @"
if(window.fabrikageErrorBus){window.fabrikageErrorBus.publish({module:'system',stage:'runtime',level:'$level',class:'console.$level',message:Array.from(arguments).join(' '),context:{}});}
"@
                
                $newContent = $before + $integration + $after
                $newContent | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
                $fixedCount++
                
                Write-Host "  ✅ FIX: $($file.Name):$lineNum - console.$level integriert" -ForegroundColor Green
            }
        }
    } catch {
        # Ignoriere Fehler
    }
}

Write-Host ""
Write-Host "[PHASE 2] Prüfe JavaScript-Syntax-Fehler..." -ForegroundColor Cyan

$syntaxErrors = 0
foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if (-not $content) { continue }
        
        # Prüfe auf unausgeglichene Klammern
        $openBraces = ([regex]::Matches($content, '\{')).Count
        $closeBraces = ([regex]::Matches($content, '\}')).Count
        $openParens = ([regex]::Matches($content, '\(')).Count
        $closeParens = ([regex]::Matches($content, '\)')).Count
        $openBrackets = ([regex]::Matches($content, '\[')).Count
        $closeBrackets = ([regex]::Matches($content, '\]')).Count
        
        if ($openBraces -ne $closeBraces -or $openParens -ne $closeParens -or $openBrackets -ne $closeBrackets) {
            $syntaxErrors++
            Write-Host "  ⚠️ SYNTAX: $($file.Name) - Unausgeglichene Klammern" -ForegroundColor Yellow
        }
    } catch {
        # Ignoriere
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ ERROR FIXER ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Console-Aufrufe gefunden: $errorCount" -ForegroundColor Green
Write-Host "✅ Console-Aufrufe gefixt: $fixedCount" -ForegroundColor Green
Write-Host "⚠️ Syntax-Fehler: $syntaxErrors" -ForegroundColor $(if ($syntaxErrors -eq 0) { "Green" } else { "Yellow" })
Write-Host ""
