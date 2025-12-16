# Test Fabrication System Module
Write-Host "Testing Fabrication System Module..." -ForegroundColor Cyan

# Import the module
$modulePath = Join-Path -Path $PSScriptRoot -ChildPath "FabricationSystem.psm1"
if (Test-Path $modulePath) {
    try {
        Import-Module $modulePath -Force -ErrorAction Stop
        Write-Host "Module imported successfully" -ForegroundColor Green
        
        # Test functions
        Write-Host "`nTesting Get-SystemStatus..." -ForegroundColor Cyan
        $status = Get-SystemStatus
        $status | Format-List *
        
        Write-Host "`nTesting Write-SystemLog..." -ForegroundColor Cyan
        Write-SystemLog -Message "This is a test message" -Level Information -Component "Test"
        Write-Host "Log entry written successfully" -ForegroundColor Green
        
        Write-Host "`nTesting Start-FabricationSystem..." -ForegroundColor Cyan
        Start-FabricationSystem -Mode Active
        
    } catch {
        Write-Host "Error: $_" -ForegroundColor Red
        Write-Host $_.ScriptStackTrace -ForegroundColor DarkRed
    }
} else {
    Write-Host "Module file not found at: $modulePath" -ForegroundColor Red
}
