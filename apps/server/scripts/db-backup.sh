#!/bin/bash
# PowerGuard Database Backup Script

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="powerguard_backup_$TIMESTAMP.sql"

# Extract DB credentials from env (simplified for local/dev)
DB_USER="root"
DB_PASS="password"
DB_NAME="powerguard"

mkdir -p $BACKUP_DIR

echo "📦 Creating database backup..."
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME > "$BACKUP_DIR/$FILENAME"

echo "✅ Backup created successfully at $BACKUP_DIR/$FILENAME"
