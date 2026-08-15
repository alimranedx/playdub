#!/bin/sh
set -e

# Ensure .env exists
if [ ! -f .env ]; then
    cp .env.example .env
fi

# Run background initialization & start Laravel Queue Worker
(
    sleep 1
    php artisan key:generate --no-interaction --force
    php artisan migrate --force
    php artisan db:seed --class=LanguageSeeder --force
    php artisan storage:link || true
    echo "🚀 Starting Laravel Queue Worker..."
    php artisan queue:work --tries=3 --timeout=90 &
) &

# Start PHP-FPM immediately so Nginx can connect to port 9000 without 502 delay
exec php-fpm
