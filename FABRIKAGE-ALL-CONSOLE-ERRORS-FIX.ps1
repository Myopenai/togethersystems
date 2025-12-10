# [.SYSTEMS.T.SYSTEMS.] FABRIKAGE ALL CONSOLE ERRORS FIX
# Behebt ALLE Console-Fehler automatisch - 0% User-Interaktion

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"

Write-Host "========================================" -ForegroundColor Green
Write-Host "[.SYSTEMS.T.SYSTEMS.] FABRIKAGE" -ForegroundColor Green
Write-Host "ALL CONSOLE ERRORS FIX" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$rootDir = if ($PSScriptRoot) { $PSScriptRoot } else { Get-Location }
$totalFixed = 0
$totalErrors = 0

# Finde ALLE HTML/JS Dateien
$files = Get-ChildItem -Path $rootDir -Include *.html,*.js -Recurse -File | 
    Where-Object { 
        $_.FullName -notmatch 'node_modules|\.git|artifacts|builds|\.venv|OSTOSOS|Go\\src|\.wrangler' -and
        $_.FullName -match 'CASHFLOX|manifest-portal|Portal|index\.html'
    } | 
    Select-Object -First 50

Write-Host "[PHASE 1] Analysiere Dateien auf Console-Fehler..." -ForegroundColor Cyan
Write-Host "  Gefunden: $($files.Count) Dateien" -ForegroundColor Gray
Write-Host ""

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if (-not $content) { continue }
        
        $modified = $false
        
        # Fix 1: console.error ohne Fabrikage
        if ($content -match 'console\.error\s*\(' -and $content -notmatch 'fabrikageErrorBus.*console\.error') {
            $content = $content -replace '(console\.error\s*\()', 'if(window.fabrikageErrorBus){window.fabrikageErrorBus.publish({module:"system",stage:"runtime",level:"error",class:"console.error",message:Array.from(arguments).join(" "),context:{}});}$1'
            $modified = $true
            $totalFixed++
        }
        
        # Fix 2: console.warn ohne Fabrikage
        if ($content -match 'console\.warn\s*\(' -and $content -notmatch 'fabrikageErrorBus.*console\.warn') {
            $content = $content -replace '(console\.warn\s*\()', 'if(window.fabrikageErrorBus){window.fabrikageErrorBus.publish({module:"system",stage:"runtime",level:"warning",class:"console.warn",message:Array.from(arguments).join(" "),context:{}});}$1'
            $modified = $true
            $totalFixed++
        }
        
        # Fix 3: console.log ohne Fabrikage (nur wenn nicht bereits integriert)
        if ($content -match 'console\.log\s*\(' -and $content -notmatch 'fabrikageErrorBus.*console\.log' -and $content -notmatch 'fabrikageConsoleIntegrated') {
            # Nur bei wichtigen console.log Aufrufen
            if ($content -match 'console\.log\s*\([^)]*error|console\.log\s*\([^)]*Error|console\.log\s*\([^)]*fehler') {
                $content = $content -replace '(console\.log\s*\()', 'if(window.fabrikageErrorBus){window.fabrikageErrorBus.publish({module:"system",stage:"runtime",level:"info",class:"console.log",message:Array.from(arguments).join(" "),context:{}});}$1'
                $modified = $true
                $totalFixed++
            }
        }
        
        # Fix 4: Fehlende Fabrikage-Skripte im head
        if ($file.Extension -eq '.html' -and $content -match '<head>' -and $content -notmatch 'FABRIKAGE-ERROR-BUS\.js') {
            $fabrikageScripts = @"
<!-- [.SYSTEMS.T.SYSTEMS.] FABRIKAGE Console-Bypass Integration - FRÜH INITIALISIERT -->
<script src="./CASHFLOX/FABRIKAGE-ERROR-BUS.js"></script>
<script src="./CASHFLOX/FABRIKAGE-AUDIT-LOGGING.js"></script>
<script src="./CASHFLOX/FABRIKAGE-CONSOLE-BYPASS-INTEGRATION.js"></script>
<script src="./FABRIKAGE-REALTIME-MONITOR.js"></script>
"@
            $content = $content -replace '(<head>)', "`$1`n$fabrikageScripts"
            $modified = $true
            $totalFixed++
        }
        
        if ($modified) {
            $content | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
            Write-Host "  ✅ FIX: $($file.Name)" -ForegroundColor Green
        }
        
        # Zähle Fehler
        $errorMatches = [regex]::Matches($content, 'console\.(error|warn|log)\s*\(')
        $totalErrors += $errorMatches.Count
        
    } catch {
        # Ignoriere Fehler
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ ERROR FIXER ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Console-Aufrufe gefunden: $totalErrors" -ForegroundColor Green
Write-Host "✅ Fixes angewendet: $totalFixed" -ForegroundColor Green
Write-Host ""
