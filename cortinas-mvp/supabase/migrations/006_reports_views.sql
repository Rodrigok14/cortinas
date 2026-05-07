-- 006_reports_views.sql
-- Vistas de reporting sobre ledger_entries (cash basis).

create or replace view public.vw_pl_monthly as
select
  date_trunc('month', le.fecha)::date as month,
  sum(case when le.tipo = 'income' then le.monto else 0 end) as ingresos,
  sum(case when le.tipo = 'expense' and ec.tipo = 'COGS' then le.monto else 0 end) as costos_directos,
  sum(case when le.tipo = 'expense' and ec.tipo = 'OPEX' then le.monto else 0 end) as gastos_operativos,
  sum(case when le.tipo = 'income' then le.monto else 0 end)
    - sum(case when le.tipo = 'expense' then le.monto else 0 end) as resultado_neto
from public.ledger_entries le
left join public.expense_categories ec on ec.id = le.category_id
where le.flow_type = 'cash'
group by 1
order by 1 desc;

create or replace view public.vw_cashflow_monthly as
select
  date_trunc('month', le.fecha)::date as month,
  sum(case when le.tipo = 'income' then le.monto else 0 end) as ingresos_caja,
  sum(case when le.tipo = 'expense' then le.monto else 0 end) as egresos_caja,
  sum(case when le.tipo = 'income' then le.monto else 0 end)
    - sum(case when le.tipo = 'expense' then le.monto else 0 end) as neto_caja
from public.ledger_entries le
where le.flow_type = 'cash'
group by 1
order by 1 desc;

