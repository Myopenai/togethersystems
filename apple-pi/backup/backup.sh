#!/bin/bash
# Automatisches Backup-Script
# BRANDING: .T. TogetherSystems - ModularFlux Architecture
# VERSION: 3.0.0

BACKUP_DIR="${BACKUP_DIR:-/mnt/backup}"
REPO_NAME="apple-pi-backup"
DATA_DIR="/opt/apple-pi/data"

# BorgBackup
if command -v borg &> /dev/null; then
    borg create --compression lz4 $BACKUP_DIR/$REPO_NAME::backup-{now:%Y-%m-%d_%H:%M:%S} $DATA_DIR
    borg prune --keep-daily 7 --keep-weekly 4 --keep-monthly 12 $BACKUP_DIR/$REPO_NAME
fi

# Restic
if command -v restic &> /dev/null && [ -n "$RESTIC_PASSWORD" ]; then
    restic -r $BACKUP_DIR/$REPO_NAME backup $DATA_DIR
    restic -r $BACKUP_DIR/$REPO_NAME forget --keep-daily 7 --keep-weekly 4 --keep-monthly 12
fi


