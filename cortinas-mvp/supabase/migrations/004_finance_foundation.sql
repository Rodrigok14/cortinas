-- 004_finance_foundation.sql
-- Base financiera: ledger + categorías + suppliers/employees + expenses_v2.
-- Mantiene intactas cotizaciones/pagos existentes; solo agrega trazabilidad.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'ledger_entry_type') then
    create type public.ledger_entry_type as enum ('income', 'expense');
  end if;

  if not exists (select 1 from pg_type where typname = 'ledger_flow_type') then
    create type public.ledger_flow_type as enum ('cash', 'accrual');
  end if;

  if not exists (select 1 from pg_type where typname = 'expense_type') then
    create type public.expense_type as enum ('COGS', 'OPEX');
  end if;
end
$$;

create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  tipo public.expense_type not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.expense_subcategories (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.expense_categories(id) on delete cascade,
  nombre text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(category_id, nombre)
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  telefono text,
  email text,
  direccion text,
  cuit text,
  notas text,
  estado text not null default 'activo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_suppliers_nombre on public.suppliers (nombre);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  apellido text,
  telefono text,
  email text,
  cargo text,
  fecha_ingreso date,
  estado text not null default 'activo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_employees_nombre on public.employees (nombre);

create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  tipo public.ledger_entry_type not null,
  flow_type public.ledger_flow_type not null default 'cash',
  category_id uuid references public.expense_categories(id) on delete set null,
  subcategory_id uuid references public.expense_subcategories(id) on delete set null,
  descripcion text,
  monto numeric(12,2) not null check (monto > 0),
  metodo_pago text,

  client_id uuid references public.clients(id) on delete set null,
  supplier_id uuid references public.suppliers(id) on delete set null,
  employee_id uuid references public.employees(id) on delete set null,

  project_id uuid references public.projects(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  quotation_id uuid references public.quotations(id) on delete set null,

  source_table text not null,
  source_id uuid not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_ledger_source_unique on public.ledger_entries (source_table, source_id);
create index if not exists idx_ledger_fecha on public.ledger_entries (fecha);
create index if not exists idx_ledger_tipo on public.ledger_entries (tipo);
create index if not exists idx_ledger_category on public.ledger_entries (category_id);
create index if not exists idx_ledger_client on public.ledger_entries (client_id);

create table if not exists public.expenses_v2 (
  id uuid primary key default gen_random_uuid(),
  fecha date not null,
  category_id uuid not null references public.expense_categories(id) on delete restrict,
  subcategory_id uuid references public.expense_subcategories(id) on delete set null,
  descripcion text not null,
  monto numeric(12,2) not null check (monto > 0),
  metodo_pago text,

  supplier_id uuid references public.suppliers(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_expenses_v2_fecha on public.expenses_v2 (fecha);
create index if not exists idx_expenses_v2_category on public.expenses_v2 (category_id);
create index if not exists idx_expenses_v2_supplier on public.expenses_v2 (supplier_id);

-- updated_at triggers
drop trigger if exists trg_expense_categories_updated_at on public.expense_categories;
create trigger trg_expense_categories_updated_at before update on public.expense_categories for each row execute procedure public.set_updated_at();

drop trigger if exists trg_expense_subcategories_updated_at on public.expense_subcategories;
create trigger trg_expense_subcategories_updated_at before update on public.expense_subcategories for each row execute procedure public.set_updated_at();

drop trigger if exists trg_suppliers_updated_at on public.suppliers;
create trigger trg_suppliers_updated_at before update on public.suppliers for each row execute procedure public.set_updated_at();

drop trigger if exists trg_employees_updated_at on public.employees;
create trigger trg_employees_updated_at before update on public.employees for each row execute procedure public.set_updated_at();

drop trigger if exists trg_ledger_entries_updated_at on public.ledger_entries;
create trigger trg_ledger_entries_updated_at before update on public.ledger_entries for each row execute procedure public.set_updated_at();

drop trigger if exists trg_expenses_v2_updated_at on public.expenses_v2;
create trigger trg_expenses_v2_updated_at before update on public.expenses_v2 for each row execute procedure public.set_updated_at();

-- RLS
alter table public.expense_categories enable row level security;
alter table public.expense_subcategories enable row level security;
alter table public.suppliers enable row level security;
alter table public.employees enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.expenses_v2 enable row level security;

-- Políticas (admin por defecto)
drop policy if exists expense_categories_select on public.expense_categories;
drop policy if exists expense_categories_write on public.expense_categories;
drop policy if exists expense_subcategories_select on public.expense_subcategories;
drop policy if exists expense_subcategories_write on public.expense_subcategories;
drop policy if exists suppliers_select on public.suppliers;
drop policy if exists suppliers_write on public.suppliers;
drop policy if exists employees_select on public.employees;
drop policy if exists employees_write on public.employees;
drop policy if exists ledger_entries_select on public.ledger_entries;
drop policy if exists ledger_entries_write on public.ledger_entries;
drop policy if exists expenses_v2_select on public.expenses_v2;
drop policy if exists expenses_v2_write on public.expenses_v2;

create policy "expense_categories_select" on public.expense_categories
for select to authenticated
using (public.user_role() = 'admin');

create policy "expense_categories_write" on public.expense_categories
for all to authenticated
using (public.user_role() = 'admin')
with check (public.user_role() = 'admin');

create policy "expense_subcategories_select" on public.expense_subcategories
for select to authenticated
using (public.user_role() = 'admin');

create policy "expense_subcategories_write" on public.expense_subcategories
for all to authenticated
using (public.user_role() = 'admin')
with check (public.user_role() = 'admin');

create policy "suppliers_select" on public.suppliers
for select to authenticated
using (public.user_role() = 'admin');

create policy "suppliers_write" on public.suppliers
for all to authenticated
using (public.user_role() = 'admin')
with check (public.user_role() = 'admin');

create policy "employees_select" on public.employees
for select to authenticated
using (public.user_role() = 'admin');

create policy "employees_write" on public.employees
for all to authenticated
using (public.user_role() = 'admin')
with check (public.user_role() = 'admin');

create policy "ledger_entries_select" on public.ledger_entries
for select to authenticated
using (public.user_role() = 'admin');

create policy "ledger_entries_write" on public.ledger_entries
for all to authenticated
using (public.user_role() = 'admin')
with check (public.user_role() = 'admin');

create policy "expenses_v2_select" on public.expenses_v2
for select to authenticated
using (public.user_role() = 'admin');

create policy "expenses_v2_write" on public.expenses_v2
for all to authenticated
using (public.user_role() = 'admin')
with check (public.user_role() = 'admin');

-- Seed mínimo de categorías/subcategorías si está vacío
insert into public.expense_categories (nombre, tipo)
select * from (values
  ('Materiales', 'COGS'::public.expense_type),
  ('Mano de obra', 'COGS'::public.expense_type),
  ('Operativos', 'OPEX'::public.expense_type),
  ('Sueldos', 'OPEX'::public.expense_type),
  ('Marketing', 'OPEX'::public.expense_type)
) as v(nombre, tipo)
where not exists (select 1 from public.expense_categories);

-- Función helper para upsert de ledger (se usa por triggers)
create or replace function public.upsert_ledger_entry(
  p_source_table text,
  p_source_id uuid,
  p_fecha date,
  p_tipo public.ledger_entry_type,
  p_flow public.ledger_flow_type,
  p_monto numeric,
  p_descripcion text,
  p_metodo_pago text,
  p_client_id uuid,
  p_supplier_id uuid,
  p_employee_id uuid,
  p_project_id uuid,
  p_order_id uuid,
  p_quotation_id uuid,
  p_category_id uuid,
  p_subcategory_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.ledger_entries (
    source_table, source_id, fecha, tipo, flow_type, monto, descripcion, metodo_pago,
    client_id, supplier_id, employee_id, project_id, order_id, quotation_id,
    category_id, subcategory_id
  ) values (
    p_source_table, p_source_id, p_fecha, p_tipo, p_flow, round(p_monto::numeric, 2), p_descripcion, p_metodo_pago,
    p_client_id, p_supplier_id, p_employee_id, p_project_id, p_order_id, p_quotation_id,
    p_category_id, p_subcategory_id
  )
  on conflict (source_table, source_id)
  do update set
    fecha = excluded.fecha,
    tipo = excluded.tipo,
    flow_type = excluded.flow_type,
    monto = excluded.monto,
    descripcion = excluded.descripcion,
    metodo_pago = excluded.metodo_pago,
    client_id = excluded.client_id,
    supplier_id = excluded.supplier_id,
    employee_id = excluded.employee_id,
    project_id = excluded.project_id,
    order_id = excluded.order_id,
    quotation_id = excluded.quotation_id,
    category_id = excluded.category_id,
    subcategory_id = excluded.subcategory_id,
    updated_at = now();
end;
$$;

-- Triggers → ledger para expenses_v2
create or replace function public.trg_expenses_v2_to_ledger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    delete from public.ledger_entries where source_table = 'expenses_v2' and source_id = old.id;
    return old;
  end if;

  perform public.upsert_ledger_entry(
    'expenses_v2',
    new.id,
    new.fecha,
    'expense'::public.ledger_entry_type,
    'cash'::public.ledger_flow_type,
    new.monto,
    new.descripcion,
    new.metodo_pago,
    null,
    new.supplier_id,
    null,
    new.project_id,
    new.order_id,
    null,
    new.category_id,
    new.subcategory_id
  );

  return new;
end;
$$;

drop trigger if exists trg_expenses_v2_ledger_upsert on public.expenses_v2;
create trigger trg_expenses_v2_ledger_upsert
after insert or update on public.expenses_v2
for each row execute procedure public.trg_expenses_v2_to_ledger();

drop trigger if exists trg_expenses_v2_ledger_delete on public.expenses_v2;
create trigger trg_expenses_v2_ledger_delete
after delete on public.expenses_v2
for each row execute procedure public.trg_expenses_v2_to_ledger();

-- Triggers → ledger para payments (ingresos) SIN CAMBIAR la lógica de cotizaciones
create or replace function public.trg_payments_to_ledger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_client_id uuid;
begin
  if tg_op = 'DELETE' then
    delete from public.ledger_entries where source_table = 'payments' and source_id = old.id;
    return old;
  end if;

  select q.client_id
  into v_client_id
  from public.quotations q
  where q.id = new.quotation_id;

  perform public.upsert_ledger_entry(
    'payments',
    new.id,
    new.fecha_pago,
    'income'::public.ledger_entry_type,
    'cash'::public.ledger_flow_type,
    new.monto,
    coalesce(new.observaciones, 'Cobro cliente'),
    new.medio_pago,
    v_client_id,
    null,
    null,
    null,
    null,
    new.quotation_id,
    null,
    null
  );

  return new;
end;
$$;

drop trigger if exists trg_payments_ledger_upsert on public.payments;
create trigger trg_payments_ledger_upsert
after insert or update on public.payments
for each row execute procedure public.trg_payments_to_ledger();

drop trigger if exists trg_payments_ledger_delete on public.payments;
create trigger trg_payments_ledger_delete
after delete on public.payments
for each row execute procedure public.trg_payments_to_ledger();

