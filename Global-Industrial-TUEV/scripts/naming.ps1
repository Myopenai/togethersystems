# T,. Global Industrial TÜV - Strict Artifact Naming (PowerShell)
# Version: 1.0.0
# Signatur: T,.&T,,.&T,,,.T.

function New-ArtifactName {
    param(
        [Parameter(Mandatory=$true)]
        [string]$App,
        
        [Parameter(Mandatory=$true)]
        [string]$Variant,
        
        [Parameter(Mandatory=$true)]
        [string]$Device,
        
        [Parameter(Mandatory=$true)]
        [string]$Model,
        
        [Parameter(Mandatory=$true)]
        [string]$Arch,
        
        [Parameter(Mandatory=$true)]
        [string]$Locale,
        
        [Parameter(Mandatory=$true)]
        [string]$BuildId,
        
        [Parameter(Mandatory=$true)]
        [string]$Timestamp,
        
        [Parameter(Mandatory=$true)]
        [string]$Payload
    )
    
    # Extract extension from payload if it's a filename
    $ext = ""
    if ($Payload -match '\.([a-zA-Z0-9]+)$') {
        $ext = ".$($Matches[1])"
    }
    
    # Generate SHA-256 hash
    $sha = [System.Security.Cryptography.SHA256]::Create()
    $hashBytes = $sha.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($Payload))
    $hashString = ($hashBytes | ForEach-Object { $_.ToString("x2") }) -join ""
    $hash5 = $hashString.Substring(0, 5)
    
    # Format: app-variant-device-model-arch-locale-buildid-timestamp-hash5.ext
    return "$App-$Variant-$Device-$Model-$Arch-$Locale-$BuildId-$Timestamp-$hash5$ext"
}

function Test-ArtifactName {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Name
    )
    
    # Pattern: app-variant-device-model-arch-locale-buildid-timestamp-hash5.ext
    $pattern = '^[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+-[0-9TZ]+-[a-f0-9]{5}(\.[a-zA-Z0-9]+)?$'
    
    if ($Name -notmatch $pattern) {
        Write-Error "Invalid artifact name format: $Name"
        return $false
    }
    
    return $true
}

# Export functions
Export-ModuleMember -Function New-ArtifactName, Test-ArtifactName

