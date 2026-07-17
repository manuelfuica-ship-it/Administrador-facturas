# Quick Start - DTE Chile App

## 1️⃣ Setup Inicial (5 minutos)

```bash
# Clonar (o ya estás en el directorio)
cd dte-chile-app

# Instalar dependencias
npm install

# Copiar configuración
cp .env.example .env.local
```

## 2️⃣ Configurar BaseAPI (2 minutos)

1. Ir a https://baseapi.cl
2. Registrarse y obtener API Key
3. Editar `.env.local`:
```env
BASEAPI_API_KEY=tu_api_key_aqui
```

## 3️⃣ Ejecutar Localmente (1 minuto)

```bash
npm run dev
```

Abrir: http://localhost:3000

## 4️⃣ Testing

### Login
- RUT: Tu RUT con clave tributaria del SII
- Clave: Tu clave tributaria del SII

### Ver Facturas
- Seleccionar período (mes)
- Botón "Buscar"

### Descargar PDF
- Hacer clic en factura
- Botón "Descargar PDF"

## 📁 Estructura Creada

```
dte-chile-app/
├── src/
│   ├── app/                  # Páginas Next.js (App Router)
│   │   ├── page.tsx         # Login
│   │   ├── facturas/        # Listado
│   │   ├── api/             # Backend API
│   │   └── layout.tsx       # Raíz
│   ├── api/                  # Integración con BaseAPI
│   ├── parser/               # Parseo XML → TypeScript
│   ├── renderer/             # Generación PDF
│   └── types/                # Interfaces TS
├── public/                   # Assets estáticos
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── README.md
├── DEPLOYMENT.md
└── api-test.http
```

## 🔧 Próximos Pasos Opcionales

### 1. Agregar Logo de Empresa
En `src/renderer/pdfRenderer.ts`, método `renderHeader()`:
```typescript
doc.image('./logo.png', leftX, currentY, { width: 50 });
```

### 2. Cambiar Tema de UI
En `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      primary: '#003366', // tu color
    }
  }
}
```

### 3. Agregar Base de Datos Local
```bash
npm install prisma sqlite
npx prisma init
```

### 4. Implementar Login Persistente
En `src/api/auth.ts`, agregar localStorage:
```typescript
if (typeof window !== 'undefined') {
  localStorage.setItem('session', JSON.stringify(this.session));
}
```

### 5. Desplegar a Vercel
```bash
npm install -g vercel
vercel
```

Seguir prompts y configurar env vars en dashboard.

## 🐛 Troubleshooting

### Error: "Cannot find module 'fast-xml-parser'"
```bash
npm install fast-xml-parser
```

### Error: "BASEAPI_API_KEY is not defined"
- Verificar `.env.local` existe
- Restart dev server: `npm run dev`

### Error: "No authenticated session"
- RUT o clave incorrectos
- BaseAPI API Key inválida
- Sesión expiró (30 min)

### Página en blanco
- Abrir DevTools (F12)
- Ver errores en Console
- Check Network tab

## 📊 Performance

PDF generado:
- ✅ Típico: 50-150 KB
- ⚠️ Límite: 500 KB

Si excede:
- Reducir fuentes
- Limitar items a 30 max
- Ver `src/renderer/pdfRenderer.ts`

## 🚀 Deploy Más Rápido

### A Vercel (1 minuto)
```bash
npx vercel
```

### A Production
```bash
npm run build
npm start
```

## 📚 Documentación

| Archivo | Contenido |
|---------|-----------|
| README.md | Features, instalación, estructura |
| DEPLOYMENT.md | Opciones de hosting, seguridad |
| QUICK-START.md | Este archivo |
| api-test.http | Ejemplos de API calls |

## ✅ Checklist Inicial

- [ ] `npm install` ejecutado
- [ ] `.env.local` configurado
- [ ] BaseAPI API Key obtenida
- [ ] `npm run dev` sin errores
- [ ] Login page visible en http://localhost:3000
- [ ] Puedo loguearme
- [ ] Veo listado de facturas
- [ ] Puedo descargar PDF

¡Listo! 🎉

---

**Nota:** Para producción, leer `DEPLOYMENT.md` completamente.
