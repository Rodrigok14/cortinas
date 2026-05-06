-- 002_business_controls.sql

do $$
begin
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('realizado', 'pendiente', 'en_produccion', 'entregado', 'cancelado');
  end if;
end
$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete restrict,
  quotation_id uuid references public.quotations(id) on delete set null,
  numero text not null unique,
  fecha_pedido date not null,
  estado public.order_status not null default 'pendiente',
  fecha_entrega_estimada date,
  fecha_entrega_real date,
  total_venta numeric(12,2) not null default 0,
  costo_total numeric(12,2) not null default 0,
  ganancia_neta numeric(12,2) not null default 0,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_costs (
  id uuid primary key default gen_random_uuid(),
  categoria text not null,
  producto text not null,
  costo_unitario numeric(12,2) not null default 0,
  unidad text not null,
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  categoria text not null,
  descripcion text not null,
  monto numeric(12,2) not null check (monto > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_client_id on public.orders(client_id);
create index if not exists idx_orders_estado on public.orders(estado);
create index if not exists idx_orders_fecha on public.orders(fecha_pedido);
create index if not exists idx_product_costs_categoria on public.product_costs(categoria);
create index if not exists idx_expenses_fecha on public.expenses(fecha);

create trigger trg_orders_updated_at before update on public.orders for each row execute procedure public.set_updated_at();
create trigger trg_product_costs_updated_at before update on public.product_costs for each row execute procedure public.set_updated_at();
create trigger trg_expenses_updated_at before update on public.expenses for each row execute procedure public.set_updated_at();

create or replace function public.trg_orders_profit()
returns trigger
language plpgsql
as $$
begin
  new.ganancia_neta := coalesce(new.total_venta, 0) - coalesce(new.costo_total, 0);

  if new.estado = 'entregado' and new.fecha_entrega_real is null then
    new.fecha_entrega_real := current_date;
  end if;

  return new;
end;
$$;

create trigger trg_orders_profit_biu
before insert or update on public.orders
for each row execute procedure public.trg_orders_profit();

alter table public.orders enable row level security;
alter table public.product_costs enable row level security;
alter table public.expenses enable row level security;

create policy "orders_select" on public.orders
for select to authenticated
using (public.can_manage_sales() or public.user_role() = 'admin');

create policy "orders_write" on public.orders
for all to authenticated
using (public.can_manage_sales() or public.user_role() = 'admin')
with check (public.can_manage_sales() or public.user_role() = 'admin');

create policy "product_costs_select" on public.product_costs
for select to authenticated
using (public.user_role() = 'admin');

create policy "product_costs_write" on public.product_costs
for all to authenticated
using (public.user_role() = 'admin')
with check (public.user_role() = 'admin');

create policy "expenses_select" on public.expenses
for select to authenticated
using (public.user_role() = 'admin');

create policy "expenses_write" on public.expenses
for all to authenticated
using (public.user_role() = 'admin')
with check (public.user_role() = 'admin');
