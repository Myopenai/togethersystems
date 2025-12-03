# Size Analyzer - Findet die größten Dateien/Ordner
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SIZE ANALYZER - GROESSTE DATEIEN/ORDNER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Gesamtgröße
$totalSize = (Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
$totalGB = [math]::Round($totalSize / 1GB, 2)
$totalMB = [math]::Round($totalSize / 1MB, 2)

Write-Host "Gesamtgröße: $totalGB GB ($totalMB MB)" -ForegroundColor Yellow
Write-Host ""

# Größte Ordner
Write-Host "TOP 20 GROESSTE ORDNER:" -ForegroundColor Green
Write-Host ""

$folders = Get-ChildItem -Path . -Directory -ErrorAction SilentlyContinue | Where-Object { 
    $_.Name -notlike ".*" -and 
    $_.Name -ne "node_modules" -and 
    $_.Name -ne ".git"
} | ForEach-Object {
    $size = 0
    try {
        $size = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
    } catch {
        $size = 0
    }
    [PSCustomObject]@{
        Name = $_.Name
        SizeBytes = $size
        SizeMB = [math]::Round($size / 1MB, 2)
        SizeGB = [math]::Round($size / 1GB, 2)
    }
} | Sort-Object SizeBytes -Descending | Select-Object -First 20

$folders | Format-Table -AutoSize Name, SizeGB, SizeMB

Write-Host ""
Write-Host "TOP 30 GROESSTE DATEIEN:" -ForegroundColor Green
Write-Host ""

$files = Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notlike "*\node_modules\*" -and
    $_.FullName -notlike "*\.git\*" -and
    $_.FullName -notlike "*\backup\*"
} | ForEach-Object {
    [PSCustomObject]@{
        Name = $_.Name
        Path = $_.FullName.Replace((Get-Location).Path + "\", "")
        SizeBytes = $_.Length
        SizeMB = [math]::Round($_.Length / 1MB, 2)
        SizeGB = [math]::Round($_.Length / 1GB, 2)
    }
} | Sort-Object SizeBytes -Descending | Select-Object -First 30

$files | Format-Table -AutoSize Name, SizeMB, SizeGB, Path

Write-Host ""
Write-Host "DATEITYPEN-ANALYSE:" -ForegroundColor Green
Write-Host ""

$fileTypes = Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notlike "*\node_modules\*" -and
    $_.FullName -notlike "*\.git\*" -and
    $_.FullName -notlike "*\backup\*"
} | Group-Object Extension | ForEach-Object {
    $size = ($_.Group | Measure-Object -Property Length -Sum).Sum
    [PSCustomObject]@{
        Extension = if ($_.Name) { $_.Name } else { "(keine)" }
        Count = $_.Count
        SizeMB = [math]::Round($size / 1MB, 2)
        SizeGB = [math]::Round($size / 1GB, 2)
    }
} | Sort-Object SizeBytes -Descending

$fileTypes | Format-Table -AutoSize Extension, Count, SizeGB, SizeMB

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "ANALYSE ABGESCHLOSSEN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

