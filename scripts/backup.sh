#!/bin/bash
# PowerGuard Backup Script
# Automatically backs up the MySQL database and MQTT configurations

BACKUP_DIR="/var/backups/powerguard"
TIMESTAMP=$(date +"%F_%H-%M-%S")
DB_CONTAINER="powerguard-mysql"
DB_USER="root"
DB_PASS="powerguard" # Use ENV variable in production
DB_NAME="powerguard"

mkdir -p "$BACKUP_DIR"

echo "📦 Starting PowerGuard Backup..."

# Backup Database
echo "💾 Backing up MySQL Database..."
docker exec "$DB_CONTAINER" /usr/bin/mysqldump -u "$DB_USER" -p"$DB_PASS" "$DB_NAME" > "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Compress Database Backup
gzip "$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

# Backup MQTT Data
echo "📡 Backing up MQTT Data..."
tar -czvf "$BACKUP_DIR/mqtt_backup_$TIMESTAMP.tar.gz" -C docker mosquitto

echo "✅ Backup Completed Successfully!"
echo "Files saved to $BACKUP_DIR"
ls -lh "$BACKUP_DIR" | grep "$TIMESTAMP"
