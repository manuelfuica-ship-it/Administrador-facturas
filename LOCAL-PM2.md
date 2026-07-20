# DTE Chile App - Setup Local con PM2

## ¿Qué es PM2?

PM2 es un gestor de procesos que:
- Mantiene tu app corriendo 24/7
- Reinicia automáticamente si crashea
- Recarga código automáticamente si cambias archivos
- Genera logs

---

## 🚀 Inicio Rápido (2 pasos)

### Paso 1: Ejecutar script de inicio

```bash
cd /Users/manuelfuica/Library/CloudStorage/GoogleDrive-manuel.fuica@gmail.com/Mi\ unidad/Claude-Work/PROYECTOS/dte-chile-app

./start-local.sh
```

### Paso 2: Acceder a la app

```
http://localhost:3001
```

**¡Listo! 🎉**

---

## 📋 Comandos Útiles

### Ver estado
```bash
npx pm2 status
```

Muestra:
- ✅ online - App funcionando
- ❌ stopped - App detenida
- Uptime (cuánto tiempo lleva corriendo)
- CPU y memoria usada

### Ver logs en tiempo real
```bash
npx pm2 logs dte-app
```

Muestra errores, mensajes de la app, etc.

### Reiniciar app
```bash
npx pm2 restart dte-app
```

Útil si hiciste cambios en código.

### Detener app
```bash
npx pm2 stop dte-app
```

La app se detiene pero no se elimina de PM2.

### Eliminar de PM2
```bash
npx pm2 delete dte-app
```

Detiene y elimina de la lista de PM2.

### Ver todas las apps
```bash
npx pm2 list
```

Muestra todas las apps corriendo con PM2.

---

## 🔄 Flujo de Desarrollo

Mientras desarrollas:

```bash
# 1. Terminal 1: Iniciar app
./start-local.sh

# 2. Editar código (cualquier archivo en src/)
# PM2 detecta cambios automáticamente y reinicia

# 3. Si necesitas forzar reinicio
npx pm2 restart dte-app

# 4. Ver logs
npx pm2 logs dte-app
```

---

## 📊 Monitoreo

Ver CPU, memoria, uptime en tiempo real:

```bash
npx pm2 monit
```

Se abrirá un dashboard que actualiza cada segundo.

---

## 🐛 Troubleshooting

### App no inicia
```bash
npx pm2 logs dte-app
```

Verifica los errores en los logs.

### App usa mucha memoria
```bash
npx pm2 monit
```

Si usa >500MB, probablemente hay memory leak. Reinicia:
```bash
npx pm2 restart dte-app
```

### Quiero volver a desarrollo normal
```bash
npx pm2 delete dte-app
npm run dev
```

---

## ⚙️ Configuración (ecosystem.config.js)

El archivo `ecosystem.config.js` controla:

| Opción | Valor | Significado |
|--------|-------|-------------|
| `name` | dte-app | Nombre de la app en PM2 |
| `script` | npm | Comando a ejecutar |
| `args` | run dev | Argumentos del comando |
| `autorestart` | true | Reiniciar si crashea |
| `max_restarts` | 10 | Máximo intentos de reinicio |
| `watch` | src, public | Carpetas a monitorear |
| `output` | logs/out.log | Archivo de logs normales |
| `error` | logs/error.log | Archivo de errores |

---

## 📁 Archivos Generados

```
dte-chile-app/
├── ecosystem.config.js      # Configuración de PM2
├── start-local.sh           # Script de inicio
├── logs/
│   ├── out.log              # Output de la app
│   └── error.log            # Errores
└── .pm2/                     # Datos de PM2 (interno)
```

---

## 🌐 Acceso Remoto (misma red)

Si quieres acceder desde otra máquina en tu red local:

```bash
# Encontrar tu IP (Mac/Linux)
ipconfig getifaddr en0    # Si es WiFi
ipconfig getifaddr en1    # Si es Ethernet

# O en terminal
hostname -I
```

Luego accede desde otra PC:
```
http://[TU_IP]:3001

Ejemplo: http://192.168.1.100:3001
```

---

## 🔒 Seguridad Local

⚠️ **Advertencias:**

- PM2 sin protección = cualquiera en tu red puede parar/reiniciar app
- Los logs se guardan en texto plano (pueden contener info sensible)
- Supabase credentials están en `.env.local` (no commitar)
- No expongas puerto 3001 a internet sin firewall

---

## 💾 Backup de Configuración

Si necesitas guardar la configuración de PM2:

```bash
# Exportar configuración
npx pm2 save

# Restaurar después (útil si cambias PC)
npx pm2 resurrect
```

---

## 🎯 Resumen

```
./start-local.sh            # Inicia
npx pm2 status              # Ver estado
npx pm2 logs dte-app        # Ver errores
npx pm2 restart dte-app     # Reiniciar
npx pm2 stop dte-app        # Parar
npx pm2 delete dte-app      # Eliminar
```

**Tu app está 24/7 disponible sin hacer nada.**

---

**Versión:** 1.0
**Última actualización:** 2026-07-17
