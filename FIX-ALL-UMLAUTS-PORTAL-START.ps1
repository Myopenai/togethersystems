# [.SYSTEMS.T.SYSTEMS.] Fix alle Umlaut-Encoding-Fehler in Portal – Start.html
# Behebt: EintrÃ¤ge → Einträge, â€" → —, ðŸ → korrektes Emoji, etc.

$ErrorActionPreference = "Continue"

$file = "Portal – Start.html"
if (-not (Test-Path $file)) {
    Write-Host "❌ Datei nicht gefunden: $file" -ForegroundColor Red
    exit 1
}

Write-Host "🔧 Behebe Umlaut-Encoding-Fehler in $file..." -ForegroundColor Cyan

$content = Get-Content $file -Raw -Encoding UTF8

# Encoding-Fehler → korrekte Zeichen
$replacements = @{
    'EintrÃ¤ge' = 'Einträge'
    'fÃ¼r' = 'für'
    'Ã¼' = 'ü'
    'Ã¤' = 'ä'
    'Ã¶' = 'ö'
    'ÃŸ' = 'ß'
    'Ãœ' = 'Ü'
    'Ã„' = 'Ä'
    'Ã–' = 'Ö'
    'â€"' = '—'
    'â€"' = '"'
    'â€"' = '"'
    'â€"' = '…'
    'â€"' = '–'
    'â€"' = '€'
    'ZurÃ¼ck' = 'Zurück'
    'Ã¶ffnen' = 'öffnen'
    'erklÃ¤rt' = 'erklärt'
    'wÃ¤hlen' = 'wählen'
    'zurÃ¼ckspielen' = 'zurückspielen'
    'FÃ¼r' = 'Für'
    'â€' = '€'
    'ðŸ' = '🌍'
    'ðŸŒ"' = '🌍'
    'ðŸ' = '🏷️'
    'ðŸ' = '💡'
    'ðŸ' = '🚀'
}

$fixed = $content
foreach ($key in $replacements.Keys) {
    $count = ([regex]::Matches($fixed, [regex]::Escape($key))).Count
    if ($count -gt 0) {
        $fixed = $fixed -replace [regex]::Escape($key), $replacements[$key]
        Write-Host "  ✅ Ersetzt: '$key' → '$($replacements[$key])' ($count Vorkommen)" -ForegroundColor Green
    }
}

# Speichere mit UTF-8 (ohne BOM)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText((Resolve-Path $file), $fixed, $utf8NoBom)

Write-Host "✅ Umlaut-Fixes abgeschlossen!" -ForegroundColor Green
