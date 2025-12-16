$procs = Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and $_.CommandLine -match 'teaching\.bat' }
if ($procs) {
    $procs | Select-Object ProcessId, Name, CommandLine, @{Name='CreationDate';Expression={[Management.ManagementDateTimeConverter]::ToDateTime($_.CreationDate)}} | Format-List
} else {
    Write-Output 'No matching processes found'
}
Write-Output '=== Recent files in batch folder (last 120 minutes) ==='
$path = 'D:\\busineshuboffline CHATGTP\\TOGETHERSYSTEMS- GITHUB\\Nieuwe map (3)'
if (Test-Path $path) {
    Get-ChildItem -Path $path -Recurse -ErrorAction SilentlyContinue |
        Where-Object { $_.LastWriteTime -gt (Get-Date).AddMinutes(-120) } |
        Select-Object FullName, LastWriteTime |
        Format-Table -AutoSize
} else {
    Write-Output "Path not found: $path"
}
