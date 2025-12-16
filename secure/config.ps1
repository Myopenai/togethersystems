# SFTP Deployment Configuration
@{
    # SFTP Connection
    SftpHost = "srv480-files.hstgr.io"
    SftpPort = 65002
    SftpUser = "u972026836"
    SshKeyPath = "$env:USERPROFILE\.ssh\id_rsa_enterprise.ppk"
    
    # Paths
    LocalPath = "D:\busineshuboffline CHATGTP\TOGETHERSYSTEMS- GITHUB\Nieuwe map (3)\docs\multi-industry-docs\"
    RemotePath = "/public_html/"
    BackupPath = "/backups/public_html_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
    
    # Email Settings
    SmtpServer = "smtp.tel1.nl"
    SmtpPort = 587
    SmtpUser = "deploy@tel1.nl"
    SmtpPass = "your_smtp_password"
    EmailFrom = "deploy@tel1.nl"
    EmailTo = "x@tel1.nl"
    
    # Verification
    EnableChecksumVerification = $true
    MaxRollbackVersions = 3
}
