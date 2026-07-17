# Modelo Multi-Empresa - DTE Chile App

## 🎯 Concepto

Un usuario puede tener acceso a **múltiples empresas** con **roles diferentes** en cada una.

```
Usuario: juan@gmail.com
├─ Empresa A (Rol: Admin)     → Acceso total
├─ Empresa B (Rol: Editor)    → Crear/editar facturas
└─ Empresa C (Rol: Viewer)    → Solo lectura
```

---

## 📊 Modelo de Datos

### 3 Tablas

| Tabla | Propósito | Relación |
|-------|-----------|----------|
| `companies` | Empresas | - |
| `user_profiles` | Usuarios globales | - |
| `user_company` | Relación M2M | user_id ↔ company_id |

### Tabla: `companies`
```sql
id (UUID)
nombre (VARCHAR)          -- "Mi Empresa LTDA"
rut (VARCHAR UNIQUE)      -- "76543210-K"
descripcion (TEXT)        -- Opcional
estado (BOOLEAN)          -- true/false
created_at, updated_at
```

### Tabla: `user_profiles`
```sql
id (UUID) → auth.users
email (VARCHAR UNIQUE)
nombre (VARCHAR)
apellido (VARCHAR)
rol (VARCHAR)             -- 'admin' o 'user'
activo (BOOLEAN)
created_at, updated_at
```

### Tabla: `user_company` (Many-to-Many)
```sql
id (UUID)
user_id (UUID) → user_profiles
company_id (UUID) → companies
rol_en_empresa (VARCHAR)  -- 'admin', 'editor', 'viewer'
rut_sii (VARCHAR)         -- RUT tributario para esta empresa
credenciales_sii_encriptadas (TEXT)  -- Clave SII encriptada
permisos (JSONB)          -- JSON con permisos específicos
activo (BOOLEAN)
created_at, updated_at
```

---

## 🔐 Seguridad: Row Level Security (RLS)

### COMPANIES
- ✅ Usuarios ven **solo empresas asignadas**
- ✅ Admins ven todas

### USER_PROFILES
- ✅ Usuarios ven **su propio perfil**
- ✅ Usuarios actualizan **su propio perfil**

### USER_COMPANY
- ✅ Usuarios ven **sus asignaciones**
- ✅ Admins ven **todas las asignaciones**

---

## 🔄 Flujo de Login

```
1. usuario@email.com + password
   ↓
2. ✅ Auth en Supabase Auth
   ↓
3. Obtener perfil (user_profiles)
   ↓
4. Obtener empresas (via user_company JOIN companies)
   ↓
5. Redirigir a /select-company
   ↓
6. Usuario selecciona empresa
   ↓
7. Ir a /facturas (con empresa en sessionStorage)
```

---

## 🛠️ Setup Paso a Paso

### Paso 1: Eliminar Schema Antiguo

En Supabase SQL Editor:

```sql
-- BORRAR TABLAS ANTIGUAS (IMPORTANTE!)
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- Esperar 2 segundos
```

### Paso 2: Ejecutar Schema v2

En Supabase SQL Editor → New Query:

1. Abre `supabase-schema-v2.sql`
2. Copia TODO el contenido
3. Pega en Supabase
4. Haz clic en **Run**

---

## 📋 Funciones SQL Helper

Se crean automáticamente con el schema:

### `get_user_companies(user_id UUID)`
Retorna todas las empresas de un usuario

```sql
SELECT * FROM get_user_companies('user-uuid');
-- Resultado:
-- company_id, company_nombre, company_rut, rol_en_empresa, rut_sii
```

### `get_company_users(company_id UUID)`
Retorna todos los usuarios de una empresa

```sql
SELECT * FROM get_company_users('company-uuid');
-- Resultado:
-- user_id, email, nombre, apellido, rol_en_empresa
```

---

## 💻 Módulo de Autenticación (v2)

