import { ModuleHeader } from "@/components/common/module-header";
import { Card } from "@/components/ui/card";
import { requireModuleAccess } from "@/lib/auth";
import { CotizadorApp } from "@/modules/cotizador/cotizador-app";

type Props = {
  searchParams?: {
    ok?: string;
    numero?: string;
    error?: string;
  };
};

export default async function CotizadorPage({ searchParams }: Props) {
  await requireModuleAccess("cotizador");

  return (
    <section className="space-y-4">
      <ModuleHeader
        title="Cotizador Comercial"
        description="Cotizacion rapida, clara y profesional por tipo de cortina"
      />
      {searchParams?.ok === "1" && (
        <Card className="border-emerald-200 bg-emerald-50">
          <p className="text-sm font-semibold text-emerald-700">
            Presupuesto guardado correctamente. Numero generado: {searchParams.numero ?? "-"}
          </p>
        </Card>
      )}
      {searchParams?.error && (
        <Card className="border-rose-200 bg-rose-50">
          <p className="text-sm font-semibold text-rose-700">
            No se pudo guardar el presupuesto: {searchParams.error}
          </p>
        </Card>
      )}
      <CotizadorApp />
    </section>
  );
}
