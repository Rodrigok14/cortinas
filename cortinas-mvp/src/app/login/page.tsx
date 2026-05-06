import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { LoginForm } from "@/modules/auth/login-form";

type Props = { searchParams?: { error?: string } };

export default async function LoginPage({ searchParams }: Props) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Panel Cortinas</h1>
          <p className="text-sm text-slate-600">Ingresa con tu cuenta para continuar.</p>
        </div>
        <LoginForm error={searchParams?.error} />
      </Card>
    </main>
  );
}
