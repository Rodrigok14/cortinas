-- 007_ai_module.sql
-- Placeholder file to match remote migration history.
-- This migration was already applied on the remote database.
-- (Original created organizations + AI tables + public.tasks for AI tool.)

-- 007_ai_module.sql
-- Organizations (multi-tenant bootstrap) + AI conversations/messages + minimal tasks for AI tool.
-- Notes:
-- - Existing ERP tables are NOT migrated to org scope yet (phase 2+).
-- - All reads/writes from the app should use Supabase user session (RLS).

create extension if not exists "pgcrypto";

-- ===============
-- Organizations
-- ===============
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_organizations_created_by on public.organizations(created_by);

create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now(),
  unique(organization_id, user_id)
);

create index if not exists idx_org_members_org on public.organization_members(organization_id);
create index if not exists idx_org_members_user on public.organization_members(user_id);

-- Add organization_id to profiles (bootstrap; nullable)
alter table public.profiles
add column if not exists organization_id uuid references public.organizations(id) on delete set null;

create index if not exists idx_profiles_org on public.profiles(organization_id);

-- Helper: org membership
create or replace function public.is_org_member(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = p_org
      and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_org_admin(p_org uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = p_org
      and m.user_id = auth.uid()
      and m.role = 'admin'
  );
$$;

-- updated_at triggers
drop trigger if exists trg_organizations_updated_at on public.organizations;
create trigger trg_organizations_updated_at before update on public.organizations
for each row execute procedure public.set_updated_at();

-- ===============
-- AI tables
-- ===============
create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_ai_conversations_org_user_updated
on public.ai_conversations(organization_id, user_id, updated_at desc);

create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  role text not null check (role in ('system', 'user', 'assistant', 'tool')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_ai_messages_conversation_created
on public.ai_messages(conversation_id, created_at);

create index if not exists idx_ai_messages_org_created
on public.ai_messages(organization_id, created_at);

drop trigger if exists trg_ai_conversations_updated_at on public.ai_conversations;
create trigger trg_ai_conversations_updated_at before update on public.ai_conversations
for each row execute procedure public.set_updated_at();

-- ===============
-- Minimal tasks table (required by AI createTask tool)
-- ===============
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done', 'cancelled')),
  due_date date,
  created_by uuid not null references auth.users(id) on delete restrict,
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tasks_org_status_due on public.tasks(organization_id, status, due_date);
create index if not exists idx_tasks_assigned_to on public.tasks(assigned_to);

drop trigger if exists trg_tasks_updated_at on public.tasks;
create trigger trg_tasks_updated_at before update on public.tasks
for each row execute procedure public.set_updated_at();

-- ===============
-- Lightweight views for AI aggregates
-- ===============
create or replace view public.vw_pending_receivables_total as
select
  coalesce(sum(q.saldo), 0) as pending_receivables
from public.quotations q
where coalesce(q.saldo, 0) > 0;

-- ===============
-- RLS
-- ===============
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;
alter table public.tasks enable row level security;

-- organizations policies
drop policy if exists organizations_select on public.organizations;
create policy "organizations_select" on public.organizations
for select to authenticated
using (public.is_org_member(id));

drop policy if exists organizations_insert on public.organizations;
create policy "organizations_insert" on public.organizations
for insert to authenticated
with check (created_by = auth.uid());

drop policy if exists organizations_update on public.organizations;
create policy "organizations_update" on public.organizations
for update to authenticated
using (public.is_org_admin(id))
with check (public.is_org_admin(id));

drop policy if exists organizations_delete on public.organizations;
create policy "organizations_delete" on public.organizations
for delete to authenticated
using (public.is_org_admin(id));

-- organization_members policies
drop policy if exists org_members_select on public.organization_members;
create policy "org_members_select" on public.organization_members
for select to authenticated
using (public.is_org_member(organization_id));

-- bootstrap: creator can add themselves as admin immediately after creating org
drop policy if exists org_members_insert_self_admin_bootstrap on public.organization_members;
create policy "org_members_insert_self_admin_bootstrap" on public.organization_members
for insert to authenticated
with check (
  user_id = auth.uid()
  and role = 'admin'
  and exists (
    select 1 from public.organizations o
    where o.id = organization_id
      and o.created_by = auth.uid()
  )
);

-- admin can manage memberships afterwards
drop policy if exists org_members_manage_by_admin on public.organization_members;
create policy "org_members_manage_by_admin" on public.organization_members
for all to authenticated
using (public.is_org_admin(organization_id))
with check (public.is_org_admin(organization_id));

-- profiles: keep existing select/insert policies; harden update with org membership check
drop policy if exists profiles_self_update on public.profiles;
create policy "profiles_self_update" on public.profiles
for update to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and (organization_id is null or public.is_org_member(organization_id))
);

-- ai_conversations policies
drop policy if exists ai_conversations_select on public.ai_conversations;
create policy "ai_conversations_select" on public.ai_conversations
for select to authenticated
using (
  public.is_org_member(organization_id)
  and (user_id = auth.uid() or public.user_role() = 'admin')
);

drop policy if exists ai_conversations_insert on public.ai_conversations;
create policy "ai_conversations_insert" on public.ai_conversations
for insert to authenticated
with check (
  public.is_org_member(organization_id)
  and user_id = auth.uid()
);

drop policy if exists ai_conversations_update on public.ai_conversations;
create policy "ai_conversations_update" on public.ai_conversations
for update to authenticated
using (
  public.is_org_member(organization_id)
  and (user_id = auth.uid() or public.user_role() = 'admin')
)
with check (
  public.is_org_member(organization_id)
  and (user_id = auth.uid() or public.user_role() = 'admin')
);

drop policy if exists ai_conversations_delete on public.ai_conversations;
create policy "ai_conversations_delete" on public.ai_conversations
for delete to authenticated
using (
  public.is_org_member(organization_id)
  and (user_id = auth.uid() or public.user_role() = 'admin')
);

-- ai_messages policies
drop policy if exists ai_messages_select on public.ai_messages;
create policy "ai_messages_select" on public.ai_messages
for select to authenticated
using (
  public.is_org_member(organization_id)
  and exists (
    select 1
    from public.ai_conversations c
    where c.id = conversation_id
      and c.organization_id = organization_id
      and (c.user_id = auth.uid() or public.user_role() = 'admin')
  )
);

drop policy if exists ai_messages_insert on public.ai_messages;
create policy "ai_messages_insert" on public.ai_messages
for insert to authenticated
with check (
  public.is_org_member(organization_id)
  and exists (
    select 1
    from public.ai_conversations c
    where c.id = conversation_id
      and c.organization_id = organization_id
      and (c.user_id = auth.uid() or public.user_role() = 'admin')
  )
);

-- tasks policies (org-scoped; only certain roles can write)
drop policy if exists tasks_select on public.tasks;
create policy "tasks_select" on public.tasks
for select to authenticated
using (public.is_org_member(organization_id));

drop policy if exists tasks_insert on public.tasks;
create policy "tasks_insert" on public.tasks
for insert to authenticated
with check (
  public.is_org_member(organization_id)
  and created_by = auth.uid()
  and (public.user_role() in ('admin', 'vendedor'))
);

drop policy if exists tasks_update on public.tasks;
create policy "tasks_update" on public.tasks
for update to authenticated
using (
  public.is_org_member(organization_id)
  and (created_by = auth.uid() or public.user_role() = 'admin')
)
with check (
  public.is_org_member(organization_id)
  and (created_by = auth.uid() or public.user_role() = 'admin')
);

drop policy if exists tasks_delete on public.tasks;
create policy "tasks_delete" on public.tasks
for delete to authenticated
using (
  public.is_org_member(organization_id)
  and (created_by = auth.uid() or public.user_role() = 'admin')
);

