-- 005_ap_payroll.sql
-- Proveedores + compras + cuentas por pagar (cuotas) + pagos a proveedores + sueldos.
-- Cash basis: los asientos en ledger se generan cuando efectivamente se paga.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'purchase_payment_type') then
    create type public.purchase_payment_type as enum ('contado', 'financiado', 'cuotas');
  end if;

  if not exists (select 1 from pg_type where typname = 'purchase_status') then
    create type public.purchase_status as enum ('borrador', 'confirmada', 'cancelada');
  end if;

  if not exists (select 1 from pg_type where typname = 'payable_status') then
    create type public.payable_status as enum ('pendiente', 'parcial', 'pagado', 'vencido', 'cancelado');
  end if;

  if not exists (select 1 from pg_type where typname = 'installment_status') then
    create type public.installment_status as enum ('pendiente', 'pagada', 'vencida', 'cancelada');
  end if;

  if not exists (select 1 from pg_type where typname = 'payroll_period_status') then
    create type public.payroll_period_status as enum ('abierto', 'cerrado');
  end if;
end
$$;

create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  numero_factura text,
  fecha date not null,
  tipo_pago public.purchase_payment_type not null default 'contado',
  estado public.purchase_status not null default 'confirmada',
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  impuestos numeric(12,2) not null default 0 check (impuestos >= 0),
  total numeric(12,2) not null default 0 check (total >= 0),
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_purchases_supplier on public.purchases (supplier_id);
create index if not exists idx_purchases_fecha on public.purchases (fecha);

