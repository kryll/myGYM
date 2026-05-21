#!/bin/bash
# myGYM - Script de despliegue para Plesk Obsidian
# Ejecutar desde el directorio raíz del proyecto

set -e

echo "🏋️ myGYM - Iniciando despliegue en Plesk..."

# Variables
PHP_BIN=${PHP_BIN:-/usr/bin/php8.3}
COMPOSER_BIN=${COMPOSER_BIN:-/usr/bin/composer}
NPM_BIN=${NPM_BIN:-/usr/bin/npm}
WEB_ROOT=${WEB_ROOT:-$(pwd)/public}

echo "📦 Instalando dependencias del backend..."
cd backend
$COMPOSER_BIN install --no-dev --optimize-autoloader

echo "🔑 Generando clave de aplicación..."
$PHP_BIN artisan key:generate --force

echo "🗄️ Ejecutando migraciones..."
$PHP_BIN artisan migrate --force

echo "🌱 Ejecutando seeders..."
$PHP_BIN artisan db:seed --force

echo "⚡ Optimizando..."
$PHP_BIN artisan config:cache
$PHP_BIN artisan route:cache
$PHP_BIN artisan view:cache
$PHP_BIN artisan event:cache

echo "🔗 Creando enlace de almacenamiento..."
$PHP_BIN artisan storage:link

cd ..

echo "🎨 Construyendo frontend..."
cd frontend
$NPM_BIN install
$NPM_BIN run build

echo "📁 Copiando build al directorio público..."
cp -r dist/* ../backend/public/

cd ..

echo "🔒 Configurando permisos..."
chmod -R 775 backend/storage
chmod -R 775 backend/bootstrap/cache

echo "✅ ¡Despliegue completado!"
echo ""
echo "📋 Pasos siguientes:"
echo "1. Configura el directorio raíz web en Plesk: $(pwd)/backend/public"
echo "2. Configura el archivo .env con tus credenciales"
echo "3. Configura el cron job para Laravel Scheduler:"
echo "   * * * * * $PHP_BIN $(pwd)/backend/artisan schedule:run >> /dev/null 2>&1"
echo "4. Configura el proceso Reverb (WebSocket) como servicio"
