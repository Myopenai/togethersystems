# T,. FABRIK FINAL 100% COMPLETE
$ErrorActionPreference = "SilentlyContinue"
$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = Get-Location }

# 1. Erweiterte JavaScript-Fixes
& "$rootDir\FIX-JAVASCRIPT-ADVANCED.ps1"

# 2. JSON-Fixes
& "$rootDir\FIX-JSON-ERRORS.ps1"

# 3. HTML charset
$htmlFiles = Get-ChildItem -Path $rootDir -Recurse -Filter "*.html" -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch '\\node_modules\\|\\\.git\\|\\ARCHIV\\|\\BACKUP\\'
}
foreach ($file in $htmlFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        if ($content -match '<!DOCTYPE\s+html|<\s*html' -and $content -notmatch '<meta\s+charset') {
            if ($content -match '(<head[^>]*>)') {
                $newContent = $content -replace '(<head[^>]*>)', "`$1`n<meta charset=`"UTF-8`">"
                $newContent | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
            }
        }
    } catch {
        # Ignoriere
    }
}

# 4. Finale Tests
$allFiles = Get-ChildItem -Path $rootDir -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch '\\node_modules\\|\\\.git\\|\\ARCHIV\\|\\BACKUP\\|\\TEMP\\'
}

$total = $allFiles.Count
$passed = 0
$failed = 0

foreach ($file in $allFiles) {
    try {
        $null = Get-Content -Path $file.FullName -TotalCount 1 -ErrorAction Stop
        $ext = $file.Extension.ToLower()
        
        if ($ext -eq '.html') {
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
            if ($content -match '<!DOCTYPE\s+html|<\s*html' -and $content -notmatch '<meta\s+charset') {
                throw "charset fehlt"
            }
        } elseif ($ext -eq '.json') {
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
            $null = $content | ConvertFrom-Json -ErrorAction Stop
        } elseif ($ext -eq '.js') {
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
            $openBraces = ([regex]::Matches($content, '\{')).Count
            $closeBraces = ([regex]::Matches($content, '\}')).Count
            if ($openBraces -ne $closeBraces) {
                throw "ungleiche braces"
            }
        }
        
        $passed++
    } catch {
        $failed++
    }
}

if ($failed -eq 0) {
    exit 0
} else {
    exit 1
}

