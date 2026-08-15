#!/bin/sh
set -e

echo "--------------------------------------------------------"
echo "🚀 Initializing PlayDub Automated Docker Environment..."
echo "--------------------------------------------------------"

# Ensure .env exists
if [ ! -f .env ]; then
    cp .env.example .env
fi

# Generate App Key if missing
php artisan key:generate --no-interaction --force

# Run Migrations & Language Seeders automatically
php artisan migrate --force
php artisan db:seed --class=LanguageSeeder --force

# Storage symlink
php artisan storage:link || true

echo "--------------------------------------------------------"
echo "✅ PlayDub is Live & Ready on: http://localhost:8000"
echo "--------------------------------------------------------"

exec php-fpm