create table if not exists public.purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  producto text not null,
  descripcion text,
  cantidad numeric(12,2) not null check (cantidad > 0),
  unidad text not null,
  costo_unitario numeric(12,2) not null default 0 check (costo_unitario >= 0),
  subtotal numeric(12,2) not null default 0 check (subtotal >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_purchase_items_purchase on public.purchase_items (purchase_id);

create table if not exists public.payables (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  purchase_id uuid references public.purchases(id) on delete set null,
  fecha date not null,
  total numeric(12,2) not null check (total > 0),
  estado public.payable_status not null default 'pendiente',
  fecha_vencimiento date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payables_supplier on public.payables (supplier_id);
create index if not exists idx_payables_fecha on public.payables (fecha);
create index if not exists idx_payables_estado on public.payables (estado);
create index if not exists idx_payables_venc on public.payables (fecha_vencimiento);

create table if not exists public.installments (
  id uuid primary key default gen_random_uuid(),
  payable_id uuid not null references public.payables(id) on delete cascade,
  numero_cuota integer not null check (numero_cuota >= 1),
  fecha_vencimiento date not null,
  monto numeric(12,2) not null check (monto > 0),
  estado public.installment_status not null default 'pendiente',
  pagado_at timestamptz,
  supplier_payment_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(payable_id, numero_cuota)
);

create index if not exists idx_installments_venc on public.installments (fecha_vencimiento);
create index if not exists idx_installments_estado on public.installments (estado);

create table if not exists public.supplier_payments (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references public.suppliers(id) on delete restrict,
  payable_id uuid references public.payables(id) on delete set null,
  installment_id uuid references public.installments(id) on delete set null,
  fecha date not null,
  monto numeric(12,2) not null check (monto > 0),
  metodo_pago text,
  referencia text,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_supplier_payments_supplier on public.supplier_payments (supplier_id);
create index if not exists idx_supplier_payments_fecha on public.supplier_payments (fecha);

-- Payroll
create table if not exists public.payroll_periods (
  id uuid primary key default gen_random_uuid(),
  mes integer not null check (mes between 1 and 12),
  anio integer not null check (anio between 2000 and 2100),
  estado public.payroll_period_status not null default 'abierto',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(mes, anio)
);

create table if not exists public.payroll_payments (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete restrict,
  period_id uuid references public.payroll_periods(id) on delete set null,
  fecha date not null,
  concepto text not null,
  monto numeric(12,2) not null check (monto > 0),
  metodo_pago text,
  notas text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payroll_payments_employee on public.payroll_payments (employee_id);
create index if not exists idx_payroll_payments_fecha on public.payroll_payments (fecha);

-- updated_at triggers
create trigger trg_purchases_updated_at before update on public.purchases for each row execute procedure public.set_updated_at();
create trigger trg_purchase_items_updated_at before update on public.purchase_items for each row execute procedure public.set_updated_at();
create trigger trg_payables_updated_at before update on public.payables for each row execute procedure public.set_updated_at();
create trigger trg_installments_updated_at before update on public.installments for each row execute procedure public.set_updated_at();
create trigger trg_supplier_payments_updated_at before update on public.supplier_payments for each row execute procedure public.set_updated_at();
create trigger trg_payroll_periods_updated_at before update on public.payroll_periods for each row execute procedure public.set_updated_at();
create trigger trg_payroll_payments_updated_at before update on public.payroll_payments for each row execute procedure public.set_updated_at();

-- Recalcular subtotales de items de compra + total de compra
create or replace function public.trg_purchase_item_subtotal()
returns trigger
language plpgsql
as $$
declare
  v_purchase_id uuid;
begin
  if tg_op <> 'DELETE' then
    new.subtotal := round((new.cantidad * new.costo_unitario)::numeric, 2);
    v_purchase_id := new.purchase_id;
  else
    v_purchase_id := old.purchase_id;
  end if;

  update public.purchases p
  set subtotal = coalesce((
      select sum(i.subtotal) from public.purchase_items i where i.purchase_id = v_purchase_id
    ), 0),
    total = round((
      coalesce((
        select sum(i.subtotal) from public.purchase_items i where i.purchase_id = v_purchase_id
      ), 0) + coalesce(p.impuestos, 0)
    )::numeric, 2)
  where p.id = v_purchase_id;

  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_purchase_items_subtotal on public.purchase_items;
create trigger trg_purchase_items_subtotal
before insert or update on public.purchase_items
for each row execute procedure public.trg_purchase_item_subtotal();

drop trigger if exists trg_purchase_items_subtotal_delete on public.purchase_items;
create trigger trg_purchase_items_subtotal_delete
after delete on public.purchase_items
for each row execute procedure public.trg_purchase_item_subtotal();

-- Aplicar pago a cuota (si se referencia)
create or replace function public.trg_supplier_payment_apply_installment()
returns trigger
language plpgsql
as $$
begin
  if new.installment_id is not null then
    update public.installments
    set estado = 'pagada',
        pagado_at = coalesce(pagado_at, now()),
        supplier_payment_id = new.id
    where id = new.installment_id;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_supplier_payment_apply_installment_ai on public.supplier_payments;
create trigger trg_supplier_payment_apply_installment_ai
after insert on public.supplier_payments
for each row execute procedure public.trg_supplier_payment_apply_installment();

-- Ledger: supplier_payments (egreso cash)
create or replace function public.trg_supplier_payments_to_ledger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_desc text;
begin
  if tg_op = 'DELETE' then
    delete from public.ledger_entries where source_table = 'supplier_payments' and source_id = old.id;
    return old;
  end if;

  v_desc := coalesce(new.notas, new.referencia, 'Pago a proveedor');

  perform public.upsert_ledger_entry(
    'supplier_payments',
    new.id,
    new.fecha,
    'expense'::public.ledger_entry_type,
    'cash'::public.ledger_flow_type,
    new.monto,
    v_desc,
    new.metodo_pago,
    null,
    new.supplier_id,
    null,
    null,
    null,
    null,
    (select id from public.expense_categories where nombre = 'Materiales' limit 1),
    null
  );

  return new;
end;
$$;

drop trigger if exists trg_supplier_payments_ledger_upsert on public.supplier_payments;
create trigger trg_supplier_payments_ledger_upsert
after insert or update on public.supplier_payments
for each row execute procedure public.trg_supplier_payments_to_ledger();

drop trigger if exists trg_supplier_payments_ledger_delete on public.supplier_payments;
create trigger trg_supplier_payments_ledger_delete
after delete on public.supplier_payments
for each row execute procedure public.trg_supplier_payments_to_ledger();

-- Ledger: payroll_payments (egreso cash)
create or replace function public.trg_payroll_payments_to_ledger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_desc text;
begin
  if tg_op = 'DELETE' then
    delete from public.ledger_entries where source_table = 'payroll_payments' and source_id = old.id;
    return old;
  end if;

  v_desc := coalesce(new.concepto, 'Pago de sueldo');

  perform public.upsert_ledger_entry(
    'payroll_payments',
    new.id,
    new.fecha,
    'expense'::public.ledger_entry_type,
    'cash'::public.ledger_flow_type,
    new.monto,
    v_desc,
    new.metodo_pago,
    null,
    null,
    new.employee_id,
    null,
    null,
    null,
    (select id from public.expense_categories where nombre = 'Sueldos' limit 1),
    null
  );

  return new;
end;
$$;

drop trigger if exists trg_payroll_payments_ledger_upsert on public.payroll_payments;
create trigger trg_payroll_payments_ledger_upsert
after insert or update on public.payroll_payments
for each row execute procedure public.trg_payroll_payments_to_ledger();

drop trigger if exists trg_payroll_payments_ledger_delete on public.payroll_payments;
create trigger trg_payroll_payments_ledger_delete
after delete on public.payroll_payments
for each row execute procedure public.trg_payroll_payments_to_ledger();

-- RLS
alter table public.purchases enable row level security;
alter table public.purchase_items enable row level security;
alter table public.payables enable row level security;
alter table public.installments enable row level security;
alter table public.supplier_payments enable row level security;
alter table public.payroll_periods enable row level security;
alter table public.payroll_payments enable row level security;

-- Políticas (admin por defecto)
create policy "purchases_select" on public.purchases
for select to authenticated
using (public.user_role() = 'admin');

create policy "purchases_write" on public.purchases
for all to authenticated
using (public.user_role() = 'admin')
with check (public.user_role() = 'admin');

create policy "purchase_items_select" on public.purchase_items
for select to authenticated
using (public.user_role() = 'admin');

create policy "purchase_items_write" on public.purchase_items
for all to authenticated
using (public.user_role() = 'admin')
with check (public.user_role() = 'admin');

create policy "payables_select" on public.payables
for select to authenticated
using (public.user_role() = 'admin');

create policy "payables_write" on public.payables
for all to authenticated
using (public.user_role() = 'admin')
with check (public.user_role() = 'admin');

create policy "installments_select" on public.installments
for select to authenticated
using (public.user_role() = 'admin');

create policy "installments_write" on public.installments
for all to authenticated
using (public.user_role() = 'admin')
with check (public.user_role() = 'admin');

create policy "supplier_payments_select" on public.supplier_payments
for select to authenticated
using (public.user_role() = 'admin');

create policy "supplier_payments_write" on public.supplier_payments
for all to authenticated
using (public.user_role() = 'admin')
with check (public.user_role() = 'admin');

create policy "payroll_periods_select" on public.payroll_periods
for select to authenticated
using (public.user_role() = 'admin');

create policy "payroll_periods_write" on public.payroll_periods
for all to authenticated
using (public.user_role() = 'admin')
with check (public.user_role() = 'admin');

create policy "payroll_payments_select" on public.payroll_payments
for select to authenticated
using (public.user_role() = 'admin');

create policy "payroll_payments_write" on public.payroll_payments
for all to authenticated
using (public.user_role() = 'admin')
with check (public.user_role() = 'admin');

