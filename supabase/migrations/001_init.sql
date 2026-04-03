-- 001_init.sql
create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'vendedor', 'medidor', 'instalador');
create type public.project_status as enum (
  'relevamiento',
  'cotizada',
  'aprobada',
  'en_produccion',
  'lista_para_instalar',
  'instalada',
  'cerrada'
);
create type public.product_type as enum ('tradicional', 'roller');
create type public.mount_type as enum ('interior', 'exterior');
create type public.control_side as enum ('izquierdo', 'derecho', 'sin_mando');
create type public.quotation_status as enum ('borrador', 'enviada', 'aprobada', 'rechazada', 'vencida');
create type public.installation_status as enum ('pendiente', 'reprogramada', 'realizada', 'observada');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'vendedor',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  nombre_completo text not null,
  telefono text not null,
  email text,
  direccion text,
  ciudad text,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  nombre_obra text not null,
  direccion_instalacion text,
  estado public.project_status not null default 'relevamiento',
  fecha_visita date,
  fecha_entrega_estimada date,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  nombre_ambiente text not null,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  tipo_producto public.product_type not null,
  tipo_montaje public.mount_type not null,
  ancho numeric(10,2) not null check (ancho > 0),
  alto numeric(10,2) not null check (alto > 0),
  cantidad integer not null check (cantidad > 0),
  lado_mando public.control_side not null,
  tela text,
  color text,
  observaciones text,
  foto_url text,
  measured_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  numero text not null unique,
  fecha date not null,
  estado public.quotation_status not null default 'borrador',
  subtotal numeric(12,2) not null default 0,
  descuento numeric(12,2) not null default 0,
  costo_instalacion numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  anticipo_requerido numeric(12,2) not null default 0,
  saldo numeric(12,2) not null default 0,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  measurement_id uuid references public.measurements(id) on delete set null,
  descripcion text not null,
  cantidad numeric(10,2) not null check (cantidad > 0),
  precio_unitario numeric(12,2) not null check (precio_unitario >= 0),
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.installations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  fecha_programada date not null,
  tecnico text not null,
  estado public.installation_status not null default 'pendiente',
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations(id) on delete cascade,
  fecha_pago date not null,
  monto numeric(12,2) not null check (monto > 0),
  medio_pago text not null,
  estado text not null,
  comprobante_url text,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_clients_search on public.clients using gin (
  to_tsvector('simple', coalesce(nombre_completo, '') || ' ' || coalesce(telefono, '') || ' ' || coalesce(email, ''))
);
create index if not exists idx_projects_client_id on public.projects(client_id);
create index if not exists idx_rooms_project_id on public.rooms(project_id);
create index if not exists idx_measurements_room_id on public.measurements(room_id);
create index if not exists idx_quotations_client_id on public.quotations(client_id);
create index if not exists idx_quotations_project_id on public.quotations(project_id);
create index if not exists idx_quotation_items_quotation_id on public.quotation_items(quotation_id);
create index if not exists idx_payments_quotation_id on public.payments(quotation_id);
create index if not exists idx_installations_project_id on public.installations(project_id);
create index if not exists idx_installations_date on public.installations(fecha_programada);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger trg_clients_updated_at before update on public.clients for each row execute procedure public.set_updated_at();
create trigger trg_projects_updated_at before update on public.projects for each row execute procedure public.set_updated_at();
create trigger trg_rooms_updated_at before update on public.rooms for each row execute procedure public.set_updated_at();
create trigger trg_measurements_updated_at before update on public.measurements for each row execute procedure public.set_updated_at();
create trigger trg_quotations_updated_at before update on public.quotations for each row execute procedure public.set_updated_at();
create trigger trg_quotation_items_updated_at before update on public.quotation_items for each row execute procedure public.set_updated_at();
create trigger trg_installations_updated_at before update on public.installations for each row execute procedure public.set_updated_at();
create trigger trg_payments_updated_at before update on public.payments for each row execute procedure public.set_updated_at();

create or replace function public.recalculate_quotation_totals(p_quotation_id uuid)
returns void
language plpgsql
security definer
as $$
declare
  v_subtotal numeric(12,2);
  v_descuento numeric(12,2);
  v_costo_instalacion numeric(12,2);
  v_total numeric(12,2);
  v_pagado numeric(12,2);
begin
  select coalesce(sum(total), 0)
  into v_subtotal
  from public.quotation_items
  where quotation_id = p_quotation_id;

  select coalesce(descuento, 0), coalesce(costo_instalacion, 0)
  into v_descuento, v_costo_instalacion
  from public.quotations
  where id = p_quotation_id;

  v_total := greatest(v_subtotal - v_descuento + v_costo_instalacion, 0);

  select coalesce(sum(monto), 0)
  into v_pagado
  from public.payments
  where quotation_id = p_quotation_id;

  update public.quotations
  set subtotal = v_subtotal,
      total = v_total,
      saldo = greatest(v_total - v_pagado, 0)
  where id = p_quotation_id;
end;
$$;

create or replace function public.trg_quotation_item_total()
returns trigger
language plpgsql
as $$
begin
  if tg_op <> 'DELETE' then
    new.total := round((new.cantidad * new.precio_unitario)::numeric, 2);
  end if;

  perform public.recalculate_quotation_totals(coalesce(new.quotation_id, old.quotation_id));

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger trg_quotation_items_total
before insert or update on public.quotation_items
for each row execute procedure public.trg_quotation_item_total();