Archivo: `src/api/supabase-auth-v2.ts`

### Funciones Principales

```typescript
// Login (retorna empresas del usuario)
loginUser(email, password)
  → { user, profile, companies[] }

// Obtener usuario actual + empresas
getCurrentUser()
  → { profile, companies[] }

// Crear empresa (solo admin)
createCompany(nombre, rut, descripcion)
  → company

// Asignar usuario a empresa
assignUserToCompany(userId, companyId, rol, rutSii)
  → assignment

// Guardar credenciales SII encriptadas
updateCompanyCredentials(userId, companyId, rutSii, claveSiiEncriptada)
  → updated
```

---

## 🖥️ UI/UX

### Página: `/auth`
- Tab "Ingresar"
- Tab "Registrarse"
- Login retorna lista de empresas

### Página: `/select-company` (NUEVA)
- Muestra tarjetas con cada empresa
- Rol (Admin/Editor/Viewer)
- Estado RUT SII (Configurado/No configurado)
- Click → entra a esa empresa

### Página: `/facturas`
- Navegador muestra empresa seleccionada
- Botón para cambiar de empresa
- Solo ve DTEs de esa empresa

---

## 🔒 Encriptación SII

Las credenciales SII se guardan **encriptadas** en:

```
user_company.credenciales_sii_encriptadas
```

**NOTA:** En v1, usamos AES-256 en JavaScript.
Para producción, implementar en Supabase con `pgcrypto`.

```sql
-- Ejemplo (cuando se habilite pgcrypto)
INSERT INTO user_company(credenciales_sii_encriptadas)
VALUES (pgp_sym_encrypt('clave_sii', 'encryption_key'));
```

---

## 📊 Ejemplo: Crear Usuario + Asignar Empresas

```typescript
// 1. Registro
const reg = await registerUser(
  'juan@gmail.com',
  'password123',
  'Juan',
  'Pérez'
);

// 2. Login (obtiene empresas)
const login = await loginUser('juan@gmail.com', 'password123');
// → companies: []  (vacío, aún no asignado)

// 3. Admin asigna al usuario a una empresa
await assignUserToCompany(
  juan_id,
  empresa_a_id,
  'editor',
  '76543210-K'
);

// 4. Siguiente login
const login2 = await loginUser('juan@gmail.com', 'password123');
// → companies: [
//   { company_id, company_nombre, rol_en_empresa: 'editor', ... }
// ]

// 5. Usuario selecciona empresa
sessionStorage.setItem('selectedCompanyId', empresa_a_id);

// 6. En /facturas, filtra DTEs por empresa
const dtes = await getDTERecibidos({ 
  empresa: selectedCompanyId,
  periodo: '2026-07'
});
```

---

## 🚀 Próximas Funcionalidades

- [ ] Panel admin para asignar usuarios a empresas
- [ ] Encriptación server-side (pgcrypto)
- [ ] Cambio de empresa sin logout
- [ ] Permisos granulares (JSON)
- [ ] Auditoría de cambios
- [ ] Exportación de DTEs por empresa

---

## 🐛 Troubleshooting

### Error: "Undefined function: get_user_companies"
- ✅ Ejecutaste el SQL completo?
- ✅ Esperaste 10 segundos?
- Intenta refrescar: `npm run dev`

### Usuario sin empresas después de login
- Verifica en Supabase que la asignación existe
- Tabla `user_company` debe tener registros

### RLS bloqueando queries
- Verifica que el usuario está loguado
- RLS solo permite ver datos propios

---

## 📝 Migraciones Futuras

Si cambias el modelo (ej: agregar campos a `companies`):

```sql
-- Crear migración nueva
ALTER TABLE public.companies ADD COLUMN nuevo_campo VARCHAR(255);

-- Crear trigger para updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE
  ON public.companies FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

---

**Status:** ✅ Multi-empresa implementado
**Versión:** v2.0 (2026-07-17)
