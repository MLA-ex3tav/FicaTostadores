---
name: fica-web-dev
description: Use when developing, fixing or auditing the FicaTostadoresWEB Next.js + Tailwind CSS v4 site (public pages, /admin panel, catalogos/categorias, product CRUD). Covers project conventions, the verification workflow (tsc, dev server, build) and known pitfalls like Tailwind not generating arbitrary decimal-rem height classes, input/button height unification, and mojibake prevention.
---

# Fica Web Dev — Convenciones del proyecto

Proyecto Next.js (App Router, `app/`) + React + TypeScript + Tailwind CSS v4 (CSS-first, config en `app/globals.css`) + Firebase (Auth/Firestore/Storage). Shell: Windows PowerShell 5.1.

## Stack y estructura

- Páginas públicas: `app/`, componentes en `components/`. Panel admin: `app/admin/*` + `components/admin/*`.
- Catálogo y categorías: config en `lib/catalog-config.ts` (client) y `lib/catalog-config-server.ts`; API admin `app/api/admin/catalog-config`.
- Productos: tipos en `lib/products.ts`, datos server en `lib/products-server.ts`.
- Estilos: `app/globals.css` define variables `--orange`, `--steel-*`, `--background`, `--panel`, `--input-bg`, y la clase `.industrial-input`.

## Convenciones visuales (obligatorias)

- Inputs/selects/textareas: clase `industrial-input` (alto ≈ 47px por padding). Botones que comparten fila con inputs: `h-12` (48px), nunca `py-3` + contenido suelto.
- Botones primarios naranjos: `inline-flex h-12 items-center gap-2 rounded-xl bg-orange px-5 text-sm font-semibold uppercase tracking-wider text-white transition-colors hover:bg-orange-hover disabled:opacity-60`.
- Alinear elementos en filas con `self-center` cuando estén al lado de inputs altos.
- Texto: títulos `font-display` (uppercase, `text-steel-light`), eyebrows `text-xs uppercase tracking-widest text-steel-dark`, cuerpo `text-steel-mid`/`text-steel-dark`.
- Barras sticky: fondo `bg-background/90 backdrop-blur` (NO `bg-[var(--background)]/90`, que no genera bien).

## Pitfall crítico: Tailwind no genera alturas arbitrarias con decimal en rem

Este setup NO compila clases arbitrarias como `h-[3.125rem]` (decimal en rem): la clase queda en el HTML pero sin regla CSS, y el elemento colapsa a la altura de su contenido (~20px). Verificar siempre contra el CSS compilado si algo se ve corto.

- Usar unidades estándar: `h-12` (48px), `h-11`, `h-14`, etc.
- NO usar `h-[3.125rem]`, `h-[2.375rem]`, `w-[3.125rem]`, etc.
- Otras arbitrarias (enteros, `calc`, `minmax`) SÍ funcionan: `min-w-[16rem]`, `lg:grid-cols-[16rem_minmax(0,1fr)]`, `h-[calc(100%-1px)]`.

## Mojibake

- Archivos de UI deben guardarse en UTF-8 con acentos reales (`sesión`, `imágenes`, `cómo`). Si aparece `?` dentro de palabras (`sesi?n`), es corrupción de encoding: corregir el texto, no dejar los `?`.
- Al crear archivos, escribir los acentos correctamente (ó, á, í, ú, ñ, «», …).

## Workflow de verificación (después de CADA cambio de código)

1. `npx tsc --noEmit` — no debe emitir errores.
2. Si el dev server está corriendo en `http://localhost:3000`, probar las páginas afectadas con `Invoke-WebRequest` y verificar HTTP 200.
3. `npx next build` al terminar un cambio significativo.
4. Si se sospecha que una clase no aplica, descargar el CSS compilado desde el `<link>` de la página y buscar la regla (`.h-12`, `h-\[3\.125rem\]`, etc.).

## Flujo del catálogo público

- `/productos` usa `components/ProductsCatalog.tsx`: sidebar (`lg:grid-cols-[16rem_minmax(0,1fr)]`) con catálogos y tipos; en móvil tabs scroller + chips. Query params: `catalog`, `tipo`, `pagina`.
- Cambiar los filtros del catálogo mantiene el comportamiento de URL (router.replace, scroll:false).
