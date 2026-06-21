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

## Autenticación y roles (Firebase)

El acceso se controla con **Google + Firestore** (`clientes/{uid}`), no con la protección de despliegue de Vercel.

| Rol en Firestore | Quién | Qué puede hacer |
|------------------|-------|-----------------|
| `cliente` | Usuario que inicia sesión por primera vez | Navegar el sitio, cotizar (login opcional hoy) |
| `editor` | Staff asignado por un admin | Panel `/admin` (catálogo, cotizaciones, conexiones) |
| `admin` | Administrador | Todo lo anterior + gestión de usuarios |

Al primer login se crea el documento en `clientes` con `role: "cliente"`. Un administrador cambia el rol desde `/admin/usuarios`.

| Ruta | Acceso hoy |
|------|------------|
| `/`, `/productos`, `/contacto` | Sin login (cualquier visitante) |
| `/iniciar-sesion` | Login Google → rol en Firestore |
| `/admin/*` | Solo `editor` o `admin` |
| `/api/admin/*` | Solo staff (token Firebase) |

### Vercel Deployment Protection ≠ Firebase

Si **todo** responde **401**, suele ser **Vercel Deployment Protection** (contraseña de Vercel antes de cargar la app). Eso es independiente de los roles `cliente` / `admin` en Firebase.

- **Sitio abierto a visitantes:** Vercel → Deployment Protection → Production → **None**
- **Previews privados:** protección solo en Preview, o bypass con `VERCEL_AUTOMATION_BYPASS_SECRET`

## Vercel Blob

Conecte **Storage → Blob** al proyecto. Vercel agrega `BLOB_STORE_ID` (OIDC; recomendado) o puede usar `BLOB_READ_WRITE_TOKEN` (legacy).

En local: `vercel env pull` para obtener credenciales de Blob.

## Notas

- El formulario de contacto registra solicitudes de cotización en Firestore (`solicitudes_cotizacion`).
- El catálogo base está en `lib/products.ts`; las ediciones del admin se guardan en Blob/archivo local.
- Las imágenes de productos se suben desde el panel admin; sin fotos, las cards muestran un placeholder.
- `npm audit` puede reportar PostCSS transitivo de Next.js; el proyecto fija `postcss >= 8.5.10` vía `overrides` en `package.json`.
