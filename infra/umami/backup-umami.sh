#!/usr/bin/env bash
# Nightly Umami database backup. Keeps 14 days.
# Install: sudo cp backup-umami.sh /opt/umami/ && sudo chmod 700 /opt/umami/backup-umami.sh
# Cron (sudo crontab -e):
#   15 3 * * * /opt/umami/backup-umami.sh >> /var/log/umami-backup.log 2>&1
set -euo pipefail

BACKUP_DIR=/opt/umami/backups
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

STAMP=$(date +%Y-%m-%d)
docker exec umami-db pg_dump -U umami -d umami | gzip > "$BACKUP_DIR/umami-$STAMP.sql.gz"

find "$BACKUP_DIR" -name 'umami-*.sql.gz' -mtime +14 -delete
echo "$(date -Is) backup ok: umami-$STAMP.sql.gz"
