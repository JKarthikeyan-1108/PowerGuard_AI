#!/bin/bash
# PowerGuard Database Reset Script

echo "⚠️ WARNING: This will DROP the database and recreate it from scratch."
read -p "Are you sure you want to continue? [y/N]: " confirm

if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
  echo "🔄 Resetting database..."
  npx prisma db push --force-reset
  
  echo "🌱 Seeding database..."
  npx prisma db seed

  echo "✅ Database reset complete!"
else
  echo "❌ Aborted."
fi
