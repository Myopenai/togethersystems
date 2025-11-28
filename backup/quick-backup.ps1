# Quick Portal Backup
$timestamp = Get-Date -Format 'yyyy-MM-dd-HHmmss'
$backupDir = "backup/portal-$timestamp"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

# Kopiere alles
Copy-Item -Path "*.html" -Destination $backupDir -Force -ErrorAction SilentlyContinue
Copy-Item -Path "css" -Destination $backupDir -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "js" -Destination $backupDir -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "TELADIA" -Destination $backupDir -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "TELBANK" -Destination $backupDir -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item -Path "Settings" -Destination $backupDir -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Backup erstellt: $backupDir"

