# 100posts (MVP)

Next.js + Supabase + OpenAI + fal.ai: tres variantes de carrusel Instagram (4:5) para **tiendas de celulares**, con caption y CTA.

## Requisitos locales

1. **Supabase**: proyecto nuevo → SQL Editor → ejecutá en orden:
   - [`supabase/migrations/20250508000000_init.sql`](supabase/migrations/20250508000000_init.sql)
   - [`supabase/migrations/20250509120000_modes_visual.sql`](supabase/migrations/20250509120000_modes_visual.sql) (si ya tenías el MVP viejo: renombra columnas y agrega `visual_profile`).
   Si el `INSERT` en `storage.buckets` falla por permisos, creá a mano los buckets `product-images` y `generated-assets` (privados) y dejá las políticas del SQL que apliquen a `storage.objects`.

2. **Auth**: en Authentication → URL configuration, agregá `http://localhost:3000/auth/callback` (y la URL de producción equivalente en Vercel).

3. **Variables**: copiá [`.env.example`](.env.example) a `.env.local` y completá:

   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (opcional en este MVP; reservado para scripts/admin)
   - `OPENAI_API_KEY`
   - `FAL_KEY` ([fal.ai](https://fal.ai) dashboard)
   - Opcional: `ENABLE_PRODUCT_ENHANCEMENT=true` (remove background vía fal en el hero del producto)

4. `npm install` y `npm run dev`.

## Vercel

- Conectá el repo, mismo `.env` que en Supabase (pestaña Environment Variables).
- `OPENAI_API_KEY` y `FAL_KEY` solo en servidor (no `NEXT_PUBLIC_`).
- Aumentá timeout si hace falta: en `app/api/generate/route.ts` está `maxDuration = 60`.

## Flujo manual (E2E)

1. Magic link desde `/login`.
2. `/brand`: nombre + colores + tono.
3. `/products/new`: producto → **Generar 3 posts** (~20–60 s según cola fal/OpenAI).
4. `/runs/[id]`: preview, copiar caption/CTA, **Descargar ZIP**.
