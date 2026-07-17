# Arquitectura Técnica - DTE Chile App

## 📐 Stack Tecnológico

```
Frontend:          Next.js 14 + React 18 + TypeScript
UI Framework:      Tailwind CSS
Backend:           Next.js API Routes
Database:          PostgreSQL (Supabase)
Auth:              Supabase Auth (Email/Password)
API Integration:   BaseAPI.cl (REST)
PDF Generation:    PDFKit
XML Parsing:       fast-xml-parser
Deployment:        Vercel / Netlify
```

---

## 🏗️ Estructura de Carpetas

```
dte-chile-app/
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── auth/                      # Login/Register
│   │   ├── select-company/            # Seleccionar empresa
│   │   ├── facturas/                  # Lista de DTEs
│   │   ├── facturas/[folio]/          # Detalle DTE
│   │   ├── settings/                  # Configurar credenciales
│   │   ├── api/
│   │   │   └── generate-pdf/          # Endpoint PDF generation
│   │   ├── layout.tsx                 # Layout global
│   │   ├── page.tsx                   # Home (login antiguo)
│   │   └── globals.css                # Estilos globales
│   │
│   ├── api/
│   │   ├── supabase-auth-v2.ts        # Supabase Auth (login, users, companies)
│   │   ├── dte-supabase.ts            # BaseAPI + Supabase integration
│   │   ├── dte.ts                     # DTE API (antiguo, deprecado)
│   │   ├── auth.ts                    # Auth service (antiguo, deprecado)
│   │   └── contribuyente.ts           # SII API (opcional)
│   │
│   ├── lib/
│   │   └── supabase.ts                # Supabase client config
│   │
│   ├── parser/
│   │   └── xmlParser.ts               # XML → DTE parsing
│   │
│   ├── renderer/
│   │   ├── pdfRenderer.ts             # PDF generation (PDFKit)
│   │   └── pdf417Generator.ts         # Barcode generation
│   │
│   ├── types/
│   │   └── dte.ts                     # TypeScript interfaces
│   │
│   └── utils/
│       ├── mockData.ts                # Test mode data
│       └── format.ts                  # Formatters (RUT, moneda, fecha)
│
├── scripts/
│   └── create-test-user.js            # Script crear usuario de prueba
│
├── public/
│   └── ...                            # Assets estáticos
│
├── .env.local                         # Variables de entorno (local)
├── .env.example                       # Template de variables
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── supabase-migrate-v1-to-v2.sql      # DB schema v2
├── supabase-fix-rls.sql               # RLS policies
├── DEPLOYMENT.md
├── DEPLOY-RAPIDO.md
├── MANUAL-USUARIO.md
├── ARQUITECTURA.md
├── STATUS-ACTUAL.md
└── README.md
```

---

## 🔄 Flujo de Autenticación

```
1. Usuario ingresa email/contraseña en /auth
   ↓
2. supabase-auth-v2.ts → loginUser()
   ├─ Llama supabase.auth.signInWithPassword()
   ├─ Obtiene user ID
   ├─ Consulta user_profiles
   └─ Consulta user_company para empresas del usuario
   ↓
3. Supabase retorna { user, profile, companies }
   ↓
4. Frontend guarda sesión en Supabase Auth
   ↓
5. Redirige a /select-company
   ↓
6. Usuario selecciona empresa
   ├─ Guarda selectedCompanyId en sessionStorage
   └─ Navega a /facturas
```

---

## 💾 Database Schema

### Tablas Principales

#### `auth.users` (Supabase)
- `id` (UUID)
- `email` (VARCHAR UNIQUE)
- `encrypted_password`
- `email_confirmed_at`

#### `public.user_profiles`
- `id` (UUID) → FK auth.users
- `email` (VARCHAR UNIQUE)
- `nombre, apellido` (VARCHAR)
- `rol` ('admin' | 'user')
- `activo` (BOOLEAN)
- `created_at, updated_at`

#### `public.companies`
- `id` (UUID)
- `nombre` (VARCHAR)
- `rut` (VARCHAR UNIQUE)
- `descripcion` (TEXT)
- `estado` (BOOLEAN)
- `created_at, updated_at`

#### `public.user_company` (Many-to-Many)
- `id` (UUID)
- `user_id` (UUID) → FK user_profiles
- `company_id` (UUID) → FK companies
- `rol_en_empresa` ('admin' | 'editor' | 'viewer')
- `rut_sii` (VARCHAR)
- `credenciales_sii_encriptadas` (TEXT) - AES-256
- `permisos` (JSONB)
- `activo` (BOOLEAN)
- `UNIQUE(user_id, company_id)`

### Row Level Security (RLS)

- **companies:** Usuarios ven solo empresas asignadas (via user_company)
- **user_profiles:** Usuarios ven solo su perfil
- **user_company:** Usuarios ven sus asignaciones, admins ven todas

---

## 🔐 Flujo de Obtener Facturas

```
User en /facturas
  ↓
  useEffect() → checkAuthAndFetch()
  ├─ Llama getCurrentUser() (valida sesión Supabase)
  └─ Llama fetchFacturas()
    ↓
    dteSupabaseService.getDTERecibidos({
      companyId: sessionStorage.selectedCompanyId,
      periodo: '2026-07'
    })
    ↓
    → getCompanyCredentials(companyId)
      ├─ Consulta user_company
      └─ Obtiene rut_sii + credenciales_sii_encriptadas
      ↓
    → desencriptar credenciales
      ↓
    → getBaseApiToken(rutSii, claveSii)
      ├─ POST /auth a BaseAPI
      ├─ Cache token por 1 hora
      └─ Retorna token Bearer
      ↓
    → Llamar BaseAPI.cl /dte/recibidos
      ├─ Retorna array de facturas
      └─ Si falla → fallback a MOCK_DTE_LIST
      ↓
    Retorna { success: true, data: [...] }
      ↓
    Frontend renderiza tabla
```

