#!/bin/sh

echo "Provera konekcije na: $DB_HOST..."

# Koristimo --skip-ssl jer tvoj klijent ne prepoznaje --ssl-mode
until mysql -h"$DB_HOST" -u"$DB_USERNAME" -p"$DB_PASSWORD" --skip-ssl -e "select 1" > /dev/null 2>&1; do
    echo "Baza još nije dostupna (provera sa --skip-ssl)..."
    sleep 3
done

echo "Konekcija uspela! Pokrećem migracije..."
php artisan migrate --force
php artisan serve --host=0.0.0.0 --port=8000