create trigger trg_quotation_items_recalculate_delete
after delete on public.quotation_items
for each row execute procedure public.trg_quotation_item_total();

create or replace function public.trg_payments_recalculate()
returns trigger
language plpgsql
as $$
begin
  perform public.recalculate_quotation_totals(coalesce(new.quotation_id, old.quotation_id));

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create trigger trg_payments_recalculate_upsert
after insert or update on public.payments
for each row execute procedure public.trg_payments_recalculate();

create trigger trg_payments_recalculate_delete
after delete on public.payments
for each row execute procedure public.trg_payments_recalculate();

create or replace function public.user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role from public.profiles where id = auth.uid()), 'vendedor'::public.user_role);
$$;

create or replace function public.can_manage_sales()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.user_role() in ('admin', 'vendedor');
$$;

create or replace function public.can_manage_measurements()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.user_role() in ('admin', 'medidor');
$$;

create or replace function public.can_manage_installations()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.user_role() in ('admin', 'instalador');
$$;

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.projects enable row level security;
alter table public.rooms enable row level security;
alter table public.measurements enable row level security;
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;
alter table public.installations enable row level security;
alter table public.payments enable row level security;

create policy "profiles_self_or_admin_select" on public.profiles
for select to authenticated
using (id = auth.uid() or public.user_role() = 'admin');

create policy "profiles_self_update" on public.profiles
for update to authenticated
using (id = auth.uid());

create policy "profiles_insert_own" on public.profiles
for insert to authenticated
with check (id = auth.uid());

create policy "clients_select" on public.clients
for select to authenticated
using (public.can_manage_sales() or public.can_manage_measurements() or public.can_manage_installations());

create policy "clients_write" on public.clients
for all to authenticated
using (public.can_manage_sales() or public.user_role() = 'admin')
with check (public.can_manage_sales() or public.user_role() = 'admin');

create policy "projects_select" on public.projects
for select to authenticated
using (public.can_manage_sales() or public.can_manage_measurements() or public.can_manage_installations());

create policy "projects_write" on public.projects
for all to authenticated
using (public.can_manage_sales() or public.can_manage_measurements() or public.can_manage_installations())
with check (public.can_manage_sales() or public.can_manage_measurements() or public.can_manage_installations());

create policy "rooms_select" on public.rooms
for select to authenticated
using (public.can_manage_sales() or public.can_manage_measurements() or public.can_manage_installations());

create policy "rooms_write" on public.rooms
for all to authenticated
using (public.can_manage_measurements() or public.user_role() = 'admin')
with check (public.can_manage_measurements() or public.user_role() = 'admin');

create policy "measurements_select" on public.measurements
for select to authenticated
using (public.can_manage_sales() or public.can_manage_measurements() or public.user_role() = 'admin');

create policy "measurements_write" on public.measurements
for all to authenticated
using (public.can_manage_measurements() or public.user_role() = 'admin')
with check (public.can_manage_measurements() or public.user_role() = 'admin');

create policy "quotations_select" on public.quotations
for select to authenticated
using (public.can_manage_sales() or public.user_role() = 'admin');

create policy "quotations_write" on public.quotations
for all to authenticated
using (public.can_manage_sales() or public.user_role() = 'admin')
with check (public.can_manage_sales() or public.user_role() = 'admin');

create policy "quotation_items_select" on public.quotation_items
for select to authenticated
using (public.can_manage_sales() or public.user_role() = 'admin');

create policy "quotation_items_write" on public.quotation_items
for all to authenticated
using (public.can_manage_sales() or public.user_role() = 'admin')
with check (public.can_manage_sales() or public.user_role() = 'admin');

create policy "installations_select" on public.installations
for select to authenticated
using (public.can_manage_sales() or public.can_manage_installations() or public.user_role() = 'admin');

create policy "installations_write" on public.installations
for all to authenticated
using (public.can_manage_installations() or public.user_role() = 'admin')
with check (public.can_manage_installations() or public.user_role() = 'admin');

create policy "payments_select" on public.payments
for select to authenticated
using (public.can_manage_sales() or public.user_role() = 'admin');

create policy "payments_write" on public.payments
for all to authenticated
using (public.can_manage_sales() or public.user_role() = 'admin')
with check (public.can_manage_sales() or public.user_role() = 'admin');

insert into storage.buckets (id, name, public)
values ('measurement-photos', 'measurement-photos', false)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;

create policy "measurement_photos_read" on storage.objects
for select to authenticated
using (bucket_id = 'measurement-photos' and split_part(name, '/', 1) = auth.uid()::text);

create policy "measurement_photos_write" on storage.objects
for insert to authenticated
with check (bucket_id = 'measurement-photos' and split_part(name, '/', 1) = auth.uid()::text);

create policy "measurement_photos_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'measurement-photos' and split_part(name, '/', 1) = auth.uid()::text);

create policy "payment_proofs_read" on storage.objects
for select to authenticated
using (bucket_id = 'payment-proofs' and split_part(name, '/', 1) = auth.uid()::text);

create policy "payment_proofs_write" on storage.objects
for insert to authenticated
with check (bucket_id = 'payment-proofs' and split_part(name, '/', 1) = auth.uid()::text);

create policy "payment_proofs_delete" on storage.objects
for delete to authenticated
using (bucket_id = 'payment-proofs' and split_part(name, '/', 1) = auth.uid()::text);
