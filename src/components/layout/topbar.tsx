import { ROLE_LABEL, type Role } from "@/lib/roles";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div>
        <p className="text-sm text-slate-500">Usuario</p>
        <p className="text-sm font-medium text-slate-800">{name ?? email}</p>
        <p className="text-xs text-slate-500">Rol: {ROLE_LABEL[role]}</p>
      </div>
      <form action={signOut}>
        <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-100">
          Cerrar sesion
        </button>
      </form>
    </div>
  );
}
