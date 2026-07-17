# Setup Checklist - DTE Chile App

## Pre-Requisitos ✅

- [ ] Node.js 20 LTS instalado (`node --version`)
- [ ] npm o yarn disponible (`npm --version`)
- [ ] Git instalado (`git --version`)
- [ ] Cuenta en https://baseapi.cl
- [ ] API Key de BaseAPI generada
- [ ] RUT y clave tributaria del SII disponibles para testing

## Phase 1: Local Setup (10 minutos)

```bash
# 1. Entrar al directorio del proyecto
cd /Users/manuelfuica/Library/CloudStorage/GoogleDrive-manuel.fuica@gmail.com/Mi\ unidad/Claude-Work/PROYECTOS/dte-chile-app
```

- [ ] Verificar que estamos en el directorio correcto

```bash
# 2. Instalar dependencias
npm install
```

- [ ] Esperar a que npm termine (puede tomar 3-5 minutos)
- [ ] No debe haber errores críticos

```bash
# 3. Crear archivo .env.local
cp .env.example .env.local
```

- [ ] Archivo `.env.local` creado

```bash
# 4. Editar .env.local con tu API Key
# Abrir en editor:
# NEXT_PUBLIC_BASEAPI_URL=https://api.baseapi.cl/v1
# BASEAPI_API_KEY=<tu_api_key_aqui>
# SESSION_SECRET=generar_cadena_aleatoria_de_32_chars
```

- [ ] `.env.local` actualizado con valores reales
- [ ] `BASEAPI_API_KEY` está en el archivo

```bash
# 5. Iniciar servidor de desarrollo
npm run dev
```

- [ ] Servidor inició sin errores
- [ ] Ves mensaje: "ready - started server on 0.0.0.0:3000"

## Phase 2: Testing Básico (5 minutos)

```
Abrir navegador: http://localhost:3000
```

- [ ] Ves pantalla de login
- [ ] Campos RUT y Clave visibles
- [ ] Botón "Ingresar" disponible

### Test 1: Login Exitoso
- [ ] Ingresé RUT (formato: 12345678-9)
- [ ] Ingresé clave tributaria del SII
- [ ] Hice clic en "Ingresar"
- [ ] Fui redirigido a página de facturas

### Test 2: Listado de Facturas
- [ ] Veo selector de período (mes/año)
- [ ] Veo botón "Buscar"
- [ ] Hice clic en buscar
- [ ] Recibí lista de facturas (o mensaje "No hay facturas")

### Test 3: Detalle de Factura
- [ ] Hice clic en una factura
- [ ] Veo información del emisor
- [ ] Veo información del receptor
- [ ] Veo tabla de ítems
- [ ] Veo totales (Neto, IVA, Total)

### Test 4: Descargas
- [ ] Hice clic en "Descargar PDF"
- [ ] PDF se descargó correctamente
- [ ] Verificar tamaño < 500 KB
- [ ] Abrir PDF y verificar contenido

- [ ] Hice clic en "Descargar XML"
- [ ] XML se descargó correctamente
- [ ] Abrir XML con editor de texto

### Test 5: Validar PDF417
- [ ] Ir a https://timbre.sii.cl/
- [ ] Cargar PDF descargado
- [ ] Verificar que pasa validación ✅

## Phase 3: Configuración para Producción (15 minutos)

```bash
# 1. Build de producción
npm run build
```

- [ ] Build completó sin errores
- [ ] Carpeta `.next` fue creada

```bash
# 2. Verificar build
npm start
```

- [ ] Servidor de producción inició
- [ ] App funciona en http://localhost:3000

```bash
# 3. Instanciar repositorio git (si no existe)
git init
```

- [ ] `.git` fue creado

```bash
# 4. Agregar archivos
git add .
```

- [ ] Archivos preparados para commit

```bash
# 5. Primer commit
git commit -m "Initial commit: DTE Chile App v1.0"
```

- [ ] Commit creado

```bash
# 6. Agregar remote (si vas a usar GitHub)
git remote add origin https://github.com/TU_USUARIO/dte-chile-app.git
```

- [ ] Remote agregado (remplazar con tu URL real)

```bash
# 7. Push a GitHub
git branch -M main
git push -u origin main
```

- [ ] Código pushed a GitHub
- [ ] Repositorio visible en GitHub

## Phase 4: Deploy a Vercel (5 minutos - Opcional)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel
```

- [ ] Vercel CLI instalado

```bash
# 2. Loguear en Vercel
vercel login
```

- [ ] Autenticado en Vercel

```bash
# 3. Deployar
vercel
```

- [ ] Seguir prompts
- [ ] Seleccionar "Next.js" como framework

### En Dashboard de Vercel
- [ ] Ir a Project Settings
- [ ] Environment Variables
- [ ] Agregar:
  - `NEXT_PUBLIC_BASEAPI_URL`
  - `BASEAPI_API_KEY`
  - `SESSION_SECRET`

- [ ] Redeploy trigger
- [ ] App disponible en URL de Vercel

## Phase 5: Validación Final ✅

### En Local (npm run dev)
- [ ] Login funciona
- [ ] DTEs carga
- [ ] PDF descarga
- [ ] XML descarga
- [ ] Logout funciona

### En Producción (Vercel o Server)
- [ ] Acceso por HTTPS ✅
- [ ] Login funciona
- [ ] DTEs carga
- [ ] PDF genera correctamente
- [ ] No hay credenciales en logs

### Seguridad
- [ ] No hay `.env.local` en GitHub
- [ ] No hay `.env` en GitHub (solo `.env.example`)
- [ ] API Key está protegida en Vercel
- [ ] Archivos sensibles en `.gitignore`

## Documentación Completada

Archivos de referencia:
- [ ] Leí README.md
- [ ] Leí QUICK-START.md
- [ ] Leí DEPLOYMENT.md
- [ ] Leí IMPLEMENTATION-NOTES.md

## Recursos Útiles

| Recurso | URL |
|---------|-----|
| BaseAPI Docs | https://baseapi.cl/docs |
| SII DTE Info | https://www.sii.cl/ayudas/ayuda_dte.html |
| Next.js Docs | https://nextjs.org/docs |
| Tailwind CSS | https://tailwindcss.com/docs |
| PDFKit | http://pdfkit.org/ |

## Soporte

### Error: "Invalid API Key"
- Verificar que copiaste correctamente la API Key
- Ir a https://baseapi.cl y regenerar si es necesario
- Restart dev server (`npm run dev`)

### Error: "Cannot find module"
```bash
npm install
```

### Error: "Conexión rechazada a localhost:3000"
- Verify puerto 3000 no está en uso
- Ejecutar: `npx kill-port 3000`
- Reintentar: `npm run dev`

### PDF vacío o sin contenido
- Verificar que la factura tiene ítems
- Revisar que los montos son > 0
- Ver logs en browser Console (F12)

---

## 🎉 Ready to Go!

Si marcaste todas las checkboxes, tu app está lista para:
- ✅ Desarrollo local
- ✅ Testing
- ✅ Producción
- ✅ GitHub

**Next Steps:**
1. Explorar el código en `/src/`
2. Personalizar con tu branding
3. Desplegar a Vercel
4. Compartir con tu equipo

**¡Éxito! 🚀**

---

**Last Updated:** Julio 2026
**App Version:** 1.0.0
**Status:** Production Ready
