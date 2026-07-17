# Guía de Archivos - DTE Chile App

## 📂 Estructura de Directorios

```
dte-chile-app/
├── src/
│   ├── app/                    # Next.js App Router (frontend + api)
│   ├── api/                    # Integración con BaseAPI
│   ├── parser/                 # Parseo de XML
│   ├── renderer/               # Generación de PDF
│   ├── types/                  # Interfaces TypeScript
│   └── utils/                  # Funciones auxiliares
├── public/                     # Assets estáticos (si se agrega)
├── .env.example                # Template de variables de entorno
├── .gitignore                  # Archivos ignorados en git
├── package.json                # Dependencias y scripts
├── tsconfig.json               # Configuración TypeScript
├── next.config.js              # Configuración Next.js
├── tailwind.config.ts          # Configuración Tailwind CSS
├── postcss.config.js           # Configuración PostCSS
├── README.md                   # Documentación principal
├── QUICK-START.md              # Guía rápida de inicio
├── DEPLOYMENT.md               # Guía de despliegue
├── SETUP-CHECKLIST.md          # Checklist de configuración
├── IMPLEMENTATION-NOTES.md     # Notas técnicas de implementación
└── api-test.http               # Ejemplos de API calls

```

## 📄 Archivos de Configuración

### `package.json`
**Qué es:** Descriptor del proyecto Node.js
**Contiene:**
- Nombre, versión y descripción del proyecto
- Lista de dependencias (prod y dev)
- Scripts: `dev`, `build`, `start`, `lint`

**Cuándo modificar:**
- Agregar nuevas dependencias: usar `npm install`
- Cambiar versión: actualizar `version`

---

### `tsconfig.json`
**Qué es:** Configuración del compilador TypeScript
**Contiene:**
- Rutas de alias (`@/api/*`, `@/types/*`, etc.)
- Opciones de compilación (strict mode, etc.)
- Archivos incluidos/excluidos

**Cuándo modificar:**
- Agregar nuevas rutas de alias
- Cambiar nivel de validación TypeScript

---

### `next.config.js`
**Qué es:** Configuración de Next.js
**Contiene:**
- Modo React estricto
- Configuración de webpack para módulos Node

**Cuándo modificar:**
- Agregar middleware
- Configurar rewrites o redirects

---

### `tailwind.config.ts`
**Qué es:** Configuración de Tailwind CSS
**Contiene:**
- Contenido (dónde buscar clases Tailwind)
- Tema (colores, tipografía)
- Plugins

**Cuándo modificar:**
- Cambiar colores (theme.colors)
- Agregar fuentes personalizadas

---

### `.env.example`
**Qué es:** Template de variables de entorno
**Contiene:**
- `NEXT_PUBLIC_BASEAPI_URL` - URL del API de BaseAPI
- `BASEAPI_API_KEY` - Clave API de BaseAPI
- `SESSION_TIMEOUT` - Tiempo antes de expirar sesión
- `SESSION_SECRET` - Secreto para sesión

**Cómo usar:**
```bash
cp .env.example .env.local
# Editar .env.local con valores reales
```

**Nunca:** Commitear `.env.local` a Git

---

### `.gitignore`
**Qué es:** Archivos que Git ignora
**Contiene:**
- `/node_modules/` - Dependencias
- `/.env` y `/.env.local` - Variables sensibles
- `/.next/` - Build artifacts
- `.DS_Store` - Archivos macOS

---

## 📱 Frontend - Páginas React (src/app/)

### `app/page.tsx` - Pantalla de Login
**Ruta:** `/`
**Funciona:**
1. Formulario con campos RUT y Clave
2. Llamada a `authService.authenticate()`
3. Redirección a `/facturas` si éxito
4. Mostrar error si falla

**Componentes:**
- Input RUT
- Input Clave (password)
- Botón Ingresar
- Mensaje de error

**Modificaciones comunes:**
- Agregar logo: `<Image src="/logo.png" />`
- Cambiar colores: Editar clases Tailwind

---

### `app/facturas/page.tsx` - Listado de Facturas
**Ruta:** `/facturas`
**Funciona:**
1. Verifica autenticación
2. Carga DTEs del período seleccionado
3. Muestra tabla con resultados
4. Click en fila → detalle

**Componentes:**
- Selector de período (input month)
- Tabla con 7 columnas
- Botón "Ver" por fila
- Botón Salir

**Datos mostrados:**
- Folio, Tipo DTE, RUT Emisor, Razón Social
- Fecha, Monto, Acción

**Modificaciones comunes:**
- Agregar más filtros (RUT proveedor)
- Cambiar límite de resultados (línea `limite: 50`)

