-- 008_sales_machine.sql
-- CRM: leads + actividades + sales_tasks. Automaciones para seguimiento.
-- Nota: existe `public.tasks` para módulo AI/organizaciones (no tocar). Usamos `public.sales_tasks`.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'lead_status') then
    create type public.lead_status as enum (
      'nuevo',
      'contactado',
      'visita_programada',
      'medicion_realizada',
      'cotizacion_enviada',
      'seguimiento',
      'cerrado_ganado',
      'cerrado_perdido'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'sales_task_status') then
    create type public.sales_task_status as enum ('pendiente', 'en_progreso', 'completada', 'cancelada');
  end if;

  if not exists (select 1 from pg_type where typname = 'sales_task_priority') then
    create type public.sales_task_priority as enum ('baja', 'media', 'alta');
  end if;

  if not exists (select 1 from pg_type where typname = 'lead_activity_type') then
    create type public.lead_activity_type as enum ('llamada', 'whatsapp', 'visita', 'seguimiento', 'nota');
  end if;
end
$$;

create table if not exists public.lost_reasons (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  descripcion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete set null,
  nombre text,
  telefono text,
  email text,
  ciudad text,
  fuente text,
  estado public.lead_status not null default 'nuevo',
  prioridad public.sales_task_priority not null default 'media',
  observaciones text,
  assigned_to uuid references auth.users(id) on delete set null,
  lost_reason_id uuid references public.lost_reasons(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leads_estado on public.leads (estado);
create index if not exists idx_leads_assigned on public.leads (assigned_to);
create index if not exists idx_leads_created on public.leads (created_at);

create table if not exists public.lead_activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  tipo public.lead_activity_type not null,
  descripcion text,
  fecha timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_lead_activities_lead on public.lead_activities (lead_id);
create index if not exists idx_lead_activities_fecha on public.lead_activities (fecha);

create table if not exists public.sales_tasks (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  tipo text,
  estado public.sales_task_status not null default 'pendiente',
  prioridad public.sales_task_priority not null default 'media',
  fecha_vencimiento date,
  assigned_to uuid references auth.users(id) on delete set null,
  client_id uuid references public.clients(id) on delete set null,
  lead_id uuid references public.leads(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_sales_tasks_estado on public.sales_tasks (estado);
create index if not exists idx_sales_tasks_venc on public.sales_tasks (fecha_vencimiento);
create index if not exists idx_sales_tasks_assigned on public.sales_tasks (assigned_to);

-- updated_at triggers
create trigger trg_lost_reasons_updated_at before update on public.lost_reasons for each row execute procedure public.set_updated_at();
create trigger trg_leads_updated_at before update on public.leads for each row execute procedure public.set_updated_at();
create trigger trg_lead_activities_updated_at before update on public.lead_activities for each row execute procedure public.set_updated_at();
create trigger trg_sales_tasks_updated_at before update on public.sales_tasks for each row execute procedure public.set_updated_at();

-- Automación: cuando un lead pasa a cotizacion_enviada -> crear 2 tareas de seguimiento
create or replace function public.trg_lead_followups()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and old.estado is distinct from new.estado and new.estado = 'cotizacion_enviada' then
    insert into public.sales_tasks (titulo, descripcion, tipo, estado, prioridad, fecha_vencimiento, assigned_to, client_id, lead_id)
    values
      ('Seguimiento cotización (3 días)', 'Contactar al cliente para seguimiento de cotización.', 'seguimiento', 'pendiente', new.prioridad, (current_date + 3), new.assigned_to, new.client_id, new.id),
      ('Seguimiento cotización (7 días)', 'Segundo seguimiento antes de dar por perdida.', 'seguimiento', 'pendiente', new.prioridad, (current_date + 7), new.assigned_to, new.client_id, new.id);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_leads_followups on public.leads;
create trigger trg_leads_followups
after update on public.leads
for each row execute procedure public.trg_lead_followups();

-- RLS
alter table public.lost_reasons enable row level security;
alter table public.leads enable row level security;
alter table public.lead_activities enable row level security;
alter table public.sales_tasks enable row level security;

-- Políticas: admin todo; vendedor ve asignados o no asignados
create policy "leads_select" on public.leads
for select to authenticated
using (
  public.user_role() = 'admin'
  or public.user_role() = 'vendedor'
  and (assigned_to = auth.uid() or assigned_to is null)
);

create policy "leads_write" on public.leads
for all to authenticated
using (public.user_role() in ('admin','vendedor'))
with check (public.user_role() in ('admin','vendedor'));

create policy "lead_activities_select" on public.lead_activities
for select to authenticated
using (public.user_role() in ('admin','vendedor'));

create policy "lead_activities_write" on public.lead_activities
for all to authenticated
using (public.user_role() in ('admin','vendedor'))
with check (public.user_role() in ('admin','vendedor'));

create policy "sales_tasks_select" on public.sales_tasks
for select to authenticated
using (
  public.user_role() = 'admin'
  or public.user_role() = 'vendedor'
  and (assigned_to = auth.uid() or assigned_to is null)
);

create policy "sales_tasks_write" on public.sales_tasks
for all to authenticated
using (public.user_role() in ('admin','vendedor'))
with check (public.user_role() in ('admin','vendedor'));

create policy "lost_reasons_select" on public.lost_reasons
for select to authenticated
using (public.user_role() = 'admin');

create policy "lost_reasons_write" on public.lost_reasons
for all to authenticated
using (public.user_role() = 'admin')
with check (public.user_role() = 'admin');

