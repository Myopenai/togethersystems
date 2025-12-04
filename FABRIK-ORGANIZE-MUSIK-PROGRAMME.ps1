# FABRIK: Organisiere Musik-Programme in MUSIK-PROGRAMME Ordner
# IBM+++ MCP MCP MCP Standard - Industrial Fabrication Software

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FABRIK: ORGANISIERE MUSIK-PROGRAMME" -ForegroundColor Cyan
Write-Host "IBM+++ MCP MCP MCP STANDARD" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Erstelle Musik-Ordner
$musikDir = "MUSIK-PROGRAMME"
if (-not (Test-Path $musikDir)) {
    New-Item -ItemType Directory -Path $musikDir | Out-Null
    Write-Host "[1] ✅ Musik-Ordner erstellt: $musikDir" -ForegroundColor Green
} else {
    Write-Host "[1] ✅ Musik-Ordner bereits vorhanden: $musikDir" -ForegroundColor Green
}

Write-Host ""

# Dateien und Ordner die verschoben werden sollen
$itemsToMove = @()

# 1. Gitarre Html Visionview Must Be Updated Html.html (Root)
$file1 = "Gitarre Html Visionview Must Be Updated Html.html"
if (Test-Path $file1) {
    $itemsToMove += @{ Source = $file1; Type = "File" }
    Write-Host "[2] ✅ Gefunden: $file1" -ForegroundColor Yellow
}

# 2. Singlefile Html (1).html (Root)
$file2 = "Singlefile Html (1).html"
if (Test-Path $file2) {
    $itemsToMove += @{ Source = $file2; Type = "File" }
    Write-Host "[3] ✅ Gefunden: $file2" -ForegroundColor Yellow
}

# 3. Testversion 0001 Gitarre Html Zip (1) (Ordner)
$dir1 = "Testversion 0001 Gitarre Html Zip (1)"
if (Test-Path $dir1) {
    $itemsToMove += @{ Source = $dir1; Type = "Directory" }
    Write-Host "[4] ✅ Gefunden: $dir1" -ForegroundColor Yellow
}

# 4. gentlyoverdone\Gitarre Html.html
$file3 = "gentlyoverdone\Gitarre Html.html"
if (Test-Path $file3) {
    $itemsToMove += @{ Source = $file3; Type = "File" }
    Write-Host "[5] ✅ Gefunden: $file3" -ForegroundColor Yellow
}

# 5. gentlyoverdone\Gitarre Html Visionview Must Be Updated Html.html
$file4 = "gentlyoverdone\Gitarre Html Visionview Must Be Updated Html.html"
if (Test-Path $file4) {
    $itemsToMove += @{ Source = $file4; Type = "File" }
    Write-Host "[6] ✅ Gefunden: $file4" -ForegroundColor Yellow
}

# 6. gentlyoverdone\Singlefile Html.html
$file5 = "gentlyoverdone\Singlefile Html.html"
if (Test-Path $file5) {
    $itemsToMove += @{ Source = $file5; Type = "File" }
    Write-Host "[7] ✅ Gefunden: $file5" -ForegroundColor Yellow
}

# 7. gentlyoverdone\Testversion 0001 Gitarre Html Zip.zip
$file6 = "gentlyoverdone\Testversion 0001 Gitarre Html Zip.zip"
if (Test-Path $file6) {
    $itemsToMove += @{ Source = $file6; Type = "File" }
    Write-Host "[8] ✅ Gefunden: $file6" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Gesamt gefundene Items: $($itemsToMove.Count)" -ForegroundColor Cyan
Write-Host ""

if ($itemsToMove.Count -eq 0) {
    Write-Host "⚠️  Keine Dateien/Ordner zum Verschieben gefunden!" -ForegroundColor Yellow
    exit 0
}

# Verschiebe alle Items
$moved = 0
$errors = 0

foreach ($item in $itemsToMove) {
    $source = $item.Source
    $name = Split-Path $source -Leaf
    $destination = Join-Path $musikDir $name
    
    try {
        if ($item.Type -eq "Directory") {
            # Ordner verschieben
            if (Test-Path $destination) {
                Write-Host "⚠️  Überspringe (bereits vorhanden): $name" -ForegroundColor Yellow
            } else {
                Move-Item -Path $source -Destination $musikDir -Force
                Write-Host "  ✅ Verschoben: $name (Ordner)" -ForegroundColor Green
                $moved++
            }
        } else {
            # Datei verschieben
            if (Test-Path $destination) {
                Write-Host "⚠️  Überspringe (bereits vorhanden): $name" -ForegroundColor Yellow
            } else {
                Move-Item -Path $source -Destination $musikDir -Force
                Write-Host "  ✅ Verschoben: $name" -ForegroundColor Green
                $moved++
            }
        }
    } catch {
        $errors++
        Write-Host "  ❌ FEHLER beim Verschieben von $name : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ZUSAMMENFASSUNG" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Items gefunden: $($itemsToMove.Count)" -ForegroundColor Yellow
Write-Host "Verschoben: $moved" -ForegroundColor Green
Write-Host "Fehler: $errors" -ForegroundColor $(if ($errors -eq 0) { "Green" } else { "Red" })
Write-Host ""

# Zeige Inhalt des Musik-Ordners
Write-Host "Inhalt von $musikDir :" -ForegroundColor Cyan
$musikContent = Get-ChildItem -Path $musikDir | Select-Object Name, @{Name="Type";Expression={if($_.PSIsContainer){"Ordner"}else{"Datei"}}}, @{Name="Size";Expression={if(-not $_.PSIsContainer){"$([math]::Round($_.Length/1KB, 2)) KB"}else{"-"}}}
$musikContent | Format-Table -AutoSize

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "[OK] MUSIK-PROGRAMME ORGANISIERT" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "T,.&T,,.&T,,,.].T,,,,.(C)(R).T,,.} - TEL1.NL - Together Systems" -ForegroundColor Green

