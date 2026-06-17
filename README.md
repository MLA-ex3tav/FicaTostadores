# Fica Tostadores — Sitio Web

Sitio web corporativo para **Fica Tostadores**, empresa de maquinaria industrial para tostado.

## Stack

- Next.js 16 (App Router), TypeScript, Tailwind CSS 4
- Lucide React, react-phone-number-input

## Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio |
| `/productos` | Catálogo (café / frutos secos) |
| `/productos/[id]` | Ficha técnica |
| `/contacto` | Formulario de contacto |

## Desarrollo

```bash
npm install
npm run dev
```

## Catálogos PDF

Los PDF de referencia están en `public/docs/`.

## Notas

- El formulario de contacto abre WhatsApp directamente (sin guardar en base de datos).
- El catálogo de productos está en `lib/products.ts`.
