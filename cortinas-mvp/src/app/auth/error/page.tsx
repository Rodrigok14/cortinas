export default function AuthErrorPage() {
  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="text-xl font-semibold text-slate-900">Error de autenticacion</h1>
      <p className="mt-2 text-sm text-slate-600">
        No se pudo validar tu sesion. Vuelve a iniciar sesion desde /login.
      </p>
    </main>
  );
}
