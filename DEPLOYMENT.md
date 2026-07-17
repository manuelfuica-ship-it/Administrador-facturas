# Guía de Despliegue - DTE Chile App

## Opciones de Despliegue

### 1. Vercel (Recomendado para Next.js)

**Ventajas:**
- Despliegue automático desde GitHub
- HTTPS por defecto
- Escalabilidad automática
- Free tier disponible

**Pasos:**

1. Crear cuenta en https://vercel.com
2. Conectar repositorio GitHub
3. Configurar variables de entorno en Vercel Dashboard:
   - `NEXT_PUBLIC_BASEAPI_URL`
   - `BASEAPI_API_KEY`
   - `SESSION_SECRET`
   - `NODE_ENV=production`

4. Deploy automático se activa con cada push a `main`

### 2. Railway

**Ventajas:**
- PostgreSQL/SQLite incluidos
- Fácil integración con GitHub
- Precios competitivos

**Pasos:**

1. Conectar repositorio en https://railway.app
2. Railway detectará Next.js automáticamente
3. Agregar variables de entorno
4. Deploy automático

### 3. Auto-hospedaje (VPS/Servidor)

**Requisitos:**
- Node.js 20 LTS instalado
- Servidor web (Nginx/Apache)
- SSL/TLS (Let's Encrypt)

**Pasos:**

```bash
# En el servidor
git clone <repo>
cd dte-chile-app
npm install
npm run build

# Crear archivo .env.production
# Editar con valores de producción

# Usar PM2 o systemd para mantener la app corriendo
npm install -g pm2
pm2 start "npm start" --name "dte-chile"
pm2 startup
pm2 save
```

**Nginx Config ejemplo:**
```nginx
server {
    listen 443 ssl http2;
    server_name tudominio.com;

    ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Seguridad en Producción

### 1. HTTPS Obligatorio
```env
NEXT_PUBLIC_BASEAPI_URL=https://api.baseapi.cl/v1
```

### 2. Headers de Seguridad
El app incluye:
- CSP (Content Security Policy)
- X-Frame-Options
- X-Content-Type-Options
- HSTS (en Vercel automático)

### 3. Gestión de Credenciales
- **NUNCA** guardar credenciales SII en código
- Usar variables de entorno para API keys
- Tokens de sesión con expiración automática

### 4. Rate Limiting
Implementar en reverse proxy (Nginx):
```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

location /api/ {
    limit_req zone=api_limit burst=20 nodelay;
    proxy_pass http://localhost:3000;
}
```

### 5. Monitoring
Recomendado:
- Sentry.io para error tracking
- DataDog o similar para métricas
- CloudFlare para DDoS protection

## Variables de Entorno Producción

```env
# BaseAPI
NEXT_PUBLIC_BASEAPI_URL=https://api.baseapi.cl/v1
BASEAPI_API_KEY=<api_key_aqui>

# Session
SESSION_SECRET=<cadena_random_32_chars_minimo>
NEXT_PUBLIC_SESSION_TIMEOUT=1800000

# Environment
NODE_ENV=production

# Opcional: Sentry
NEXT_PUBLIC_SENTRY_DSN=<sentry_dsn>

# Opcional: Analytics
NEXT_PUBLIC_GA_ID=<google_analytics_id>
```

## Performance Optimization

1. **Image Optimization**
   - Next.js optimiza automáticamente
   
2. **Code Splitting**
   - Next.js lo hace por defecto

3. **Database Cache** (Opcional)
   - Agregar SQLite para cachear DTEs consultados
   - Reducir llamadas a BaseAPI

4. **CDN**
   - Vercel/Railway incluyen CDN global
   - Vercel recomendado para máxima performance

## Monitoring & Maintenance

### Logs
```bash
# Ver logs en tiempo real (PM2)
pm2 logs dte-chile

# Archivos de log
tail -f /var/log/dte-chile/*.log
```

### Actualizaciones
```bash
# Traer cambios
git pull origin main

# Reinstalar dependencias
npm install

# Rebuild
npm run build

# Reiniciar (PM2)
pm2 restart dte-chile
```

### Backups (si usa SQLite local)
```bash
# Backup diario a las 2 AM
0 2 * * * cp /app/dte_cache.db /backups/dte_cache_$(date +\%Y\%m\%d).db
```

## Troubleshooting

### App no inicia
```bash
# Ver error detallado
npm run dev

# Verificar variables de entorno
cat .env.local | grep BASEAPI
```

### Conexión a BaseAPI falla
- Verificar API Key es válida
- Revisar https://baseapi.cl/docs status
- Confirmar firewall permite salida a HTTPS

### PDFs muy grandes
- Revisar montos no tengan caracteres especiales
- Limitar items a max 50 por documento

## Certificados SSL

### Let's Encrypt (Gratuito)
```bash
# Instalación
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot certonly --nginx -d tudominio.com

# Renovación automática
sudo certbot renew --dry-run
```

## Respaldo del Repositorio a GitHub

```bash
# Crear repo en GitHub sin archivos sensibles
git init
git add . -p  # Review interactivo
git commit -m "Initial commit"
git remote add origin https://github.com/usuario/dte-chile-app.git
git push -u origin main

# Asegurar .env.example existe pero .env.local NO
echo ".env.local" >> .gitignore
```

## Rollback Plan

Si algo falla en producción:
```bash
# Ver historial
git log --oneline

# Volver a versión anterior
git revert <commit_hash>
git push origin main

# O hacer reset (más drástico)
git reset --hard <commit_hash>
git push --force-with-lease origin main
```

---

**Último actualizado:** Julio 2026

Para soporte técnico, ver README.md o contactar al equipo de desarrollo.
