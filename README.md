# Fica Tostadores — Sitio Web

Sitio web corporativo para **Fica Tostadores**, empresa de maquinaria industrial para tostado.

## Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS 4
- **Firebase Firestore** — base de datos
- Lucide React, NextAuth.js, react-phone-number-input

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio |
| `/productos` | Catálogo (café / frutos secos) |
| `/productos/[id]` | Ficha técnica |
| `/contacto` | Formulario de contacto |
| `/iniciar-sesion` | Acceso con Google (página aparte) |

## Desarrollo

```bash
npm install
cp .env.example .env.local   # completar tokens
npm run dev
```

## Variables de entorno

Todas las claves van en **`.env.local`**. Usá **`.env.example`** como plantilla.

## Firebase (Firestore)

1. Creá un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Activá **Firestore Database** (modo producción o prueba)
3. Registrá una app **Web** y copiá la config a `.env.local`
4. Reiniciá `npm run dev`

Código:

- `lib/firebase.ts` — inicialización y cliente Firestore (`getDb()`)
- `lib/firestore-collections.ts` — nombres de colecciones

El catálogo actual sigue en `lib/products.ts`. Cuando quieras, se puede migrar a la colección `products` en Firestore.

## Catálogos PDF

Los PDF de referencia están en `public/docs/`.

## Notas

- El formulario de contacto abre WhatsApp directamente (sin guardar en base de datos).
