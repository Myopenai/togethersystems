# T,. FIX JSON ERRORS
$ErrorActionPreference = "SilentlyContinue"
$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = Get-Location }

$jsonFiles = Get-ChildItem -Path $rootDir -Recurse -Filter "*.json" -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch '\\node_modules\\|\\\.git\\|\\ARCHIV\\|\\BACKUP\\'
}

foreach ($file in $jsonFiles) {
    try {
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8 -ErrorAction Stop
        
        # Pruefe ob JSON valide ist
        $null = $content | ConvertFrom-Json -ErrorAction Stop
    } catch {
        # Versuche JSON zu reparieren
        try {
            # Entferne trailing commas
            $fixed = $content -replace ',\s*}', '}' -replace ',\s*]', ']'
            
            # Pruefe erneut
            $null = $fixed | ConvertFrom-Json -ErrorAction Stop
            
            # Speichere reparierte Version
            $backup = "$($file.FullName).backup"
            Copy-Item -Path $file.FullName -Destination $backup -Force -ErrorAction SilentlyContinue
            $fixed | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
        } catch {
            # Kann nicht repariert werden - ignoriere
        }
    }
}

