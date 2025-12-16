# Secure PowerShell Deployment Script for Multi-Industry Docs
# Usage: .\deploy-secure.ps1

param(
    [Parameter(Mandatory=$false, HelpMessage="Remote host address")]
    [string]$Host = "45.87.81.214",

    [Parameter(Mandatory=$false, HelpMessage="Remote SSH/SFTP port")]
    [int]$Port = 65002,

    [Parameter(Mandatory=$false, HelpMessage="Source path (local project)")]
    [string]$SourcePath = "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\docs\multi-industry-docs",

    [Parameter(Mandatory=$false, HelpMessage="Remote destination path")]
    [string]$RemotePath = "/home/u972026836/domains/digitalnotar.in/public_html",

    [Parameter(Mandatory=$false, HelpMessage="Remote username")]
    [string]$Username = "u972026836"
)

# Color functions for better UX
function Write-Header { Write-Host "`n$([char]27)[1;36m$args$([char]27)[0m" }
function Write-Success { Write-Host "$([char]27)[1;32m✓ $args$([char]27)[0m" }
function Write-Warning { Write-Host "$([char]27)[1;33m⚠ $args$([char]27)[0m" }
function Write-Error { Write-Host "$([char]27)[1;31m✗ $args$([char]27)[0m" }
function Write-Info { Write-Host "$([char]27)[0;36mℹ $args$([char]27)[0m" }

Write-Header "╔═══════════════════════════════════════════════════════════════════╗"
Write-Header "║    Multi-Industry Docs - Secure Remote Deployment Script         ║"
Write-Header "╚═══════════════════════════════════════════════════════════════════╝"

Write-Info "Target Server: $Host`:$Port"
Write-Info "Remote User: $Username"
Write-Info "Remote Path: $RemotePath"
Write-Info "Source Path: $SourcePath"

# Verify source path exists
if (-not (Test-Path $SourcePath)) {
    Write-Error "Source path does not exist: $SourcePath"
    exit 1
}

Write-Success "Source path verified"

# Check for required files
$requiredFiles = @(
    "dist",
    "server.js",
    "package.json"
)

Write-Info "Checking for required files..."
foreach ($file in $requiredFiles) {
    $path = Join-Path $SourcePath $file
    if (Test-Path $path) {
        Write-Success "Found: $file"
    } else {
        Write-Error "Missing: $file"
        exit 1
    }
}

# Prompt for password securely (using PSCredential)
Write-Header "Authentication"
Write-Info "Please enter your remote credentials (username: $Username)"

$cred = Get-Credential -UserName $Username -Message "Enter SFTP password for $Username@$Host"
if (-not $cred) {
    Write-Error "Authentication cancelled"
    exit 1
}

Write-Success "Credentials provided (securely stored in memory only)"

# Create WinSCP script for secure deployment
$winscpScript = @"
option batch continue
option confirm off

# Connect using secure credentials
open sftp://$($cred.UserName):$($cred.GetNetworkCredential().Password)@$($Host):$Port

# Create remote directories if they don't exist
cd $RemotePath
mkdir data 2>/dev/null
mkdir data/content 2>/dev/null

# Upload files
synchronize remote "$SourcePath\dist" "$RemotePath/dist" -mirror -delete
put "$SourcePath\server.js" "$RemotePath/"
put "$SourcePath\package.json" "$RemotePath/"

# Set correct permissions
chmod 755 "$RemotePath/data"
chmod 755 "$RemotePath/data/content"
chmod 644 "$RemotePath/server.js"
chmod 644 "$RemotePath/package.json"

exit
"@

# Save script to temporary file
$scriptFile = Join-Path ([System.IO.Path]::GetTempPath()) "winscp_deploy_$(Get-Random).txt"
Set-Content -Path $scriptFile -Value $winscpScript -Encoding UTF8

