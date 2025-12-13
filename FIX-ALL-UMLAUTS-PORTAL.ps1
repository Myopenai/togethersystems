# Fix Umlaut and Encoding Errors in HTML/JS Files
# This script will recursively fix all common German umlaut encoding errors and remove the server-required error message in all .html and .js files in the workspace.

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition

# Use an array of hashtables for replacements to avoid special character issues
$replacements = @(
    @{ from = 'Ã¤'; to = "`u{e4}" }, @{ from = 'Ã„'; to = "`u{c4}" }, @{ from = 'Ã¶'; to = "`u{f6}" }, @{ from = 'Ã–'; to = "`u{d6}" },
    @{ from = 'Ã¼'; to = "`u{fc}" }, @{ from = 'Ãœ'; to = "`u{dc}" }, @{ from = 'Ã'; to = "`u{df}" },
    @{ from = 'Ã ' ; to = "`u{e0}" }, @{ from = 'Ã¡'; to = "`u{e1}" }, @{ from = 'Ã¢'; to = "`u{e2}" }, @{ from = 'Ã£'; to = "`u{e3}" },
    @{ from = 'Ã©'; to = "`u{e9}" }, @{ from = 'Ã¨'; to = "`u{e8}" }, @{ from = 'Ãª'; to = "`u{ea}" }, @{ from = 'Ã«'; to = "`u{eb}" },
    @{ from = 'Ã¹'; to = "`u{f9}" }, @{ from = 'Ãº'; to = "`u{fa}" }, @{ from = 'Ã»'; to = "`u{fb}" }, @{ from = 'Ã±'; to = "`u{f1}" },
    @{ from = 'âŒ'; to = "`u{274c}" }, @{ from = 'â€“'; to = "`u{2013}" }, @{ from = 'â€”'; to = "`u{2014}" }, @{ from = 'â€ž'; to = "`u{201e}" },
    @{ from = 'â€œ'; to = "`u{201c}" }, @{ from = 'â€'; to = "`u{201d}" }, @{ from = 'â€˜'; to = "`u{2018}" }, @{ from = 'â€™'; to = "`u{2019}" },
    @{ from = 'â€¢'; to = "`u{2022}" }, @{ from = 'â€¦'; to = "`u{2026}" }, @{ from = 'â‚¬'; to = "`u{20ac}" }, @{ from = 'Â'; to = '' },
    @{ from = 'Skript-Ausführung nur auf Localhost verfügbar. Bitte Server starten: cd xxxxxxls-fabrikage && npm start'; to = '' }
)

$files = Get-ChildItem -Path $root -Recurse -Include *.html,*.js -File
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    foreach ($rep in $replacements) {
        $to = $rep.to
        if ($to -like "`u{*") {
            $hex = $to.Trim('`u{}')
            $to = [char][convert]::ToInt32($hex,16)
        }
        $content = $content -replace [regex]::Escape($rep.from), $to
    }
    Set-Content $file.FullName $content -Encoding UTF8
    Write-Host "Fixed: $($file.FullName)"
}
Write-Host "All umlaut and encoding errors fixed in HTML/JS files."