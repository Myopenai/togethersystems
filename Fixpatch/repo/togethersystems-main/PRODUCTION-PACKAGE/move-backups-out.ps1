# Verschiebt BACKUPS-Ordner dauerhaft außerhalb des Projekts
Write-Host "Moving BACKUPS folder outside project..." -ForegroundColor Yellow

$projectRoot = Get-Location
$parentDir = Split-Path -Parent $projectRoot
$backupsPath = Join-Path $projectRoot "BACKUPS"
$targetPath = Join-Path $parentDir "TOGETHERSYSTEMS-BACKUPS"

if (Test-Path $backupsPath) {
    Write-Host "Found BACKUPS folder: $backupsPath" -ForegroundColor Cyan
    
    # Prüfe ob Ziel bereits existiert
    if (Test-Path $targetPath) {
        Write-Host "Target already exists: $targetPath" -ForegroundColor Yellow
        Write-Host "Merging contents..." -ForegroundColor Yellow
        # Inhalt zusammenführen
        Get-ChildItem $backupsPath -Recurse | ForEach-Object {
            $destPath = $_.FullName.Replace($backupsPath, $targetPath)
            $destDir = Split-Path -Parent $destPath
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Path $destDir -Force | Out-Null
            }
            Copy-Item $_.FullName $destPath -Force -ErrorAction SilentlyContinue
        }
        Remove-Item $backupsPath -Recurse -Force
        Write-Host "✅ BACKUPS merged and moved successfully" -ForegroundColor Green
    } else {
        Move-Item $backupsPath $targetPath -Force
        Write-Host "✅ BACKUPS moved successfully" -ForegroundColor Green
    }
    
    Write-Host "`nNew location: $targetPath" -ForegroundColor Cyan
    Write-Host "`n✅ BACKUPS is now outside the project directory" -ForegroundColor Green
    Write-Host "Deployment should now work without issues!" -ForegroundColor Green
} else {
    Write-Host "BACKUPS folder not found in project - nothing to move" -ForegroundColor Green
}

