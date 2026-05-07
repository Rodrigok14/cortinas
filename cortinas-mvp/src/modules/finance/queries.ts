import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function getPlMonthly(limit = 12) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("vw_pl_monthly")
    .select("*")
    .order("month", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCashflowMonthly(limit = 12) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("vw_cashflow_monthly")
    .select("*")
    .order("month", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return data ?? [];
}

