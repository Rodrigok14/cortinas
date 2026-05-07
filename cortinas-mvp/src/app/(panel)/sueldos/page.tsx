import { ModuleHeader } from "@/components/common/module-header";
import { Card } from "@/components/ui/card";
import { requireModuleAccess } from "@/lib/auth";

export default async function SueldosPage() {
  await requireModuleAccess("sueldos");

  return (
    <section className="space-y-4">
      <ModuleHeader title="Sueldos" description="Liquidacion, pagos y control de sueldos." />
      <Card>
        <p className="text-sm text-slate-600">Modulo en construccion.</p>
      </Card>
    </section>
  );
}

