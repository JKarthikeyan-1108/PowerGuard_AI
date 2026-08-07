#!/bin/bash
# PowerGuard Database Restore Script

set -e

if [ -z "$1" ]; then
  echo "❌ Error: Please provide the path to the SQL backup file."
  echo "Usage: ./db-restore.sh ./backups/filename.sql"
  exit 1
fi

BACKUP_FILE=$1

# Extract DB credentials from env (simplified for local/dev)
DB_USER="root"
DB_PASS="password"
DB_NAME="powerguard"

echo "⚠️ WARNING: This will overwrite the current database with the backup."
read -p "Are you sure? [y/N]: " confirm

if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
  echo "🔄 Restoring database from $BACKUP_FILE..."
  mysql -u $DB_USER -p$DB_PASS $DB_NAME < $BACKUP_FILE
  echo "✅ Database restored successfully!"
else
  echo "❌ Aborted."
fi