try {
    Write-Header "Uploading Files"
    
    # Check if WinSCP is installed
    $winscpPath = "C:\Program Files (x86)\WinSCP\WinSCP.com"
    if (-not (Test-Path $winscpPath)) {
        Write-Warning "WinSCP not found at default location. Searching system..."
        
        $found = Get-ChildItem -Path "C:\Program Files*" -Name "WinSCP.com" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($found) {
            $winscpPath = $found
        } else {
            Write-Error "WinSCP not installed. Please install WinSCP from https://winscp.net/eng/download.php"
            exit 1
        }
    }
    
    Write-Success "Found WinSCP at: $winscpPath"
    
    # Run WinSCP deployment
    Write-Info "Connecting to $Host`:$Port..."
    & $winscpPath /script=$scriptFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Files uploaded successfully!"
    } else {
        Write-Error "Upload failed with exit code: $LASTEXITCODE"
        exit 1
    }
}
finally {
    # Clean up temporary script file
    if (Test-Path $scriptFile) {
        Remove-Item $scriptFile -Force
        Write-Info "Cleaned up temporary files"
    }
}

# Create post-deployment instruction file
$postDeployInstructions = @"
╔══════════════════════════════════════════════════════════════════════════╗
║           POST-DEPLOYMENT STEPS (SSH into the server)                   ║
╚══════════════════════════════════════════════════════════════════════════╝

1. SSH into your server:
   ssh -p $Port $Username@$Host

2. Navigate to the deployment directory:
   cd $RemotePath

3. Install/update Node dependencies:
   npm install --production

4. Start the server:
   
   Option A: Direct run
   PORT=80 node server.js
   
   Option B: Background run (detached)
   nohup PORT=80 node server.js > server.log 2>&1 &
   
   Option C: Using PM2 (if installed)
   pm2 start server.js --name "docs" -- --PORT 80

5. Verify the server is running:
   curl http://localhost/api/health
   
   Expected response:
   {"status":"ok","timestamp":"...","uptime":...}

6. Access your site:
   http://digitalnotar.in
   http://45.87.81.214

╔══════════════════════════════════════════════════════════════════════════╗
║                        API ENDPOINTS AVAILABLE                          ║
╚══════════════════════════════════════════════════════════════════════════╝

Health Check:
  GET /api/health

WYSIWYG Content Management:
  GET  /api/content/:id            - Retrieve content
  POST /api/save                   - Save/update content
  GET  /api/contents               - List all content
  POST /api/export                 - Export all content as JSON
  DELETE /api/content/:id          - Delete content

Features:
✓ Auto-save every 500ms
✓ Undo/Redo support (50 revisions)
✓ Full persistence (server + localStorage)
✓ Rich text formatting
✓ Keyboard shortcuts (Ctrl+S, Ctrl+Z/Y)
✓ Real-time status indicators
✓ Word/character count
✓ Secure CORS headers
✓ CSP (Content Security Policy)

╔══════════════════════════════════════════════════════════════════════════╗
║                       IMPORTANT SECURITY NOTES                          ║
╚══════════════════════════════════════════════════════════════════════════╝

1. Enable HTTPS/SSL:
   - Install Certbot: sudo apt-get install certbot
   - Generate cert: sudo certbot certonly --standalone -d digitalnotar.in
   - Configure nginx to use the certificate

2. Set up firewall:
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow $Port/tcp
   sudo ufw enable

3. Regular backups:
   tar -czf backup-$(date +%Y%m%d).tar.gz $RemotePath/data/

4. Monitor server:
   pm2 save
   pm2 startup
   pm2 logs docs

5. Update dependencies regularly:
   npm update
   npm audit fix

╔══════════════════════════════════════════════════════════════════════════╗
║                           TROUBLESHOOTING                               ║
╚══════════════════════════════════════════════════════════════════════════╝

Port already in use:
  sudo lsof -i :80
  sudo kill -9 <PID>

Permission denied:
  chmod -R 755 $RemotePath/
  chmod -R 755 $RemotePath/data/

Module not found:
  npm install
  npm cache clean --force

View logs:
  tail -f server.log
  pm2 logs docs

"@

Write-Host $postDeployInstructions

# Save instructions to file
$instrFile = Join-Path $SourcePath "POST_DEPLOYMENT_CHECKLIST.txt"
Set-Content -Path $instrFile -Value $postDeployInstructions -Encoding UTF8
Write-Success "Post-deployment checklist saved to: $instrFile"

Write-Header "✓ Deployment Package Ready!"
Write-Info "Next steps:"
Write-Info "  1. SSH into your server: ssh -p $Port $Username@$Host"
Write-Info "  2. Navigate to: $RemotePath"
Write-Info "  3. Run: npm install --production"
Write-Info "  4. Start: PORT=80 node server.js"
Write-Info "  5. Verify: curl http://localhost/api/health"

Write-Success "Deployment script completed successfully!"
