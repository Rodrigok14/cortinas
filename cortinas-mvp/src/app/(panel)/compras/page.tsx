import { ModuleHeader } from "@/components/common/module-header";
import { Card } from "@/components/ui/card";
import { requireModuleAccess } from "@/lib/auth";

export default async function ComprasPage() {
  await requireModuleAccess("compras");

  return (
    <section className="space-y-4">
      <ModuleHeader title="Compras" description="Registro de compras y seguimiento de pagos." />
      <Card>
        <p className="text-sm text-slate-600">Modulo en construccion.</p>
      </Card>
    </section>
  );
}

