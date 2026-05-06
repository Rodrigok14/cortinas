# MVP Gestion de Cortinas a Medida

Sistema web real para administrar clientes, obras, ambientes, mediciones, cotizaciones, items, instalaciones y pagos.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Auth + Storage + Postgres)
- PostgreSQL
- Server Actions
- Zod

## Funcionalidades incluidas

- Login con email y contrasena (Supabase Auth)
- Rutas privadas y layout de panel
- Control de acceso por rol (`admin`, `vendedor`, `medidor`, `instalador`)
- Dashboard con KPIs y tablas operativas
- CRUD para:
  - Clientes
  - Obras
  - Ambientes
  - Mediciones
  - Cotizaciones
  - Items de cotizacion
  - Instalaciones
  - Pagos
- Busquedas por modulo
- Upload de fotos de mediciones y comprobantes de pago en Supabase Storage
- Recalculo automatico de subtotal/total/saldo por triggers SQL

## Estructura del proyecto

- `src/app`: rutas y layouts (App Router)
- `src/modules`: logica por modulo (actions + queries)
- `src/components`: UI reutilizable
- `src/lib`: auth, supabase, validaciones, utilidades
- `supabase/migrations/001_init.sql`: schema completo + RLS + triggers + storage policies
- `supabase/seed.sql`: datos de ejemplo

## Requisitos previos

- Node.js 18+
- Proyecto Supabase creado

## Configuracion de Supabase

1. Crear proyecto en Supabase.
2. Ir a SQL Editor y ejecutar:
   - `supabase/migrations/001_init.sql`
   - `supabase/seed.sql`
3. Crear usuarios en `Authentication > Users`.
4. Asignar roles insertando filas en `public.profiles` con el mismo `id` de `auth.users`.

Ejemplo:

```sql
insert into public.profiles (id, full_name, role)
values
  ('<uuid-auth-admin>', 'Admin Demo', 'admin'),
  ('<uuid-auth-vendedor>', 'Vendedor Demo', 'vendedor');
```

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Instalacion y ejecucion local

```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## Build de produccion

```bash
npm run build
npm run start
```

## Deploy

### Vercel

1. Importar repositorio en Vercel.
2. Configurar variables de entorno del `.env.example`.
3. Deploy.

### Hosting Node.js

1. Configurar variables de entorno.
2. Ejecutar:
   - `npm install`
   - `npm run build`
   - `npm run start`
3. Exponer puerto 3000 con reverse proxy.

## Flujo operativo recomendado

1. Crear cliente
2. Crear obra
3. Crear ambientes
4. Cargar mediciones
5. Generar cotizacion
6. Cargar items de cotizacion
7. Registrar pagos
8. Programar instalacion
9. Supervisar dashboard

## Checklist de funcionamiento

- [ ] Login/logout funcionando
- [ ] Roles y rutas privadas funcionando
- [ ] Dashboard carga metricas y tablas
- [ ] CRUD clientes
- [ ] CRUD obras
- [ ] CRUD ambientes
- [ ] CRUD mediciones
- [ ] CRUD cotizaciones
- [ ] CRUD items de cotizacion
- [ ] CRUD instalaciones
- [ ] CRUD pagos
- [ ] Upload de fotos y comprobantes
- [ ] Recalculo automatico de total y saldo
- [ ] RLS y politicas activas
- [ ] Build de Next.js exitoso

## Decisiones tecnicas

- Se utilizo Server Actions para logica de escritura y queries server-side para lectura.
- Los calculos de cotizacion y saldo se resuelven en DB con triggers para consistencia.
- Los uploads se guardan en buckets privados por usuario autenticado (`auth.uid()` en path).
- Se priorizo estructura modular por dominio para facilitar mantenimiento.
