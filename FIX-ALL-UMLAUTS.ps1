# Fix all German umlauts and special characters encoding issues
$rootPath = Get-Location
$fileCount = 0
$fixedCount = 0

# Define replacements
$replacements = @{
    'ä' = "ä"
    'ö' = "ö"
    'ü' = "ü"
    'ß' = "ß"
    'Ä' = "Ä"
    'Ö' = "Ö"
    'Ü' = "Ü"
    '–' = "–"
    '—' = "—"
    ''' = "'"
    ''' = "'"
    '"' = '"'
    '"' = '"'
    '…' = "…"
    '•' = "•"
    '▶️' = "▶️"
    '' = ""
    '§©' = "🧩"
    'š€' = "🚀"
    '✅' = "✅"
}

# Get all text files (ps1, html, md, js, json, bat, txt, etc.)
$files = Get-ChildItem -Path $rootPath -Recurse -Include *.ps1, *.html, *.md, *.js, *.json, *.bat, *.txt, *.yaml, *.yml -ErrorAction SilentlyContinue

Write-Host "Found $($files.Count) files to check..."
Write-Host ""

foreach ($file in $files) {
    $fileCount++
    $originalContent = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
    $newContent = $originalContent
    $hasChanges = $false

    # Apply all replacements
    foreach ($oldChar in $replacements.Keys) {
        if ($newContent -match [regex]::Escape($oldChar)) {
            $newContent = $newContent -replace [regex]::Escape($oldChar), $replacements[$oldChar]
            $hasChanges = $true
        }
    }

    # Save file if changes were made
    if ($hasChanges) {
        [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
        $fixedCount++
        Write-Host "✓ Fixed: $($file.Name)"
    }
}

Write-Host ""
Write-Host "================================"
Write-Host "ENCODING FIX COMPLETE"
Write-Host "================================"
Write-Host "Files checked: $fileCount"
Write-Host "Files fixed: $fixedCount"
Write-Host ""