---

### `app/facturas/[folio]/page.tsx` - Detalle de Factura
**Ruta:** `/facturas/:folio`
**Funciona:**
1. Obtiene XML del DTE
2. Parsea XML a objeto TypeScript
3. Valida campos
4. Muestra detalle completo
5. Permite descargar PDF/XML

**Componentes:**
- Información Emisor
- Información Receptor
- Tabla de ítems
- Totales
- Botones de descarga

**Modificaciones comunes:**
- Cambiar layout (grid 2 → 3 columnas)
- Agregar más validaciones
- Mostrar más campos

---

### `app/layout.tsx` - Layout Raíz
**Qué es:** Wrapper de todas las páginas
**Contiene:**
- Metadata (título, descripción)
- CSS global
- Html y body tags

**Modificaciones comunes:**
- Cambiar favicon
- Agregar analytics
- Cambiar metadata por página

---

## 🔌 API Routes (src/app/api/)

### `api/generate-pdf/route.ts` - Generación de PDF
**Ruta:** `POST /api/generate-pdf`
**Input:** JSON con objeto DTE
**Output:** Buffer PDF (descargable)
**Funciona:**
1. Recibe DTE como JSON
2. Llama a `renderDTE()`
3. Retorna PDF con headers correctos

**Prueba:**
```bash
curl -X POST http://localhost:3000/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d @test-dte.json
```

---

## 📡 Integración con APIs (src/api/)

### `api/auth.ts` - Autenticación
**Funciones principales:**
- `authenticate(rut, clave)` - Login en BaseAPI
- `getSession()` - Obtener sesión actual
- `isAuthenticated()` - Verificar si hay sesión
- `logout()` - Cerrar sesión
- `getAuthHeader()` - Obtener header de autorización

**Flujo:**
```
User → authenticate() → BaseAPI → token
       ↓
    Session (30 min)
```

**Modificaciones:**
- Cambiar tiempo de expiración (1800000ms = 30min)
- Agregar refresh token

---

### `api/dte.ts` - Consulta de DTEs
**Funciones principales:**
- `getDTERecibidos(query)` - Listado por período
- `getDTEXml(folio)` - XML específico
- `getRegistroCompras(periodo)` - RCV completo

**Parámetros de query:**
- `periodo` - Formato AAAA-MM
- `filtroRut` - Filtrar por RUT proveedor
- `filtroFechaDesde` / `Hasta` - Rango de fechas
- `pagina`, `limite` - Paginación

---

### `api/contribuyente.ts` - Datos de Contribuyentes
**Funciones principales:**
- `getContribuyenteDatos(rut)` - Info de un proveedor

**Retorna:**
```typescript
{
  rut: string
  razonSocial: string
  giro: string
  direccion: string
  comuna: string
  // ... más campos
}
```

---

## 🔍 Parser (src/parser/)

### `parser/xmlParser.ts` - Conversión XML → TypeScript
**Funciones principales:**
- `parseXmlDte(xmlContent)` - Parse completo
- `validateDte(dte)` - Validar campos obligatorios

**Flujo:**
```
XML String
   ↓
Parser (fast-xml-parser)
   ↓
Objeto anidado
   ↓
Mapeo a interfaz DTE
   ↓
DTE tipado (TypeScript)
```

**Manejo de variaciones:**
- Diferentes estructuras de XML
- Campos opcionales vs obligatorios
- Valores null/undefined

---

## 🎨 Renderer (src/renderer/)

### `renderer/pdfRenderer.ts` - Generación de PDF
**Clase:** `DTEPDFRenderer`
**Método principal:** `render(dte) → Buffer`

**Métodos internos:**
- `renderHeader()` - Datos emisor (parte superior)
- `renderDocumentType()` - Recuadro tipo DTE
- `renderReceptorData()` - Datos receptor
- `renderDetailTable()` - Tabla de ítems
- `renderTotals()` - Subtotal, IVA, Total
- `renderReceiptAcknowledgment()` - Acuse (si aplica)
- `renderBarcode()` - Código PDF417

**Layout resultante:**
```
┌─ Emisor (derecha arriba) ─┐
│ Razón Social              │
│ Giro, Dirección           │
└──────────────────────────┘

┌─ Tipo Documento ─┐
│ FACTURA ELECTR.  │
│ Folio: 12345     │
└──────────────────┘

Receptor: RUT, Razón Social, Dirección...

┌─ Tabla Ítems ─────────────────────────┐
│ Cant | Unid | Descrip | Precio | Total │
├───────────────────────────────────────┤
│  1   | UN   | Prod A  | 50,000 | 50,000│
└───────────────────────────────────────┘

                        Neto:   100,000
                        IVA:     19,000
                        TOTAL:  119,000

┌─ Acuse de Recibo ─┐
│ Nombre: ________  │
└───────────────────┘

[PDF417 Timbre]
```