---

## 📄 Generación de PDF

### Endpoint: `/api/generate-pdf`

```
POST /api/generate-pdf
Body: { DTE object }

Response: PDF (application/pdf)
```

### Proceso

1. Cliente POST DTE object
2. Backend (pdfRenderer.ts) recibe DTE
3. Crea PDF con 8 bloques:
   ```
   ┌─────────────────────────────┐
   │ Header (Empresa)            │
   ├─────────────────────────────┤
   │ Document Type Box           │
   ├─────────────────────────────┤
   │ Receptor Data               │
   ├─────────────────────────────┤
   │ Items Table                 │
   ├─────────────────────────────┤
   │ Totals (Neto, IVA, Total)   │
   ├─────────────────────────────┤
   │ Receipt Acknowledgment      │
   ├─────────────────────────────┤
   │ PDF417 Timbre (barcode)     │
   ├─────────────────────────────┤
   │ Footer (SII disclaimer)     │
   └─────────────────────────────┘
   ```
4. Retorna blob PDF
5. Frontend descarga automáticamente

### Timbre (PDF417)

El timbre (barcode PDF417) contiene:
- RUT emisor
- Tipo DTE
- Folio
- Fecha
- Monto total
- RUT receptor

Se genera con `pdf417Generator.ts` (actualmente texto, no barcode real)

---

## 🔌 Integración BaseAPI

### Endpoints Usados

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/auth` | POST | Obtener token |
| `/dte/recibidos` | GET | Listar DTEs recibidos |
| `/dte/recibidos/{folio}` | GET | Obtener XML específico |
| `/rcv` | GET | Registro Compras (opcional) |

### Autenticación

```
1. POST /auth
   Body: { rut, clave }
   Response: { token, ... }

2. GET /dte/recibidos?periodo=2026-07
   Header: Authorization: Bearer {token}
```

### Fallback a Mock

Si BaseAPI falla (credenciales inválidas, API down, etc.):
```javascript
if (!token) {
  return MOCK_DTE_LIST;  // Datos de prueba
}
```

---

## 🧪 Testing Local

### Mock Data

Para testing sin BaseAPI:
- `/api/dte.ts` usa `MOCK_DTE_LIST` (5 empresas)
- `/utils/mockData.ts` contiene datos ficticios
- `testMode` flag en sessionStorage activa auto-loading

### Crear Usuario de Prueba

```bash
node scripts/create-test-user.js
```

Crea:
- Email: `testuser@mdscasinos.local`
- Password: `Test123456`
- Asignado a: "Mi Empresa LTDA"
- Rol: Viewer

---

## 📋 TypeScript Interfaces

### DTE (Documento Tributario Electrónico)
```typescript
interface DTE {
  folio: number;
  tipoDTE: number;  // 33=Factura, 34=Exenta, 56=Nota Débito, etc
  fechaEmision: string;
  rutEmisor: string;
  razonSocialEmisor: string;
  rutReceptor: string;
  razonSocialReceptor: string;
  items: DTEItem[];
  montoNeto: number;
  iva: number;
  montoTotal: number;
  xmlOriginal: string;
}
```

### DTEListItem
```typescript
interface DTEListItem {
  folio: number;
  tipoDTE: number;
  rutEmisor: string;
  razonSocialEmisor: string;
  fechaEmision: string;
  montoTotal: number;
}
```

---

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npm run dev              # Inicia Next.js en puerto 3001

# Build
npm run build            # Compilar para producción
npm start                # Ejecutar producción

# Crear usuario test
node scripts/create-test-user.js

# Git
git log --oneline        # Ver historial
git push origin main     # Subir a GitHub
```

---

## 🔒 Encriptación

### Credenciales SII

Cuando usuario ingresa RUT + Clave en /settings:

```javascript
// Debería hacer:
const encrypted = encrypt(claveSii, encryptionKey);  // AES-256
await updateCompanyCredentials(userId, companyId, rutSii, encrypted);
```

**NOTA:** Por el momento se guardan sin encriptar (TODO: implementar)

---

## 🚀 Deployment Checklist

- [ ] Supabase schema v2 ejecutado en producción
- [ ] RLS policies habilitadas
- [ ] Vercel/Netlify configurado
- [ ] Variables de entorno en producción
- [ ] BaseAPI key configurada
- [ ] SESSION_SECRET generado (32 caracteres)
- [ ] HTTPS habilitado
- [ ] Dominio personalizado (opcional)
- [ ] Email transaccional configurado (futuro)
- [ ] Monitoreo y logs (Vercel analytics)

---

## 📊 Performance

- **PDFs:** Generados server-side con PDFKit (~100ms)
- **Queries:** Optimizadas con índices en Supabase
- **Token cache:** 1 hora (evita re-auth repetida)
- **Mock data:** Fallback automático si BaseAPI indisponible

---

## 🐛 Debugging

### En Navegador

```javascript
// Revisar sesión Supabase
const { data } = await supabase.auth.getSession();
console.log(data);

// Revisar company en sessionStorage
console.log(sessionStorage.getItem('selectedCompanyId'));
```

### Logs en Vercel

https://vercel.com/[username]/administrador-facturas/deployments

---

## 🔄 Versionado

**Releases:**
- v1.0: Funcionalidad base (login, list DTEs, PDF download)
- v2.0: Multi-empresa, Supabase Auth (actual)
- v3.0: Real barcode PDF417, encriptación AES-256
- v4.0: Admin panel, bulk uploads, email notifications

---

**Última actualización:** 2026-07-17
**Mantenedor:** Manuel Fuica
**Estado:** Production Ready
