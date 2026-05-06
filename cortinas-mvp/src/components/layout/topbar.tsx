import { ROLE_LABEL, type Role } from "@/lib/roles";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { BRAND } from "@/lib/branding";

export function Topbar({
  email,
  role,
  name,
}: {
  email: string;
  role: Role;
  name: string | null;
}) {
  async function signOut() {
    "use server";
    const supabase = getSupabaseServerClient();
    await supabase.auth.signOut();
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_10px_28px_rgba(16,185,129,0.12)]">
      <div>
        <p className="text-xs uppercase tracking-wide text-[#8f7b67]">{BRAND.name}</p>
        <p className="text-sm font-semibold text-slate-800">{name ?? email}</p>
        <p className="status-pill mt-1 border-orange-200 bg-orange-50 text-orange-700">{ROLE_LABEL[role]}</p>
      </div>
      <form action={signOut}>
        <button className="btn-warm px-3 py-2 text-sm font-medium">
          Cerrar sesion
        </button>
      </form>
    </div>
  );
}