---

### `renderer/pdf417Generator.ts` - Código de Barras
**Funciones principales:**
- `generateBarcode(data)` → Buffer PDF
- `embedBarcode(doc, tedData, x, y)` - Insertar en PDF
- `formatTED(tedXml)` → String formateado

**Nota:** Versión 1.0 usa texto. Mejora futura: librería binaria real.

---

## 📊 Tipos (src/types/)

### `types/dte.ts` - Interfaces TypeScript
**Interfaces:**
- `DTE` - Documento completo
- `DTEItem` - Línea de detalle
- `DTEListItem` - Resumen para tabla
- `AuthSession` - Sesión activa
- `ApiResponse<T>` - Respuesta genérica

**Uso:**
```typescript
import { DTE, DTEItem } from '@/types/dte';

const dte: DTE = {
  tipoDTE: 33,
  folio: 12345,
  // ...
};
```

---

## 🛠️ Utilidades (src/utils/)

### `utils/format.ts` - Funciones de Formato
**Funciones disponibles:**
- `formatCurrency(amount)` - Formato dinero CLP
- `formatRUT(rut)` - Formato RUT con dígito verificador
- `validateRUT(rut)` - Validar RUT (calcula DV)
- `formatDate(dateString)` - Formato fecha local
- `getDTETypeName(tipoDTE)` - Nombre tipo documento
- `calculateIVA(monto, tasa)` - Calcular IVA

**Uso:**
```typescript
import { formatCurrency, formatRUT } from '@/utils/format';

const monto = formatCurrency(119000);  // "$119.000"
const rut = formatRUT("123456789");    // "12.345.678-9"
```

---

## 📚 Documentación

### `README.md`
- Descripción general
- Características
- Instalación
- Uso
- Stack técnico
- Troubleshooting

### `QUICK-START.md`
- Setup en 5 minutos
- Testing manual
- Próximos pasos opcionales

### `DEPLOYMENT.md`
- Opciones de hosting (Vercel, Railway, VPS)
- Configuración de seguridad
- Monitoring
- Rollback plan

### `IMPLEMENTATION-NOTES.md`
- Estadísticas del proyecto
- Decisiones de diseño
- Limitaciones conocidas
- Mejoras futuras
- Security considerations

### `SETUP-CHECKLIST.md`
- Checklist paso a paso
- Pre-requisitos
- Testing básico
- Validación final

### `FILE-GUIDE.md` (Este archivo)
- Guía detallada de cada archivo
- Cuándo modificar
- Ejemplos de uso

---

## 🔄 Flujo de Datos

```
Frontend (React)
     ↓ (formulario login)
  auth.ts
     ↓ (RUT + clave)
  BaseAPI
     ↓ (token)
  AuthService (memoria)
     ↓ (GET /dte/recibidos)
  dte.ts
     ↓ (lista de DTEs)
  Facturas List
     ↓ (click en DTE)
  detail/[folio]
     ↓ (GET /dte/recibidos/:folio)
  dte.ts
     ↓ (XML)
  xmlParser.ts
     ↓ (DTE tipado)
  pdfRenderer.ts
     ↓ (PDF Buffer)
  /api/generate-pdf
     ↓ (download)
  Usuario descarga PDF
```

---

## 📝 Convenciones del Código

- **Archivos:** `camelCase.ts` (no `kebab-case`)
- **Carpetas:** `lowercase`
- **Interfaces:** `PascalCase`
- **Variables:** `camelCase`
- **Constantes:** `UPPER_SNAKE_CASE`
- **Componentes React:** `PascalCase.tsx`

---

## 🔗 Dependencias Principales

| Paquete | Para Qué |
|---------|----------|
| `next` | Framework full-stack |
| `axios` | HTTP client |
| `fast-xml-parser` | Parse XML |
| `pdfkit` | Generar PDF |
| `react` | UI Components |
| `tailwindcss` | Estilos |
| `typescript` | Type safety |

---

**Preguntas frecuentes:**
- ¿Dónde agrego un nuevo endpoint? → `src/app/api/mi-endpoint/route.ts`
- ¿Dónde agrego una nueva página? → `src/app/nueva-pagina/page.tsx`
- ¿Dónde agrego tipos? → `src/types/dte.ts`
- ¿Dónde agrego validaciones? → `src/parser/xmlParser.ts`

---

**Last Updated:** Julio 2026
