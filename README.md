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
| `/admin/productos` | Panel CRUD de productos (solo `role: admin`) |

## Desarrollo

```bash
npm install
cp .env.example .env.local
npm run dev
```

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
| `role` | `"cliente"` al crear; editable manualmente |
| `createdAt`, `lastLoginAt` | Automático |

**Hacer admin a alguien:** Firestore → `clientes` → documento del usuario → cambiar `role` de `"cliente"` a `"admin"`.

El login **no sobrescribe** el `role` si el documento ya existe.

### 4. Variables de entorno

Solo las variables `NEXT_PUBLIC_FIREBASE_*` en `.env.local` (config web de Firebase).

No se requiere service account ni claves privadas.

## Vercel Blob

Conecte **Storage → Blob** al proyecto. Vercel agrega `BLOB_STORE_ID` (OIDC; recomendado) o puede usar `BLOB_READ_WRITE_TOKEN` (legacy).

En local: `vercel env pull` para obtener credenciales de Blob.

## Notas

- El formulario de contacto abre WhatsApp directamente.
- El catálogo base está en `lib/products.ts`; las ediciones del admin se guardan en Blob/archivo local.
