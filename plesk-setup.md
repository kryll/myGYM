# myGYM - Configuración en Plesk Obsidian

## Requisitos del servidor
- PHP 8.2+
- MySQL 8.0+
- Node.js 18+
- Redis (opcional pero recomendado)
- SSL/HTTPS habilitado

## Pasos de instalación

### 1. Configurar el dominio en Plesk
1. Crear un nuevo dominio/subdominio en Plesk
2. En "Configuración del alojamiento", establecer:
   - Raíz del documento: `/httpdocs/backend/public`
   - Versión PHP: 8.2+
   - Habilitar Node.js

### 2. Subir archivos
```bash
git clone https://github.com/tu-repo/myGYM.git /var/www/vhosts/tudominio.com/httpdocs
```

### 3. Configurar variables de entorno
```bash
cp backend/.env.example backend/.env
nano backend/.env  # Editar con tus valores
```

### 4. Ejecutar el script de despliegue
```bash
bash deploy-plesk.sh
```

### 5. Configurar Cron Job en Plesk
En Plesk > Tareas programadas, añadir:
```
* * * * * /usr/bin/php8.3 /var/www/vhosts/tudominio.com/httpdocs/backend/artisan schedule:run >> /dev/null 2>&1
```

### 6. Configurar WebSockets (Laravel Reverb)
En Plesk > Node.js, configurar:
- Archivo de inicio: `backend/artisan`
- Argumento: `reverb:start`

O usar un servicio systemd:
```ini
[Unit]
Description=myGYM Reverb WebSocket Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/vhosts/tudominio.com/httpdocs/backend
ExecStart=/usr/bin/php8.3 artisan reverb:start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

### 7. Configurar HTTPS y proxy WebSocket
En el `.htaccess` de Apache o config de Nginx, añadir proxy para WebSocket:
```nginx
location /app/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
}
```

## Estructura del proyecto
```
myGYM/
├── backend/          # Laravel 11 API + Backend
│   ├── app/
│   ├── database/
│   ├── public/       # <-- Web root de Plesk
│   └── ...
├── frontend/         # React 18 + TypeScript
│   ├── src/
│   └── dist/         # Build → copia a backend/public/
├── deploy-plesk.sh   # Script de despliegue
└── docker-compose.yml # Para desarrollo local
```

## Multi-tenant
El sistema soporta múltiples tenants (gimnasios/entrenadores). 
Cada tenant tiene su propio subdominio: `tenant1.tudominio.com`

Para añadir un tenant nuevo:
```bash
php artisan tenant:create "Nombre del Gym" "tenant-slug"
```

## Integración Claude API
1. Obtener API key en https://console.anthropic.com
2. Añadir al `.env`: `CLAUDE_API_KEY=sk-ant-...`
3. El modelo por defecto es `claude-sonnet-4-6`

## Dispositivos
### Báscula Xiaomi Mi Scale
- Conexión vía Web Bluetooth API (requiere HTTPS)
- Compatible con: Mi Body Composition Scale 2 (MIBCS)
- Los datos se sincronizan automáticamente al conectar

### Amazfit Active / Zepp
- Configurar credenciales Zepp en el perfil
- La sincronización es cada 30 minutos
- Registra: pasos, frecuencia cardíaca, calorías, sueño
