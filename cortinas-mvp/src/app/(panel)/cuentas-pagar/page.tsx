import { ModuleHeader } from "@/components/common/module-header";
import { Card } from "@/components/ui/card";
import { requireModuleAccess } from "@/lib/auth";

export default async function CuentasPagarPage() {
  await requireModuleAccess("cuentas-pagar");

  return (
    <section className="space-y-4">
      <ModuleHeader title="Cuentas x pagar" description="Agenda de vencimientos y estado de cuentas a proveedores." />
      <Card>
        <p className="text-sm text-slate-600">Modulo en construccion.</p>
      </Card>
    </section>
  );
}

