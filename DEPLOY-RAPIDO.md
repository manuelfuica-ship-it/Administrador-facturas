# Deploy Rápido a Vercel - 5 minutos

## ✅ Checklist Previo

- [ ] Repositorio GitHub actualizado: `main` branch
- [ ] Supabase proyecto creado
- [ ] Schema v2 ejecutado en Supabase
- [ ] BaseAPI key disponible (opcional)

---

## 🚀 Paso 1: Ir a Vercel

1. Abre https://vercel.com/new
2. Elige: "Continue with GitHub"
3. Autoriza a Vercel acceder a tus repositorios

---

## 📦 Paso 2: Seleccionar Repositorio

1. Busca: `Administrador-facturas`
2. Click: "Import"
3. Vercel detectará Next.js automáticamente ✅

---

## 🔧 Paso 3: Configurar Variables de Entorno

En la pantalla de configuración, copia estas variables:

### Supabase
```
NEXT_PUBLIC_SUPABASE_URL = https://jxvzwidkatsnnmgonrhg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = sb_publishable_568Cg26wuVe4zfIr_bn9PQ_3T-ZxkL5
```

### BaseAPI (obtener en https://baseapi.cl)
```
NEXT_PUBLIC_BASEAPI_URL = https://api.baseapi.cl/v1
BASEAPI_API_KEY = <tu_key_aqui>
```

### Otros
```
NEXT_PUBLIC_SESSION_TIMEOUT = 1800000
SESSION_SECRET = <generar_abajo>
NODE_ENV = production
```

### Generar SESSION_SECRET:
En terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copia el output y pégalo en `SESSION_SECRET`

---

## ✨ Paso 4: Deploy

1. Click: "Deploy"
2. Espera 2-3 minutos
3. ¡Listo! Tu app está en producción 🎉

**URL:** `https://administrador-facturas.vercel.app` (o tu dominio personalizado)

---

## 🔄 Próximas Veces

Para futuros deploys:
- Solo haz `git push origin main`
- Vercel redeploya automáticamente
- No necesitas hacer nada más

---

## 🆘 Troubleshooting

**Error: Variables de entorno no encontradas**
→ Verifica que estén en Vercel Dashboard → Settings → Environment Variables

**Error: Supabase connection failed**
→ Verifica que `NEXT_PUBLIC_SUPABASE_URL` y `ANON_KEY` sean correctos

**Error: Build failed**
→ Revisa logs en Vercel Dashboard → Deployments → [último deployment]

---

## 📊 Monitoreo Post-Deploy

Después del deploy, prueba:

1. **Login:** Verifica que Supabase Auth funciona
   - Email: `testuser@mdscasinos.local`
   - Contraseña: `Test123456`

2. **Select-Company:** Debe mostrar empresa asignada

3. **Facturas:** Debe cargar datos (mock o reales)

4. **Settings:** Prueba configurar credenciales SII

---

## 🎯 Resumen

```
GitHub → Vercel → 2 min → ¡En Producción!
```

**Que disfrutes tu aplicación en producción 🚀**
