# DTE Chile - Aplicación de Recreación de Facturas Electrónicas

Aplicación web para consultar, extraer y recrear visualmente las facturas electrónicas (DTE) recibidas de proveedores a través del SII Chile.

## Características

- ✅ Autenticación con RUT y clave tributaria del SII
- ✅ Consulta de DTEs recibidos por período
- ✅ Parsing del XML firmado del DTE
- ✅ Generación de PDF con layout oficial del SII
- ✅ Descarga de XML y PDF
- ✅ Soporte para tipos DTE 33, 34, 56 y 61
- ✅ Código PDF417 (timbre electrónico) integrado
- ✅ Sesión segura (credenciales solo en memoria)

## Requisitos

- Node.js 20 LTS o superior
- npm o yarn
- Una cuenta con credenciales en el SII
- API Key de BaseAPI.cl (obtener en https://baseapi.cl)

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/usuario/dte-chile-app.git
cd dte-chile-app
```

2. Instalar dependencias:
```bash
npm install
```

3. Crear archivo `.env.local` basado en `.env.example`:
```bash
cp .env.example .env.local
```

4. Configurar variables de entorno:
```env
NEXT_PUBLIC_BASEAPI_URL=https://api.baseapi.cl/v1
BASEAPI_API_KEY=tu_api_key_aqui
NEXT_PUBLIC_SESSION_TIMEOUT=1800000
NODE_ENV=development
SESSION_SECRET=una_cadena_secreta_de_al_menos_32_caracteres
```

## Uso

### Desarrollo

```bash
npm run dev
```

Acceder a http://localhost:3000

### Producción

```bash
npm run build
npm start
```

## Estructura del Proyecto

```
src/
├── app/                      # Páginas y layouts de Next.js
│   ├── page.tsx             # Página de login
│   ├── facturas/            # Listado de facturas
│   │   └── [folio]/         # Detalle y descarga
│   ├── api/                 # API routes
│   │   └── generate-pdf/    # Generación de PDF
│   └── layout.tsx           # Layout raíz
├── api/                      # Módulos de integración
│   ├── auth.ts              # Autenticación BaseAPI
│   ├── dte.ts               # Consulta de DTEs
│   └── contribuyente.ts     # Datos de contribuyentes
├── parser/
│   └── xmlParser.ts         # Parsing XML → TypeScript
├── renderer/
│   ├── pdfRenderer.ts       # Generación PDF con PDFKit
│   └── pdf417Generator.ts   # Generador de código de barras
└── types/
    └── dte.ts               # Interfaces TypeScript
```

## API Integration

### BaseAPI.cl

La app utiliza BaseAPI.cl para acceder a los datos del SII sin necesidad de certificados digitales:

**Endpoints principales:**
- `GET /dte/recibidos` - Listado de DTEs recibidos
- `GET /dte/recibidos/:folio` - XML de un DTE específico
- `GET /contribuyente/datos-receptor` - Datos del contribuyente por RUT
- `GET /rcv` - Registro de Compras y Ventas

Para más información: https://baseapi.cl/docs

## Seguridad

- Las credenciales del SII se usan solo en memoria durante la sesión activa
- Nunca se almacenan en base de datos o logs
- Token de sesión expira después de 30 minutos
- HTTPS recomendado en producción
- CSP configurada en headers

## Validación

El PDF generado cumple con:
- Formato oficial del SII (Anexo Técnico v2.5)
- Layout de 8 bloques según Manual de Muestras Impresas
- Código PDF417 válido para el SII
- Montos verificados (Neto + IVA = Total)
- Tamaño máximo 500 KB

## Testing

Para validar un PDF generado:
1. Descargar el PDF desde la aplicación
2. Ir a https://timbre.sii.cl/
3. Cargar el PDF para validar el timbre

## Tipos de DTE Soportados

| Código | Tipo | Soporte |
|--------|------|---------|
| 33 | Factura Electrónica | ✅ |
| 34 | Factura No Afecta o Exenta | ✅ |
| 52 | Guía de Despacho | ✅ |
| 56 | Nota de Débito | ✅ |
| 61 | Nota de Crédito | ✅ |

## Limitaciones

- Solo lectura de DTEs (no emite ni firma)
- Requiere API intermediaria (BaseAPI o APIGateway)
- No almacena historial local (usa el SII como fuente de verdad)
- Máximo 60 líneas de detalle por DTE

## Troubleshooting

### Error: "No authenticated session"
- Verificar que el RUT está en formato correcto (ej: 12345678-9)
- Validar que la clave tributaria es correcta
- Confirmar que la API Key de BaseAPI es válida

### Error: "Failed to fetch DTE XML"
- Verificar que el folio existe en el período consultado
- Confirmar conexión a internet
- Revisar que BaseAPI está disponible

### PDF sin contenido
- Validar que el XML tiene todos los campos obligatorios
- Revisar que los montos son mayores a cero

## Desarrollo

### Agregar soporte para nuevos tipos de DTE

En `src/renderer/pdfRenderer.ts`, agregar al diccionario `DTE_NAMES`:

```typescript
const DTE_NAMES: Record<number, string> = {
  // ... existentes
  39: 'BOLETA ELECTRÓNICA',
};
```

### Personalizar layout del PDF

Modificar métodos `renderXxx()` en `DTEPDFRenderer` class.

## Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el repositorio
2. Crear una rama para tu feature
3. Commit y push
4. Abrir pull request

## Licencia

MIT

## Contacto

Para soporte o consultas, contactar a través del repositorio.

---

**Nota:** Esta aplicación es de uso educativo y de prueba. Para uso en producción, validar cumplimiento con normativas tributarias chilenas y SII.
