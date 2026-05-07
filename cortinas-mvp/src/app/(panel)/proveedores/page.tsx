import { ModuleHeader } from "@/components/common/module-header";
import { Card } from "@/components/ui/card";
import { requireModuleAccess } from "@/lib/auth";

export default async function ProveedoresPage() {
  await requireModuleAccess("proveedores");

  return (
    <section className="space-y-4">
      <ModuleHeader title="Proveedores" description="ABM de proveedores y condiciones comerciales." />
      <Card>
        <p className="text-sm text-slate-600">Modulo en construccion.</p>
      </Card>
    </section>
  );
}

