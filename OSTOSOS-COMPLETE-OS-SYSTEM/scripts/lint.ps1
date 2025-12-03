# T,. OSOTOSOS - Lint Verification (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "Lint: whitespace/style guards"

$tabsFound = $false
Get-ChildItem -Path . -Filter "*.py" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "`t") {
        Write-Host "Tabs found in: $($_.FullName)" -ForegroundColor Yellow
        $tabsFound = $true
    }
}

if ($tabsFound) {
    Write-Host "Tabs found in Python files" -ForegroundColor Red
    exit 1
}

Write-Host "Lint OK" -ForegroundColor Green

