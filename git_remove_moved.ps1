$repo='D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)'
Set-Location $repo
$logRel = Join-Path $repo 'moved_files_rel.txt'
if (-not (Test-Path $logRel)) { Write-Host 'No moved files log found.'; exit 0 }
Get-Content $logRel | ForEach-Object {
    $p = $_ -replace '\\','/'
    Write-Host "git rm --cached --ignore-unmatch -- $p"
    git rm --cached --ignore-unmatch -- $p
}
# ensure .gitattributes is staged
if (Test-Path (Join-Path $repo '.gitattributes')) { git add .gitattributes }
try {
    git commit -m "chore: remove oversized artifacts moved to external artifacts folder"
} catch {
    Write-Host "No commit created (no tracked files were removed)."
}
Write-Host "git index cleanup done."
