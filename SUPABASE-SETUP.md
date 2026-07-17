# Guía Setup Supabase - DTE Chile App

## 📋 Paso 1: Crear Tabla en Supabase

1. Abre tu proyecto en Supabase: https://app.supabase.com
2. Ve a **SQL Editor** (lado izquierdo)
3. Haz clic en **"New Query"**
4. **Copia y pega TODO el contenido** de `supabase-schema.sql`
5. Haz clic en **"Run"** (triángulo verde)
6. Espera a que se ejecute ✅

---

## 🧪 Paso 2: Probar la App Localmente

1. **Entra al directorio:**
```bash
cd /Users/manuelfuica/Library/CloudStorage/GoogleDrive-manuel.fuica@gmail.com/Mi\ unidad/Claude-Work/PROYECTOS/dte-chile-app
```

2. **Instala dependencias:**
```bash
npm install
```

3. **Inicia el servidor:**
```bash
npm run dev
```

4. **Abre en navegador:**
```
http://localhost:3000/auth
```

---

## ✅ Paso 3: Prueba Registro

**En la página de Auth:**

1. Haz clic en tab **"Registrarse"**
2. Completa el formulario:
   - Email: `test@gmail.com`
   - Nombre: `Juan`
   - Apellido: `Pérez`
   - RUT: `12345678-9`
   - Empresa: `Mi Empresa LTDA`
   - Contraseña: `Test123456`
   - Confirmar: `Test123456`

3. Haz clic en **"Registrarse"**

---

## ✅ Paso 4: Prueba Login

1. Haz clic en tab **"Ingresar"**
2. Ingresa:
   - Email: `test@gmail.com`
   - Contraseña: `Test123456`

3. Haz clic en **"Ingresar"**
4. Deberías ser redirigido a `/facturas` ✅

---

## 🔍 Paso 5: Verificar Datos en Supabase

1. Ve a tu proyecto Supabase
2. Haz clic en **"Table Editor"** (lado izquierdo)
3. Selecciona **`user_profiles`**
4. Deberías ver tu usuario registrado con:
   - id (UUID)
   - email
   - rut
   - nombre
   - apellido
   - empresa
   - rol: "user"
   - activo: true
   - timestamps

---

## 🛡️ Seguridad: RLS (Row Level Security)

Los usuarios pueden:
- ✅ Ver su propio perfil
- ✅ Actualizar su propio perfil
- ❌ Ver perfiles de otros usuarios
- ❌ Modificar perfiles de otros usuarios

(Los admins verán todos los perfiles)

---

## 🚀 Opciones de Autenticación

Ahora la app soporta dos rutas:

### Ruta 1: Login/Registro con Supabase (Nueva)
- URL: `http://localhost:3000/auth`
- Almacena usuarios en BD
- Seguridad: ✅ Contraseñas hasheadas
- Persistencia: ✅ Permanente

### Ruta 2: Login Original + Test Mode (Antigua)
- URL: `http://localhost:3000/`
- Sigue funcionando
- Test Mode sigue disponible

---

## 📊 Datos en Supabase vs LocalStorage

| Dato | Ubicación | Persistencia |
|------|-----------|-------------|
| Usuario | Supabase (PostgreSQL) | Permanente |
| Sesión | Supabase Auth | 1 hora |
| Token | Navegador (secure cookie) | Sesión |

---

## 🔐 Variables de Entorno

Ya están en `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://jxvzwidkatsnnmgonrhg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_568Cg26wuVe4zfIr_bn9PQ_3T-ZxkL5
```

Para producción (Vercel):
- Agregar estas mismas variables en Vercel Dashboard → Settings → Environment Variables

---

## 🐛 Troubleshooting

### Error: "Column doesn't exist"
- Ejecutaste el SQL completo en Supabase? ✅
- Esperar 10 segundos después de ejecutar

### Error: "Email already exists"
- Ese email ya fue registrado
- Usa otro email o elimina el usuario en Supabase

### Error: "Invalid credentials"
- Email o contraseña incorrectos
- Verifica en Supabase que el usuario existe

### Auth page no carga
- Reinicia: `npm run dev`
- Limpia caché del navegador: Ctrl+Shift+Delete

---

## 📝 Próximos Pasos

1. ✅ Tabla de usuarios creada
2. ✅ Login/Registro funcionando
3. ⏭️ Integrar Supabase con páginas de facturas
4. ⏭️ Guardar RUT + clave SII encriptados por usuario
5. ⏭️ Agregar panel de administración

---

**¿Necesitas ayuda?** Revisa los logs:
```bash
# Terminal 1: Servidor
npm run dev

# Terminal 2: Logs de Supabase (opcional)
# Abre Supabase dashboard → Logs
```

---

**Status:** ✅ Supabase está integrado y listo
