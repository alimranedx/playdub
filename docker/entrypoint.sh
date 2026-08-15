#!/bin/sh
set -e

# Ensure .env exists
if [ ! -f .env ]; then
    cp .env.example .env
fi

# Run initialization in background so PHP-FPM starts listening immediately
(
    sleep 1
    php artisan key:generate --no-interaction --force
    php artisan migrate --force
    php artisan db:seed --class=LanguageSeeder --force
    php artisan storage:link || true
) &

# Start PHP-FPM immediately so Nginx can connect to port 9000 without 502 delay
exec php-fpm
