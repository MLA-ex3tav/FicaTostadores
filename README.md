# Fica Tostadores — Sitio Web

Sitio web corporativo para **Fica Tostadores**, empresa de maquinaria industrial para tostado.

## Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS 4
- Firebase Auth (Google) + Firestore (`clientes` con `role`)
- Vercel Blob para persistir el catálogo editado

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio |
| `/productos` | Catálogo (café / frutos secos) |
| `/productos/[id]` | Ficha técnica |
| `/contacto` | Formulario de contacto |
| `/iniciar-sesion` | Login con Google |
| `/admin/productos` | Panel CRUD de productos (`editor` o `admin`) |
| `/admin/usuarios` | Gestión de roles (solo `admin`) |

## Roles de acceso

| Rol | Panel admin | Catálogo | Gestionar usuarios |
|-----|-------------|----------|--------------------|
| `cliente` | No | No | No |
| `editor` | Sí | Sí | No |
| `admin` | Sí | Sí | Sí |

Asigne roles desde `/admin/usuarios` (requiere al menos un administrador).

## Desarrollo

```bash
npm install
cp .env.example .env.local
# Completar NEXT_PUBLIC_FIREBASE_* y NEXT_PUBLIC_SITE_URL en .env.local
npm run dev
```

`.env.local` no se sube a Git. Sin las variables `NEXT_PUBLIC_FIREBASE_*` el login con Google no aparecerá ni funcionará.

## Autenticación

El sitio usa **Firebase Auth (Google)** únicamente. No hay NextAuth ni `auth.ts`.

## Firebase

### 1. Authentication

- Activar **Google** en Firebase Console → Authentication → Sign-in method.
- En **Configuración → Dominios autorizados**, agregar:
  - `localhost`
  - Su IP local si entra por red (ej. `192.168.3.107`)
  - Su dominio de producción en Vercel (ej. `fica-tostadores.vercel.app`)

### 2. Reglas de Firestore

Firebase Console → Firestore → **Reglas** → pegar [`firestore.rules`](firestore.rules) → **Publicar**.

### 3. Colección `clientes`

Al iniciar sesión con Google se crea o actualiza un documento en `clientes/{uid}`.

| Campo | Origen |
|-------|--------|
| `uid`, `email`, `displayName`, `photoURL` | Automático al login |
| `role` | `"cliente"` al crear; editable por administradores |
| `createdAt`, `lastLoginAt` | Automático |

**Roles:** `cliente` (sitio público), `editor` (panel sin gestión de usuarios), `admin` (acceso completo).

**Asignar roles:** `/admin/usuarios` en el panel (solo administradores). También puede editar manualmente en Firestore si es el primer admin.

El login **no sobrescribe** el `role` si el documento ya existe.

### 4. Variables de entorno

Solo las variables `NEXT_PUBLIC_FIREBASE_*` en `.env.local` (config web de Firebase).

No se requiere service account ni claves privadas para el login. Para **solicitudes de cotización** (formulario → Firestore) sí configure `FIREBASE_SERVICE_ACCOUNT_JSON` en el servidor.

## Acceso público vs panel admin

| Área | Acceso |
|------|--------|
| `/`, `/productos`, `/contacto`, etc. | **Público** (sin login) |
| `/api/products`, `/api/cotizaciones/solicitudes` | **Público** (con rate limit) |
| `/admin/*` (panel) | **Solo staff** (`editor` o `admin`) vía Google |
| `/api/admin/*` | **Solo staff** (token Firebase en la petición) |

El middleware **no** bloquea páginas públicas. Si todo el sitio responde **401**, la causa suele ser **Vercel Deployment Protection** (capa anterior a Next.js), no el código.

### Vercel: producción pública

1. **Project → Settings → Deployment Protection**
2. **Production → None** (sitio público para clientes)
3. Opcional: dejar protección solo en **Preview** si no quiere previews abiertos
4. Redeploy

Solo `/admin` requiere autenticación (Firebase + rol en Firestore). No active protección de Vercel sobre producción salvo que quiera password para todo el sitio.

## Vercel Blob

Conecte **Storage → Blob** al proyecto. Vercel agrega `BLOB_STORE_ID` (OIDC; recomendado) o puede usar `BLOB_READ_WRITE_TOKEN` (legacy).

En local: `vercel env pull` para obtener credenciales de Blob.

## Notas

- El formulario de contacto registra solicitudes de cotización en Firestore (`solicitudes_cotizacion`).
- El catálogo base está en `lib/products.ts`; las ediciones del admin se guardan en Blob/archivo local.
- Las imágenes de productos se suben desde el panel admin; sin fotos, las cards muestran un placeholder.
- `npm audit` puede reportar PostCSS transitivo de Next.js; el proyecto fija `postcss >= 8.5.10` vía `overrides` en `package.json`.
