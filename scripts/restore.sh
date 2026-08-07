#!/bin/bash
# PowerGuard Restore Script
# Restores the MySQL database from a given backup file

if [ -z "$1" ]; then
  echo "Usage: ./restore.sh <path_to_backup.sql.gz>"
  exit 1
fi

BACKUP_FILE=$1
DB_CONTAINER="powerguard-mysql"
DB_USER="root"
DB_PASS="powerguard"
DB_NAME="powerguard"

echo "🔄 Restoring PowerGuard Database from $BACKUP_FILE..."

# Extract and Restore Database
zcat "$BACKUP_FILE" | docker exec -i "$DB_CONTAINER" /usr/bin/mysql -u "$DB_USER" -p"$DB_PASS" "$DB_NAME"

echo "✅ Restore Completed Successfully!"
