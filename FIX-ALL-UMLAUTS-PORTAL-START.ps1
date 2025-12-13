# [.SYSTEMS.T.SYSTEMS.] Fix alle Umlaut-Encoding-Fehler in Portal – Start.html
# Behebt: Einträge → Einträge, â€" → —,  → korrektes Emoji, etc.

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
    'Einträge' = 'Einträge'
    'für' = 'für'
    'ü' = 'ü'
    'ä' = 'ä'
    'ö' = 'ö'
    'ß' = 'ß'
    'Ãœ' = 'Ü'
    'Ä' = 'Ä'
    'Ö' = 'Ö'
    'â€"' = '—'
    'â€"' = '"'
    'â€"' = '"'
    'â€"' = '…'
    'â€"' = '–'
    'â€"' = '€'
    'Zurück' = 'Zurück'
    'öffnen' = 'öffnen'
    'erklärt' = 'erklärt'
    'wählen' = 'wählen'
    'zurückspielen' = 'zurückspielen'
    'Für' = 'Für'
    'â€' = '€'
    '' = '🌍'
    'Œ"' = '🌍'
    '' = '🏷️'
    '' = '💡'
    '' = '🚀'
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
