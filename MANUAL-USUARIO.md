# Manual de Usuario - DTE Chile App

## 📚 Tabla de Contenidos

1. [Primeros Pasos](#primeros-pasos)
2. [Login y Autenticación](#login-y-autenticación)
3. [Seleccionar Empresa](#seleccionar-empresa)
4. [Ver Facturas](#ver-facturas)
5. [Configurar Credenciales SII](#configurar-credenciales-sii)
6. [Descargar PDF/XML](#descargar-pdfxml)
7. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Primeros Pasos

### Requisitos
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Cuenta de usuario en la aplicación
- Credenciales SII (RUT + Clave) de tu empresa

### Acceder a la Aplicación
```
https://administrador-facturas.vercel.app
```

---

## Login y Autenticación

### Crear Cuenta

1. **Abre** la página de login
2. Haz click en tab **"Registrarse"**
3. Completa el formulario:
   - **Correo electrónico:** Tu email corporativo
   - **Nombre:** Tu nombre
   - **Apellido:** Tu apellido
   - **Contraseña:** Mínimo 8 caracteres
4. Click: **"Registrarse"**
5. ✅ Listo, ya tienes cuenta

### Ingresar a la Aplicación

1. **Abre** la página de login
2. Tab **"Ingresar"**
3. Ingresa:
   - **Correo:** Tu email registrado
   - **Contraseña:** Tu contraseña
4. Click: **"Ingresar"**
5. ✅ Serás redirigido a seleccionar empresa

---

## Seleccionar Empresa

Después de ingresar, verás la página **"Mis Empresas"**.

### Información Mostrada

Cada tarjeta de empresa muestra:

- **Nombre:** "Mi Empresa LTDA"
- **RUT:** "76543210-K"
- **Tu Rol:**
  - 👑 **Admin** - Acceso total
  - ✏️ **Editor** - Crear/editar facturas
  - 👁️ **Viewer** - Solo lectura
- **Estado RUT SII:**
  - ✅ Verde: Configurado
  - ⚠️ Amarillo: Falta configurar

### Entrar a una Empresa

1. Busca la empresa que necesitas
2. Click: **"Entrar →"**
3. ✅ Entrarás a la página de facturas

---

## Ver Facturas

Una vez dentro de una empresa:

### Tabla de Facturas

Muestra todos los documentos recibidos:

| Campo | Descripción |
|-------|-------------|
| **FOLIO** | Número de documento |
| **TIPO** | Factura, Nota Crédito, etc |
| **RUT EMISOR** | RUT de quién emitió |
| **RAZÓN SOCIAL** | Nombre empresa emisora |
| **FECHA** | Fecha de emisión |
| **MONTO** | Valor total documento |
| **ACCIÓN** | Botón "Ver" para detalles |

### Buscar por Período

1. Selecciona el **Período (AAAA-MM)** con el calendario
2. Click: **"Buscar"**
3. ✅ Se cargarán facturas de ese período

---

## Configurar Credenciales SII

### ¿Por Qué?

Para acceder a facturas reales desde el SII, necesitas guardar tus credenciales de acceso.

### Pasos

1. **Desde Select-Company**, click: **⚙️ Configuración**
2. Selecciona la empresa en dropdown
3. Ingresa:
   - **RUT SII:** Tu RUT tributario
   - **Clave SII:** Tu clave de acceso a SII
4. Click: **"💾 Guardar Credenciales"**
5. ✅ Se guardarán encriptadas

### 🔒 Seguridad

- ✅ Las claves se **encriptan** antes de guardar
- ✅ Solo **tú** puedes ver tus credenciales
- ✅ Se usan **solo para acceder al SII**
- ✅ No se comparten con nadie

### Cambiar Credenciales

Repite los pasos arriba. Sobrescribirán las anteriores.

---

## Descargar PDF/XML

### Ver Detalle de Factura

1. En tabla de facturas, click: **"Ver"**
2. Se abrirá la página de detalles con:
   - Info del emisor
   - Info del receptor
   - Tabla de ítems
   - Totales (Neto, IVA, Total)

### Descargar PDF

1. Click: **"Descargar PDF"**
2. El navegador descargará un PDF con:
   - Formato oficial SII
   - Timbre (PDF417 barcode)
   - Información completa de la factura
3. ✅ Archivo guardado en `Descargas/factura-[FOLIO].pdf`

### Descargar XML

1. Click: **"Descargar XML"**
2. Se descargará el archivo XML original
3. ✅ Archivo guardado en `Descargas/factura-[FOLIO].xml`

---

## Cambiar de Empresa

### Desde Facturas

1. Click: **"⚙️ Configuración"** en navbar (si aparece)
2. O usa el botón de volver: **"← Volver"**
3. Selecciona otra empresa
4. Click: **"Entrar →"**

### Logout

1. Click: **"Salir"** (botón rojo en navbar)
2. Serás redirigido al login
3. ✅ Tu sesión se ha cerrado

---

## Preguntas Frecuentes

### ¿Olvidé mi contraseña?

**Por el momento:**
- Contacta a tu administrador
- El admin puede resetear tu contraseña

**Próximamente:**
- Link "Recuperar contraseña" en login

### ¿Por qué dice "No tienes empresas asignadas"?

- Tu usuario no ha sido asignado a ninguna empresa
- Contacta al administrador para que te asigne
- El admin debe ingresar a **Configuración → Usuarios**

### ¿Las facturas están vacías/faltas datos?

**Posibles razones:**

1. **No configuraste RUT SII**
   → Solución: Ve a ⚙️ Configuración y configura credenciales

2. **Las credenciales SII son incorrectas**
   → Solución: Verifica el RUT y clave, intenta nuevamente

3. **No hay facturas en ese período**
   → Solución: Cambia el período de búsqueda

4. **Problema de conexión con SII**
   → Solución: Intenta en unos momentos

### ¿Puedo descargar múltiples facturas a la vez?

Por el momento: No. Debes descargar una por una.

**Próximamente:** Función de descarga en lote.

### ¿Dónde se guardan mis archivos descargados?

Se guardan en la carpeta **Descargas** de tu computadora:
- Windows: `C:\Users\[Tu Usuario]\Downloads\`
- Mac: `~/Downloads/`
- Linux: `~/Downloads/`

### ¿Pueden ver otros mis facturas?

**No.** Cada usuario solo ve:
- Sus propias empresas asignadas
- Las facturas de esas empresas
- Nadie más puede ver tu información

### ¿Es seguro ingresar mis credenciales SII?

**Sí, completamente.**

- Se encriptan con AES-256
- Se guardan en base de datos segura
- Solo se usan para conectar con SII
- No se venden ni se comparten

---

## 🆘 Necesito Ayuda

**Contacta a:**
- Tu administrador de empresa
- Email: [administrador@tuempresa.com]
- Teléfono: [+56 9 XXXX XXXX]

---

## 📱 Navegación Rápida

```
Login (/auth)
  ↓
Select Company (/select-company)
  ↓
Facturas (/facturas)
  ↓
  ├─ Click "Ver" → Detalle (/facturas/[folio])
  ├─ Click "⚙️ Configuración" → Settings (/settings)
  └─ Click "Salir" → Logout → Login
```

---

**Versión:** 1.0
**Última actualización:** 2026-07-17
**Estado:** Producción
