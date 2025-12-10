#!/bin/bash
# Backup-System Setup (BorgBackup/Restic)
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
# VERSION: 3.0.0

set -e

BACKUP_TYPE="${1:-borg}"  # borg oder restic
BACKUP_DIR="${BACKUP_DIR:-/mnt/backup}"
REPO_NAME="apple-pi-backup"

echo "═══════════════════════════════════════════════════════════"
echo "  APPLE-PI BACKUP SETUP"
echo "  Version: 3.0.0"
echo "═══════════════════════════════════════════════════════════"
echo ""

if [ "$BACKUP_TYPE" = "borg" ]; then
    echo "📦 Installiere BorgBackup..."
    sudo apt-get update
    sudo apt-get install -y borgbackup
    
    echo "🔧 Erstelle Backup-Repository..."
    mkdir -p $BACKUP_DIR
    borg init --encryption=repokey $BACKUP_DIR/$REPO_NAME
    
    echo "✅ BorgBackup Setup abgeschlossen"
    echo "   Repository: $BACKUP_DIR/$REPO_NAME"
    echo ""
    echo "📝 Backup-Befehl:"
    echo "   borg create $BACKUP_DIR/$REPO_NAME::backup-{now} /opt/apple-pi/data"
    echo ""
    echo "📝 Restore-Befehl:"
    echo "   borg extract $BACKUP_DIR/$REPO_NAME::backup-YYYY-MM-DD"
    
elif [ "$BACKUP_TYPE" = "restic" ]; then
    echo "📦 Installiere Restic..."
    wget https://github.com/restic/restic/releases/latest/download/restic_0.16.0_linux_amd64.bz2
    bunzip2 restic_0.16.0_linux_amd64.bz2
    chmod +x restic_0.16.0_linux_amd64
    sudo mv restic_0.16.0_linux_amd64 /usr/local/bin/restic
    
    echo "🔧 Initialisiere Restic-Repository..."
    mkdir -p $BACKUP_DIR
    export RESTIC_PASSWORD="${RESTIC_PASSWORD:-$(openssl rand -base64 32)}"
    restic -r $BACKUP_DIR/$REPO_NAME init
    
    echo "✅ Restic Setup abgeschlossen"
    echo "   Repository: $BACKUP_DIR/$REPO_NAME"
    echo "   Passwort: $RESTIC_PASSWORD"
    echo ""
    echo "📝 Backup-Befehl:"
    echo "   export RESTIC_PASSWORD='$RESTIC_PASSWORD'"
    echo "   restic -r $BACKUP_DIR/$REPO_NAME backup /opt/apple-pi/data"
    echo ""
    echo "📝 Restore-Befehl:"
    echo "   export RESTIC_PASSWORD='$RESTIC_PASSWORD'"
    echo "   restic -r $BACKUP_DIR/$REPO_NAME restore latest --target /tmp/restore"
else
    echo "❌ Unbekannter Backup-Typ: $BACKUP_TYPE"
    echo "   Verwende: borg oder restic"
    exit 1
fi

# Cron-Job erstellen
echo "📅 Erstelle Cron-Job für automatische Backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/apple-pi/backup/backup.sh") | crontab -

echo ""
echo "✅ Backup-System Setup abgeschlossen"
echo ""
echo "BRANDING: .T. TogetherSystems - ModularFlux Architecture"
echo "STANDARD: IBM STANDARD - PERMANENT AKTIV"


