# Generate-SshKey.ps1
# This script generates a new SSH key pair and converts it to PPK format

# Check if OpenSSH is available
if (-not (Get-Command ssh-keygen -ErrorAction SilentlyContinue)) {
    Write-Host "OpenSSH is not installed. Please install it and try again." -ForegroundColor Red
    exit 1
}

# Set key paths
$privateKeyPath = "$env:USERPROFILE\.ssh\id_rsa_enterprise"
$publicKeyPath = "$privateKeyPath.pub"
$ppkPath = "$privateKeyPath.ppk"

# Generate SSH key pair
Write-Host "Generating new SSH key pair..." -ForegroundColor Cyan
ssh-keygen -t rsa -b 4096 -f $privateKeyPath -N '""' -C "deployment-key-$(Get-Date -Format 'yyyyMMdd')"

# Check if key generation was successful
if (-not (Test-Path $privateKeyPath)) {
    Write-Host "Failed to generate SSH key pair." -ForegroundColor Red
    exit 1
}

Write-Host "SSH key pair generated successfully!" -ForegroundColor Green
Write-Host "Private key: $privateKeyPath"
Write-Host "Public key: $publicKeyPath"

# Convert to PPK format if PuTTY is installed
$puttygenPath = "C:\Program Files\PuTTY\puttygen.exe"
if (Test-Path $puttygenPath) {
    Write-Host "Converting private key to PPK format..." -ForegroundColor Cyan
    & $puttygenPath $privateKeyPath -o $ppkPath -O private
    
    if (Test-Path $ppkPath) {
        Write-Host "PPK key generated: $ppkPath" -ForegroundColor Green
        Write-Host "`nIMPORTANT: Add the following public key to your server's ~/.ssh/authorized_keys file:" -ForegroundColor Yellow
        Write-Host (Get-Content $publicKeyPath) -ForegroundColor Cyan
    } else {
        Write-Host "Failed to convert private key to PPK format. Make sure PuTTY is installed." -ForegroundColor Yellow
    }
} else {
    Write-Host "`nPuTTY is not installed. Please install PuTTY and run this script again to generate a PPK file." -ForegroundColor Yellow
    Write-Host "Alternatively, you can manually convert the key using PuTTYgen." -ForegroundColor Yellow
}

# Set proper permissions on the key files
Write-Host "`nSetting file permissions..." -ForegroundColor Cyan
icacls $privateKeyPath /inheritance:r /grant:r "$env:USERNAME:(R)" | Out-Null
icacls $publicKeyPath /inheritance:r /grant:r "$env:USERNAME:(R)" | Out-Null
if (Test-Path $ppkPath) {
    icacls $ppkPath /inheritance:r /grant:r "$env:USERNAME:(R)" | Out-Null
}

Write-Host "`nKey generation complete!" -ForegroundColor Green
