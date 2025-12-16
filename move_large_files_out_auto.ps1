$src = 'D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)'
$dest = Join-Path $src 'togethersystems_external_artifacts'
New-Item -ItemType Directory -Force -Path $dest | Out-Null
$logFull = Join-Path $src 'moved_files_full.txt'
$logRel = Join-Path $src 'moved_files_rel.txt'
Remove-Item -Force -ErrorAction SilentlyContinue $logFull,$logRel
Get-ChildItem -Path $src -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    ($_.Length -gt 100MB) -and ($_.FullName -notmatch '\\/.git\\') -and ($_.FullName -notmatch '\\node_modules\\') -and ($_.FullName -notmatch '\\togethersystems_external_artifacts\\')
} | ForEach-Object {
    $rel = $_.FullName.Substring($src.Length+1)
    $target = Join-Path $dest $rel
    New-Item -ItemType Directory -Force -Path (Split-Path $target) | Out-Null
    try {
        Move-Item -LiteralPath $_.FullName -Destination $target -Force -ErrorAction Stop
        "$($_.FullName)" | Out-File -FilePath $logFull -Append -Encoding utf8
        "$rel" | Out-File -FilePath $logRel -Append -Encoding utf8
        Write-Host "Moved: $rel"
    } catch {
        Write-Warning "Failed to move $($_.FullName): $_"
    }
}
if (-not (Test-Path $logFull)) { Write-Host 'No files moved.' }
