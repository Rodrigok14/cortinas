-- 003_investors.sql

create table if not exists public.investors (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  dia_pago integer not null check (dia_pago between 1 and 31),
  monto_invertido numeric(12,2) not null default 0 check (monto_invertido >= 0),
  porcentaje_inversion numeric(5,2) not null default 0 check (porcentaje_inversion >= 0 and porcentaje_inversion <= 100),
  monto_neto numeric(12,2) not null default 0 check (monto_neto >= 0),
  fecha_a_pagar date not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'pagado', 'vencido')),
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_investors_fecha_a_pagar on public.investors(fecha_a_pagar);
create index if not exists idx_investors_estado on public.investors(estado);

create trigger trg_investors_updated_at
before update on public.investors
for each row execute procedure public.set_updated_at();

alter table public.investors enable row level security;

create policy "investors_select" on public.investors
for select to authenticated
using (public.user_role() = 'admin');

create policy "investors_write" on public.investors
for all to authenticated
using (public.user_role() = 'admin')
with check (public.user_role() = 'admin');
