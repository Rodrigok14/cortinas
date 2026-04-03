"use client";

import { Input } from "@/components/ui/input";
import { SubmitButton } from "@/components/ui/submit-button";
import { loginAction } from "@/modules/auth/actions";

export function LoginForm({ error }: { error?: string }) {
  return (
    <form action={loginAction} className="space-y-3">
      <div>
        <label className="mb-1 block text-sm text-slate-600">Email</label>
        <Input name="email" type="email" required />
      </div>
      <div>
        <label className="mb-1 block text-sm text-slate-600">Contrasena</label>
        <Input name="password" type="password" required />
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      <SubmitButton className="w-full" pendingText="Ingresando...">
        Ingresar
      </SubmitButton>
    </form>
  );
}
