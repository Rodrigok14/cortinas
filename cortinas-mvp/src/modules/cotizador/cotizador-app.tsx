"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { SubmitButton } from "@/components/ui/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { money } from "@/lib/utils";
import { createBudgetAction } from "@/modules/cotizador/actions";
import { BRAND } from "@/lib/branding";
import { getPublicWhatsAppDigits } from "@/lib/whatsapp-public";

type QuoteSection = "genero" | "roller" | "bandas";
type MultiRow = {
  ancho: number;
  alto: number;
  cantidad: number;
  panos?: number;
};

type BudgetItem = {
  section: QuoteSection;
  detail: string;
  total: number;
};

const PLEAT_COEFFICIENTS: Record<string, number> = {
  "1_pellizco": 1.5,
  "2_pellizcos": 2.2,
  "3_pellizcos": 2.5,
};

const FABRIC_OPTIONS = [
  "Lino",
  "Blackout",
  "Tusor",
  "Voile",
  "Panama",
  "manual",
] as const;

const ROLLER_FABRIC_OPTIONS = [
  "Blackout - Beige",
  "Blackout - Blanco",
  "Blackout - Gris",
  "Blackout - Natural",
  "Blackout - Negro",
  "Sunscreen 5% - Beige",
  "Sunscreen 5% - Blanco",
  "Sunscreen 5% - Gris",
  "Sunscreen 5% - Natural",
  "Sunscreen 5% - Negro",
] as const;

const ROLLER_PRICE_M2 = 51000;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">{children}</label>;
}

function NumberInput({ onFocus, ...props }: Omit<React.ComponentProps<typeof Input>, "type">) {
  return (
    <Input
      {...props}
      type="number"
      inputMode="decimal"
      onFocus={(event) => {
        onFocus?.(event);
        event.currentTarget.select();
      }}
    />
  );
}

export function CotizadorApp() {
  const [section, setSection] = useState<QuoteSection>("genero");

  const [common, setCommon] = useState({
    cliente: "",
    telefono: "",
    direccion: "",
    ambiente: "",
    observaciones: "",
  });

  const [genero, setGenero] = useState({
    anchoVentana: 2.4,
    altoVentana: 2,
    cantidadPanos: 2,
    tipoTela: "Lino",
    tipoTelaManual: "",
    categoriaTela: "liviana",
    pliegue: "2_pellizcos",
    llevaRielEuropeo: true,
    llevaInstalacion: true,
    costoMetroTela: 14000,
    anchoTelaFijo: 2.8,
    costoRielMetroLineal: 19000,
    costoInstalacion: 28000,
  });

  const [roller, setRoller] = useState({
    ancho: 1.8,
    alto: 1.5,
    cantidad: 2,
    tipoTela: "Blackout - Beige",
    accionamiento: "cadena",
    sistemaCano: "38",
    caida: "atras",
    comando: "derecho",
    cadena: "plastico",
    incluyeInstalacion: true,
    precioM2: ROLLER_PRICE_M2,
    extraMotorUnidad: 65000,
    costoInstalacion: 22000,
  });

  const [bandas, setBandas] = useState({
    ancho: 2.4,
    alto: 2,
    cantidad: 1,
    tipoTela: "PVC",
    categoria: "standard",
    incluyeRiel: true,
    incluyeInstalacion: true,
    precioM2: 36000,
    costoRiel: 18000,
    costoInstalacion: 25000,
  });

  const [generoRows, setGeneroRows] = useState<MultiRow[]>([]);
  const [rollerRows, setRollerRows] = useState<MultiRow[]>([]);
  const [bandasRows, setBandasRows] = useState<MultiRow[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);

  function updateRow(
    setter: React.Dispatch<React.SetStateAction<MultiRow[]>>,
    index: number,
    key: keyof MultiRow,
    value: number,
  ) {
    setter((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  }

  const generoCalc = useMemo(() => {
    const coef = PLEAT_COEFFICIENTS[genero.pliegue] ?? 1.5;
    const categoryMultiplier = genero.categoriaTela === "pesada" ? 1.2 : 1;
    const calcRowMetros = (rowAncho: number, rowPanos: number, rowCantidad: number) => {
      const metrosLinealesBase = rowAncho * coef;
      const ajustePanos = 1 + Math.max(rowPanos - 1, 0) * 0.03;
      return metrosLinealesBase * ajustePanos * Math.max(rowCantidad, 1);
    };

    const baseMetros = calcRowMetros(genero.anchoVentana, genero.cantidadPanos, 1);
    const extraMetros = generoRows.reduce((sum, row) => sum + calcRowMetros(row.ancho, row.panos ?? 2, row.cantidad), 0);
    const metrosLineales = baseMetros + extraMetros;

    const costoTela = metrosLineales * genero.costoMetroTela * categoryMultiplier;
    const costoConfeccion = (metrosLineales / 1.5) * 14000;
    const extraRiel = generoRows.reduce(
      (sum, row) => sum + Math.max(row.ancho, 0) * Math.max(row.cantidad, 1),
      0,
    );
    const metrosRiel = Math.max(genero.anchoVentana, 0) + extraRiel;
    const costoRiel = genero.llevaRielEuropeo ? metrosRiel * genero.costoRielMetroLineal : 0;
    const costoInst = genero.llevaInstalacion ? genero.costoInstalacion : 0;
    const total = costoTela + costoConfeccion + costoRiel + costoInst;

    return {
      coef,
      metrosLineales,
      costoConfeccion,
      metrosRiel,
      costoTela,
      costoRiel,
      costoInst,
      total,
      medidasCount: 1 + generoRows.length,
    };
  }, [genero, generoRows]);

  const rollerCalc = useMemo(() => {
    const baseM2 = roller.ancho * roller.alto * roller.cantidad;
    const extraM2 = rollerRows.reduce((sum, row) => sum + row.ancho * row.alto * row.cantidad, 0);
    const m2 = baseM2 + extraM2;
    const totalCantidad = roller.cantidad + rollerRows.reduce((sum, row) => sum + row.cantidad, 0);
    const isSunscreen = roller.tipoTela.toLowerCase().includes("sunscreen");
    const precioM2Aplicado = isSunscreen ? roller.precioM2 * 1.1 : roller.precioM2;
    const base = m2 * precioM2Aplicado;
    const extraMotor = roller.accionamiento === "motor" ? roller.extraMotorUnidad * totalCantidad : 0;
    const inst = roller.incluyeInstalacion ? roller.costoInstalacion * totalCantidad : 0;
    return {
      m2,
      totalCantidad,
      isSunscreen,
      precioM2Aplicado,
      base,
      extraMotor,
      inst,
      total: base + extraMotor + inst,
      medidasCount: 1 + rollerRows.length,
    };
  }, [roller, rollerRows]);

  const bandasCalc = useMemo(() => {
    const baseM2 = bandas.ancho * bandas.alto * bandas.cantidad;
    const extraM2 = bandasRows.reduce((sum, row) => sum + row.ancho * row.alto * row.cantidad, 0);
    const m2 = baseM2 + extraM2;
    const base = m2 * bandas.precioM2;
    const riel = bandas.incluyeRiel ? bandas.costoRiel : 0;
    const inst = bandas.incluyeInstalacion ? bandas.costoInstalacion : 0;
    return { m2, base, riel, inst, total: base + riel + inst, medidasCount: 1 + bandasRows.length };
  }, [bandas, bandasRows]);

  const generoFabricName =
    genero.tipoTela === "manual" ? genero.tipoTelaManual || "Tela personalizada" : genero.tipoTela;

  const currentTotal = useMemo(() => {
    if (section === "genero") return generoCalc.total;
    if (section === "roller") return rollerCalc.total;
    return bandasCalc.total;
  }, [section, generoCalc.total, rollerCalc.total, bandasCalc.total]);

  const generoRowsSummary = useMemo(() => {
    return [
      `M1 ${genero.anchoVentana}x${genero.altoVentana}m panos ${genero.cantidadPanos} cant 1`,
      ...generoRows.map(
        (row, index) => `M${index + 2} ${row.ancho}x${row.alto}m panos ${row.panos ?? 2} cant ${row.cantidad}`,
      ),
    ].join("; ");
  }, [genero.anchoVentana, genero.altoVentana, genero.cantidadPanos, generoRows]);

  const rollerRowsSummary = useMemo(() => {
    return [
      `M1 ${roller.ancho}x${roller.alto}m cant ${roller.cantidad}`,
      ...rollerRows.map((row, index) => `M${index + 2} ${row.ancho}x${row.alto}m cant ${row.cantidad}`),
    ].join("; ");
  }, [roller.ancho, roller.alto, roller.cantidad, rollerRows]);

  const bandasRowsSummary = useMemo(() => {
    return [
      `M1 ${bandas.ancho}x${bandas.alto}m cant ${bandas.cantidad}`,
      ...bandasRows.map((row, index) => `M${index + 2} ${row.ancho}x${row.alto}m cant ${row.cantidad}`),
    ].join("; ");
  }, [bandas.ancho, bandas.alto, bandas.cantidad, bandasRows]);

  const currentDetail = useMemo(() => {
    if (section === "genero") {
      return `Ambiente ${common.ambiente || "-"} | Tipo ${generoFabricName} (${genero.categoriaTela}) | Medidas ${generoCalc.medidasCount}: ${generoRowsSummary} | Pliegue ${genero.pliegue} coef x${generoCalc.coef.toFixed(1)} | Tela estimada ${generoCalc.metrosLineales.toFixed(2)} m | Riel ${generoCalc.metrosRiel.toFixed(2)} m x ${money(genero.costoRielMetroLineal)}`;
    }
    if (section === "roller") {
      return `Ambiente ${common.ambiente || "-"} | Tipo ${roller.tipoTela} | Medidas ${rollerCalc.medidasCount}: ${rollerRowsSummary} | Total cortinas ${rollerCalc.totalCantidad} | Accionamiento ${roller.accionamiento} | Cano ${roller.sistemaCano} mm | Caida ${roller.caida} | Comando ${roller.comando} | Cadena ${roller.cadena}`;
    }
    return `Ambiente ${common.ambiente || "-"} | Tipo ${bandas.tipoTela} (${bandas.categoria}) | Medidas ${bandasCalc.medidasCount}: ${bandasRowsSummary} | Superficie ${bandasCalc.m2.toFixed(2)} m2`;
  }, [
    section,
    common.ambiente,
    generoFabricName,
    genero.categoriaTela,
    genero.pliegue,
    generoCalc.coef,
    generoCalc.medidasCount,
    generoCalc.metrosLineales,
    generoCalc.metrosRiel,
    genero.costoRielMetroLineal,
    generoRowsSummary,
    roller.tipoTela,
    roller.accionamiento,
    roller.sistemaCano,
    roller.caida,
    roller.comando,
    roller.cadena,
    rollerCalc.medidasCount,
    rollerCalc.totalCantidad,
    rollerRowsSummary,
    bandas.tipoTela,
    bandas.categoria,
    bandasCalc.medidasCount,
    bandasCalc.m2,
    bandasRowsSummary,
  ]);

  const currentBreakdown = useMemo(() => {
    if (section === "genero") {
      return [
        { label: "Tela", value: money(generoCalc.costoTela) },
        { label: "Confeccion", value: money(generoCalc.costoConfeccion) },
        {
          label: "Riel europeo",
          value: `${generoCalc.metrosRiel.toFixed(2)} m x ${money(genero.costoRielMetroLineal)} = ${money(generoCalc.costoRiel)}`,
        },
        { label: "Instalacion", value: money(generoCalc.costoInst) },
      ];
    }
    if (section === "roller") {
      return [
        { label: "Base roller", value: money(rollerCalc.base) },
        { label: "Extra motor", value: money(rollerCalc.extraMotor) },
        { label: "Instalacion", value: money(rollerCalc.inst) },
      ];
    }
    return [
      { label: "Base bandas", value: money(bandasCalc.base) },
      { label: "Riel", value: money(bandasCalc.riel) },
      { label: "Instalacion", value: money(bandasCalc.inst) },
    ];
  }, [
    section,
    generoCalc.costoTela,
    generoCalc.costoConfeccion,
    generoCalc.costoRiel,
    generoCalc.costoInst,
    generoCalc.metrosRiel,
    genero.costoRielMetroLineal,
    rollerCalc.base,
    rollerCalc.extraMotor,
    rollerCalc.inst,
    bandasCalc.base,
    bandasCalc.riel,
    bandasCalc.inst,
  ]);

  const finalItems = useMemo(() => {
    if (budgetItems.length > 0) return budgetItems;
    return [{ section, detail: currentDetail, total: currentTotal }];
  }, [budgetItems, currentDetail, currentTotal, section]);

  const finalTotal = useMemo(
    () => finalItems.reduce((sum, item) => sum + item.total, 0),
    [finalItems],
  );

  function getSectionLabel(target: QuoteSection) {
    if (target === "genero") return "Cortina de genero";
    if (target === "roller") return "Cortina roller";
    return "Bandas verticales";
  }

  function addCurrentCurtainToBudget() {
    const nextItem: BudgetItem = {
      section,
      detail: currentDetail,
      total: currentTotal,
    };
    setBudgetItems((prev) => [...prev, nextItem]);
  }

  function parseBudgetItemDetail(rawDetail: string) {
    const chunks = rawDetail
      .split("|")
      .map((chunk) => chunk.trim())
      .filter(Boolean);

    const takeValue = (prefix: string) => {
      const item = chunks.find((chunk) => chunk.toLowerCase().startsWith(prefix.toLowerCase()));
      if (!item) return "-";
      return item.slice(prefix.length).trim() || "-";
    };

    const ambiente = takeValue("Ambiente");
    const tipo = takeValue("Tipo");
    const medidas = takeValue("Medidas");

    const technical = chunks
      .filter(
        (chunk) =>
          !chunk.toLowerCase().startsWith("ambiente") &&
          !chunk.toLowerCase().startsWith("tipo") &&
          !chunk.toLowerCase().startsWith("medidas"),
      )
      .join(" | ");

    return {
      ambiente,
      tipo,
      medidas,
      technical: technical || "-",
    };
  }

  function drawPdfFooter(doc: any, pageNumber: number) {
    doc.setDrawColor(222, 226, 216);
    doc.line(14, 286, 196, 286);
    doc.setFontSize(8);
    doc.setTextColor(105, 97, 86);
    doc.text(`${BRAND.name} - ${BRAND.address}`, 14, 291);
    doc.text(`Pagina ${pageNumber}`, 181, 291);
  }

  async function downloadBudgetPdf() {
    const doc = await buildBudgetPdfDoc();
    doc.save(`${BRAND.name}-presupuesto.pdf`);
  }

  async function buildBudgetPdfDoc() {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    let pageNumber = 1;
    const today = new Date();
    const dateText = `${today.getDate().toString().padStart(2, "0")}/${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${today.getFullYear()}`;
    const quoteNumber = `CH-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(
      today.getDate(),
    ).padStart(2, "0")}-${String(today.getHours()).padStart(2, "0")}${String(today.getMinutes()).padStart(2, "0")}`;

    const left = 14;
    const right = 196;
    const width = right - left;

    const ensureSpace = (needed: number, currentY: number) => {
      if (currentY + needed <= 276) return currentY;
      drawPdfFooter(doc, pageNumber);
      doc.addPage();
      pageNumber += 1;
      return 18;
    };

    doc.setFillColor(72, 105, 78);
    doc.rect(0, 0, 210, 38, "F");
    doc.setFillColor(243, 185, 90);
    doc.rect(0, 36, 210, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text(BRAND.name, left, 15);
    doc.setFontSize(10);
    doc.text("Presupuesto comercial de cortinas a medida", left, 23);
    doc.text(BRAND.address, left, 30);
    doc.setFontSize(9);
    doc.text("COTIZACION", 162, 13);
    doc.text(`Fecha: ${dateText}`, 158, 21);
    doc.text(`Nro: ${quoteNumber}`, 142, 29);

    doc.setDrawColor(218, 224, 213);
    doc.setFillColor(250, 251, 248);
    doc.roundedRect(left, 48, width, 36, 2, 2, "FD");
    doc.setTextColor(43, 56, 44);
    doc.setFontSize(9);
    doc.text("DATOS DEL CLIENTE", left + 4, 56);
    doc.setFontSize(10);
    doc.text(`Cliente: ${common.cliente || "-"}`, left + 4, 64);
    doc.text(`Telefono: ${common.telefono || "-"}`, left + 4, 71);
    doc.text(`Domicilio: ${common.direccion || "-"}`, left + 4, 78);
    doc.text(`Cantidad de cortinas: ${finalItems.length}`, 132, 64);
    doc.text(`Ambiente principal: ${common.ambiente || "-"}`, 132, 71);
    doc.text(`Estado: presupuesto estimado`, 132, 78);

    let cursorY = 96;
    doc.setFillColor(72, 105, 78);
    doc.roundedRect(left, cursorY, width, 9, 1.5, 1.5, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text("#", left + 3, cursorY + 6);
    doc.text("Producto", left + 12, cursorY + 6);
    doc.text("Ambiente / medidas / detalle", left + 52, cursorY + 6);
    doc.text("Subtotal", 166, cursorY + 6);
    cursorY += 11;

    finalItems.forEach((item, index) => {
      const parsed = parseBudgetItemDetail(item.detail);
      const detailText = [
        `Ambiente: ${parsed.ambiente}`,
        `Medidas: ${parsed.medidas}`,
        `Detalle: ${parsed.technical}`,
      ].join("  |  ");
      const detailLines = doc.splitTextToSize(detailText, 105);
      const productLines = doc.splitTextToSize(`${getSectionLabel(item.section)}\n${parsed.tipo}`, 34);
      const rowHeight = Math.max(20, 9 + Math.max(detailLines.length, productLines.length) * 5);
      cursorY = ensureSpace(rowHeight, cursorY);

      doc.setDrawColor(218, 224, 213);
      doc.setFillColor(index % 2 === 0 ? 255 : 248, index % 2 === 0 ? 255 : 250, index % 2 === 0 ? 255 : 247);
      doc.roundedRect(left, cursorY, width, rowHeight, 1.5, 1.5, "FD");
      doc.setFontSize(9);
      doc.setTextColor(43, 56, 44);
      doc.text(String(index + 1), left + 4, cursorY + 8);
      doc.text(productLines, left + 12, cursorY + 8);
      doc.setTextColor(73, 78, 68);
      doc.text(detailLines, left + 52, cursorY + 8);
      doc.setTextColor(43, 56, 44);
      doc.text(money(item.total), 166, cursorY + 8);
      cursorY += rowHeight + 3;
    });

    cursorY = ensureSpace(80, cursorY + 2);
    const yAfterDetail = cursorY + 4;
    doc.setDrawColor(218, 224, 213);
    doc.setFillColor(250, 251, 248);
    doc.roundedRect(left, yAfterDetail, 112, 36, 2, 2, "FD");
    doc.setFontSize(11);
    doc.setTextColor(43, 56, 44);
    doc.text("Condiciones comerciales", left + 4, yAfterDetail + 8);
    doc.setFontSize(8.5);
    doc.setTextColor(73, 78, 68);
    doc.text("- Validez del presupuesto: 7 dias corridos.", left + 4, yAfterDetail + 16);
    doc.text("- Plazos sujetos a confirmacion de pedido y disponibilidad.", left + 4, yAfterDetail + 22);
    doc.text("- Instalacion y visita tecnica segun agenda coordinada.", left + 4, yAfterDetail + 28);

    doc.setFillColor(72, 105, 78);
    doc.roundedRect(132, yAfterDetail, 64, 36, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("TOTAL ESTIMADO", 138, yAfterDetail + 11);
    doc.setFontSize(18);
    doc.text(money(finalTotal), 138, yAfterDetail + 25);

    if (common.observaciones) {
      const obsY = ensureSpace(28, yAfterDetail + 44);
      doc.setDrawColor(218, 224, 213);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(left, obsY, width, 26, 2, 2, "FD");
      doc.setFontSize(10);
      doc.setTextColor(43, 56, 44);
      doc.text("Observaciones", left + 4, obsY + 8);
      doc.setFontSize(9);
      doc.setTextColor(73, 78, 68);
      doc.text(doc.splitTextToSize(common.observaciones, 170), left + 4, obsY + 15);
    }

    drawPdfFooter(doc, pageNumber);

    return doc;
  }

  async function sendBudgetToBusinessWhatsApp() {
    const businessPhone = getPublicWhatsAppDigits();
    const fileName = `${BRAND.name}-presupuesto.pdf`;
    if (!businessPhone) {
      alert(
        "Configurá NEXT_PUBLIC_WHATSAPP_PHONE con el WhatsApp del negocio (en .env local y en Vercel) para usar esta acción.",
      );
      return;
    }

    const lines = [
      `Hola ${BRAND.name},`,
      `Les comparto un presupuesto generado desde el cotizador del panel.`,
      ``,
      common.cliente && `Cliente: ${common.cliente}`,
      common.telefono && `Tel. cliente: ${common.telefono}`,
      common.direccion && `Dirección: ${common.direccion}`,
      common.ambiente && `Ambiente: ${common.ambiente}`,
      `Total estimado: ${money(finalTotal)}`,
      common.observaciones && `Observaciones: ${common.observaciones}`,
      ``,
      `Detalle:`,
      currentDetail,
    ].filter((line) => Boolean(line)) as string[];
    const message = lines.join("\n");

    const doc = await buildBudgetPdfDoc();
    doc.save(fileName);
    const url = `https://wa.me/${businessPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="grid gap-2 md:grid-cols-5">
          <button type="button" onClick={() => setSection("genero")} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${section === "genero" ? "border-emerald-500 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_8px_22px_rgba(5,150,105,0.35)]" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"}`}>
            Cortinas de genero
          </button>
          <button type="button" onClick={() => setSection("roller")} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${section === "roller" ? "border-emerald-500 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_8px_22px_rgba(5,150,105,0.35)]" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"}`}>
            Cortinas roller
          </button>
          <button type="button" onClick={() => setSection("bandas")} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${section === "bandas" ? "border-emerald-500 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_8px_22px_rgba(5,150,105,0.35)]" : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50"}`}>
            Bandas verticales
          </button>
        </div>
      </Card>

      <Card>
        <h3 className="mb-3 text-sm font-semibold text-slate-700">Datos comerciales</h3>
        <div className="grid gap-2 md:grid-cols-4">
          <div>
            <FieldLabel>Cliente</FieldLabel>
            <Input value={common.cliente} onChange={(e) => setCommon((p) => ({ ...p, cliente: e.target.value }))} placeholder="Nombre del cliente" />
          </div>
          <div>
            <FieldLabel>Telefono</FieldLabel>
            <Input value={common.telefono} onChange={(e) => setCommon((p) => ({ ...p, telefono: e.target.value }))} placeholder="Telefono" />
          </div>
          <div>
            <FieldLabel>Direccion</FieldLabel>
            <Input value={common.direccion} onChange={(e) => setCommon((p) => ({ ...p, direccion: e.target.value }))} placeholder="Direccion" />
          </div>
          <div>
            <FieldLabel>Ambiente / Sector</FieldLabel>
            <Input value={common.ambiente} onChange={(e) => setCommon((p) => ({ ...p, ambiente: e.target.value }))} placeholder="Living, dormitorio, oficina..." />
          </div>
        </div>
      </Card>

      {section === "genero" && (
        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Parametros - Cortinas de genero</h3>
            <div className="grid gap-2 md:grid-cols-3">
              <div>
                <FieldLabel>Ancho ventana (m)</FieldLabel>
                <NumberInput step="0.01" value={genero.anchoVentana} onChange={(e) => setGenero((p) => ({ ...p, anchoVentana: Number(e.target.value) }))} />
              </div>
              <div>
                <FieldLabel>Alto ventana (m)</FieldLabel>
                <NumberInput step="0.01" value={genero.altoVentana} onChange={(e) => setGenero((p) => ({ ...p, altoVentana: Number(e.target.value) }))} />
              </div>
              <div>
                <FieldLabel>Cantidad de panos</FieldLabel>
                <NumberInput value={genero.cantidadPanos} onChange={(e) => setGenero((p) => ({ ...p, cantidadPanos: Number(e.target.value) }))} />
              </div>
              <div>
                <FieldLabel>Tipo de tela</FieldLabel>
                <Select value={genero.tipoTela} onChange={(e) => setGenero((p) => ({ ...p, tipoTela: e.target.value }))}>
                  {FABRIC_OPTIONS.map((fabric) => (
                    <option key={fabric} value={fabric}>
                      {fabric === "manual" ? "Manual (escribir)" : fabric}
                    </option>
                  ))}
                </Select>
              </div>
              {genero.tipoTela === "manual" && (
                <div>
                  <FieldLabel>Tela manual</FieldLabel>
                  <Input value={genero.tipoTelaManual} onChange={(e) => setGenero((p) => ({ ...p, tipoTelaManual: e.target.value }))} placeholder="Ej: Gasa Rustica Premium" />
                </div>
              )}
              <div>
                <FieldLabel>Categoria de tela</FieldLabel>
                <Select value={genero.categoriaTela} onChange={(e) => setGenero((p) => ({ ...p, categoriaTela: e.target.value }))}>
                  <option value="liviana">Liviana</option>
                  <option value="pesada">Pesada</option>
                </Select>
              </div>
              <div>
                <FieldLabel>Tipo de pliegue</FieldLabel>
                <Select value={genero.pliegue} onChange={(e) => setGenero((p) => ({ ...p, pliegue: e.target.value }))}>
                  <option value="1_pellizco">1 pellizco (x1.5)</option>
                  <option value="2_pellizcos">2 pellizcos (x2.2)</option>
                  <option value="3_pellizcos">3 pellizcos (x2.5)</option>
                </Select>
              </div>
              <div>
                <FieldLabel>Ancho fijo tela (m)</FieldLabel>
                <NumberInput step="0.01" value={genero.anchoTelaFijo} onChange={(e) => setGenero((p) => ({ ...p, anchoTelaFijo: Number(e.target.value) }))} />
              </div>
              <div>
                <FieldLabel>Costo metro tela ($)</FieldLabel>
                <NumberInput value={genero.costoMetroTela} onChange={(e) => setGenero((p) => ({ ...p, costoMetroTela: Number(e.target.value) }))} />
              </div>
              <div>
                <FieldLabel>Costo riel por metro lineal ($)</FieldLabel>
                <NumberInput value={genero.costoRielMetroLineal} onChange={(e) => setGenero((p) => ({ ...p, costoRielMetroLineal: Number(e.target.value) }))} />
              </div>
              <div className="md:col-span-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-emerald-900">Medidas adicionales</p>
                  <button
                    type="button"
                    className="rounded-lg bg-emerald-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-800"
                    onClick={() => setGeneroRows((prev) => [...prev, { ancho: 1.5, alto: 2, cantidad: 1, panos: 2 }])}
                  >
                    + Agregar medida
                  </button>
                </div>
                <div className="space-y-2">
                  {generoRows.length === 0 ? (
                    <p className="text-xs text-emerald-800">No hay medidas extra cargadas.</p>
                  ) : (
                    generoRows.map((row, index) => (
                      <div key={`genero-row-${index}`} className="grid gap-2 rounded-lg border border-emerald-200 bg-white p-2 md:grid-cols-5">
                        <NumberInput step="0.01" value={row.ancho} onChange={(e) => updateRow(setGeneroRows, index, "ancho", Number(e.target.value))} placeholder="Ancho (m)" />
                        <NumberInput step="0.01" value={row.alto} onChange={(e) => updateRow(setGeneroRows, index, "alto", Number(e.target.value))} placeholder="Alto (m)" />
                        <NumberInput value={row.cantidad} onChange={(e) => updateRow(setGeneroRows, index, "cantidad", Number(e.target.value))} placeholder="Cantidad" />
                        <NumberInput value={row.panos ?? 2} onChange={(e) => updateRow(setGeneroRows, index, "panos", Number(e.target.value))} placeholder="Panos" />
                        <button
                          type="button"
                          className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                          onClick={() => setGeneroRows((prev) => prev.filter((_, i) => i !== index))}
                        >
                          Quitar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="md:col-span-3 flex flex-wrap gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={genero.llevaRielEuropeo} onChange={(e) => setGenero((p) => ({ ...p, llevaRielEuropeo: e.target.checked }))} />
                  Lleva riel europeo
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" checked={genero.llevaInstalacion} onChange={(e) => setGenero((p) => ({ ...p, llevaInstalacion: e.target.checked }))} />
                  Lleva instalacion
                </label>
                <div className="w-full md:w-56">
                  <FieldLabel>Costo instalacion ($)</FieldLabel>
                  <NumberInput value={genero.costoInstalacion} onChange={(e) => setGenero((p) => ({ ...p, costoInstalacion: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="md:col-span-3">
                <FieldLabel>Detalles y observaciones</FieldLabel>
                <Textarea rows={3} value={common.observaciones} onChange={(e) => setCommon((p) => ({ ...p, observaciones: e.target.value }))} placeholder="Detalles de confecciones, accesos, tiempos, etc." />
              </div>
            </div>
          </Card>

          <Card className="h-fit">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Resumen comercial - Genero</h3>
            <div className="space-y-2 text-sm text-slate-700">
              <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">Coeficiente aplicado: <strong>x{generoCalc.coef.toFixed(1)}</strong></p>
              <p>Medidas cargadas: <strong>{generoCalc.medidasCount}</strong></p>
              <p>Metros lineales estimados: <strong>{generoCalc.metrosLineales.toFixed(2)} m</strong></p>
              <p>Tela seleccionada: <strong>{generoFabricName}</strong></p>
              <p>Costo tela: <strong>{money(generoCalc.costoTela)}</strong></p>
              <p>Confeccion (tela/1.5 x $14.000): <strong>{money(generoCalc.costoConfeccion)}</strong></p>
              <p>Riel europeo: <strong>{generoCalc.metrosRiel.toFixed(2)} m x {money(genero.costoRielMetroLineal)} = {money(generoCalc.costoRiel)}</strong></p>
              <p>Instalacion: <strong>{money(generoCalc.costoInst)}</strong></p>
              <div className="mt-3 rounded-xl border border-slate-900 bg-slate-900 px-3 py-3 text-white">
                <p className="text-xs uppercase tracking-wide text-slate-300">Total estimado</p>
                <p className="text-2xl font-semibold">{money(generoCalc.total)}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {section === "roller" && (
        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Parametros - Cortinas roller</h3>
            <div className="grid gap-2 md:grid-cols-3">
              <div><FieldLabel>Ancho (m)</FieldLabel><NumberInput step="0.01" value={roller.ancho} onChange={(e) => setRoller((p) => ({ ...p, ancho: Number(e.target.value) }))} /></div>
              <div><FieldLabel>Alto (m)</FieldLabel><NumberInput step="0.01" value={roller.alto} onChange={(e) => setRoller((p) => ({ ...p, alto: Number(e.target.value) }))} /></div>
              <div><FieldLabel>Cantidad</FieldLabel><NumberInput value={roller.cantidad} onChange={(e) => setRoller((p) => ({ ...p, cantidad: Number(e.target.value) }))} /></div>
              <div><FieldLabel>Tipo de tela</FieldLabel><Select value={roller.tipoTela} onChange={(e) => setRoller((p) => ({ ...p, tipoTela: e.target.value }))}>{ROLLER_FABRIC_OPTIONS.map((f) => <option key={f} value={f}>{f}</option>)}</Select></div>
              <div><FieldLabel>Accionamiento</FieldLabel><Select value={roller.accionamiento} onChange={(e) => setRoller((p) => ({ ...p, accionamiento: e.target.value }))}><option value="cadena">Cadena</option><option value="motor">Motor</option></Select></div>
              <div><FieldLabel>Sistema de caño (mm)</FieldLabel><Select value={roller.sistemaCano} onChange={(e) => setRoller((p) => ({ ...p, sistemaCano: e.target.value }))}><option value="32">32</option><option value="38">38</option><option value="45">45</option></Select></div>
              <div><FieldLabel>Caida</FieldLabel><Select value={roller.caida} onChange={(e) => setRoller((p) => ({ ...p, caida: e.target.value }))}><option value="atras">Atras</option><option value="invertida">Invertida</option></Select></div>
              <div><FieldLabel>Comando</FieldLabel><Select value={roller.comando} onChange={(e) => setRoller((p) => ({ ...p, comando: e.target.value }))}><option value="derecho">Derecho</option><option value="izquierdo">Izquierdo</option></Select></div>
              <div><FieldLabel>Cadena</FieldLabel><Select value={roller.cadena} onChange={(e) => setRoller((p) => ({ ...p, cadena: e.target.value }))}><option value="plastico">Plastica</option><option value="metalica">Metalica</option></Select></div>
              <div><FieldLabel>Extra motor por unidad ($)</FieldLabel><NumberInput value={roller.extraMotorUnidad} onChange={(e) => setRoller((p) => ({ ...p, extraMotorUnidad: Number(e.target.value) }))} /></div>
              <div><FieldLabel>Costo instalacion ($)</FieldLabel><NumberInput value={roller.costoInstalacion} onChange={(e) => setRoller((p) => ({ ...p, costoInstalacion: Number(e.target.value) }))} /></div>
              <div className="flex items-end"><label className="inline-flex items-center gap-2"><input type="checkbox" checked={roller.incluyeInstalacion} onChange={(e) => setRoller((p) => ({ ...p, incluyeInstalacion: e.target.checked }))} />Incluye instalacion</label></div>
              <div className="md:col-span-3 rounded-xl border border-cyan-200 bg-cyan-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-cyan-900">Medidas adicionales</p>
                  <button
                    type="button"
                    className="rounded-lg bg-cyan-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-cyan-800"
                    onClick={() => setRollerRows((prev) => [...prev, { ancho: 1.2, alto: 1.5, cantidad: 1 }])}
                  >
                    + Agregar medida
                  </button>
                </div>
                <div className="space-y-2">
                  {rollerRows.length === 0 ? (
                    <p className="text-xs text-cyan-800">No hay medidas extra cargadas.</p>
                  ) : (
                    rollerRows.map((row, index) => (
                      <div key={`roller-row-${index}`} className="grid gap-2 rounded-lg border border-cyan-200 bg-white p-2 md:grid-cols-4">
                        <NumberInput step="0.01" value={row.ancho} onChange={(e) => updateRow(setRollerRows, index, "ancho", Number(e.target.value))} placeholder="Ancho (m)" />
                        <NumberInput step="0.01" value={row.alto} onChange={(e) => updateRow(setRollerRows, index, "alto", Number(e.target.value))} placeholder="Alto (m)" />
                        <NumberInput value={row.cantidad} onChange={(e) => updateRow(setRollerRows, index, "cantidad", Number(e.target.value))} placeholder="Cantidad" />
                        <button
                          type="button"
                          className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                          onClick={() => setRollerRows((prev) => prev.filter((_, i) => i !== index))}
                        >
                          Quitar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Card>
          <Card className="h-fit">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Resumen comercial - Roller</h3>
            <div className="space-y-2 text-sm text-slate-700">
              <p>Tela: <strong>{roller.tipoTela}</strong></p>
              <p>Caño: <strong>{roller.sistemaCano} mm</strong> | Caida: <strong>{roller.caida}</strong></p>
              <p>Comando: <strong>{roller.comando}</strong> | Cadena: <strong>{roller.cadena}</strong></p>
              <p>Medidas cargadas: <strong>{rollerCalc.medidasCount}</strong> | Cortinas totales: <strong>{rollerCalc.totalCantidad}</strong></p>
              <p>Subtotal producto: <strong>{money(rollerCalc.base)}</strong>{rollerCalc.isSunscreen ? " (incluye ajuste por Sunscreen)" : ""}</p>
              <p>Extra motor: <strong>{money(rollerCalc.extraMotor)}</strong></p>
              <p>Instalacion: <strong>{money(roller.costoInstalacion)} x {rollerCalc.totalCantidad} = {money(rollerCalc.inst)}</strong></p>
              <div className="mt-3 rounded-xl border border-slate-900 bg-slate-900 px-3 py-3 text-white">
                <p className="text-xs uppercase tracking-wide text-slate-300">Total estimado</p>
                <p className="text-2xl font-semibold">{money(rollerCalc.total)}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {section === "bandas" && (
        <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
          <Card>
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Parametros - Bandas verticales</h3>
            <div className="grid gap-2 md:grid-cols-3">
              <div><FieldLabel>Ancho (m)</FieldLabel><NumberInput step="0.01" value={bandas.ancho} onChange={(e) => setBandas((p) => ({ ...p, ancho: Number(e.target.value) }))} /></div>
              <div><FieldLabel>Alto (m)</FieldLabel><NumberInput step="0.01" value={bandas.alto} onChange={(e) => setBandas((p) => ({ ...p, alto: Number(e.target.value) }))} /></div>
              <div><FieldLabel>Cantidad</FieldLabel><NumberInput value={bandas.cantidad} onChange={(e) => setBandas((p) => ({ ...p, cantidad: Number(e.target.value) }))} /></div>
              <div><FieldLabel>Tipo de tela</FieldLabel><Input value={bandas.tipoTela} onChange={(e) => setBandas((p) => ({ ...p, tipoTela: e.target.value }))} /></div>
              <div><FieldLabel>Categoria</FieldLabel><Select value={bandas.categoria} onChange={(e) => setBandas((p) => ({ ...p, categoria: e.target.value }))}><option value="standard">Standard</option><option value="premium">Premium</option></Select></div>
              <div><FieldLabel>Precio m2 ($)</FieldLabel><NumberInput value={bandas.precioM2} onChange={(e) => setBandas((p) => ({ ...p, precioM2: Number(e.target.value) }))} /></div>
              <div><FieldLabel>Costo riel ($)</FieldLabel><NumberInput value={bandas.costoRiel} onChange={(e) => setBandas((p) => ({ ...p, costoRiel: Number(e.target.value) }))} /></div>
              <div><FieldLabel>Costo instalacion ($)</FieldLabel><NumberInput value={bandas.costoInstalacion} onChange={(e) => setBandas((p) => ({ ...p, costoInstalacion: Number(e.target.value) }))} /></div>
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm md:col-span-3 md:flex md:items-center md:gap-6 md:space-y-0">
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={bandas.incluyeRiel} onChange={(e) => setBandas((p) => ({ ...p, incluyeRiel: e.target.checked }))} />Incluye riel</label>
                <label className="inline-flex items-center gap-2"><input type="checkbox" checked={bandas.incluyeInstalacion} onChange={(e) => setBandas((p) => ({ ...p, incluyeInstalacion: e.target.checked }))} />Incluye instalacion</label>
              </div>
              <div className="md:col-span-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-indigo-900">Medidas adicionales</p>
                  <button
                    type="button"
                    className="rounded-lg bg-indigo-700 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-800"
                    onClick={() => setBandasRows((prev) => [...prev, { ancho: 1.5, alto: 2, cantidad: 1 }])}
                  >
                    + Agregar medida
                  </button>
                </div>
                <div className="space-y-2">
                  {bandasRows.length === 0 ? (
                    <p className="text-xs text-indigo-800">No hay medidas extra cargadas.</p>
                  ) : (
                    bandasRows.map((row, index) => (
                      <div key={`bandas-row-${index}`} className="grid gap-2 rounded-lg border border-indigo-200 bg-white p-2 md:grid-cols-4">
                        <NumberInput step="0.01" value={row.ancho} onChange={(e) => updateRow(setBandasRows, index, "ancho", Number(e.target.value))} placeholder="Ancho (m)" />
                        <NumberInput step="0.01" value={row.alto} onChange={(e) => updateRow(setBandasRows, index, "alto", Number(e.target.value))} placeholder="Alto (m)" />
                        <NumberInput value={row.cantidad} onChange={(e) => updateRow(setBandasRows, index, "cantidad", Number(e.target.value))} placeholder="Cantidad" />
                        <button
                          type="button"
                          className="rounded-lg bg-rose-600 px-2 py-1 text-xs font-semibold text-white hover:bg-rose-700"
                          onClick={() => setBandasRows((prev) => prev.filter((_, i) => i !== index))}
                        >
                          Quitar
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </Card>
          <Card className="h-fit">
            <h3 className="mb-3 text-sm font-semibold text-slate-700">Resumen comercial - Bandas</h3>
            <div className="space-y-2 text-sm text-slate-700">
              <p>Medidas cargadas: <strong>{bandasCalc.medidasCount}</strong></p>
              <p>Superficie: <strong>{bandasCalc.m2.toFixed(2)} m2</strong></p>
              <p>Base: <strong>{money(bandasCalc.base)}</strong></p>
              <p>Riel: <strong>{money(bandasCalc.riel)}</strong></p>
              <p>Instalacion: <strong>{money(bandasCalc.inst)}</strong></p>
              <div className="mt-3 rounded-xl border border-slate-900 bg-slate-900 px-3 py-3 text-white">
                <p className="text-xs uppercase tracking-wide text-slate-300">Total estimado</p>
                <p className="text-2xl font-semibold">{money(bandasCalc.total)}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Presupuesto del domicilio</h3>
        <p className="mb-3 text-xs text-slate-500">
          Carga una cortina, presiona &quot;Agregar cortina al presupuesto&quot; y repeti con todos los ambientes.
        </p>
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={addCurrentCurtainToBudget}
              className="btn-vivid px-4 py-2.5 text-sm font-semibold"
            >
              Agregar cortina al presupuesto
            </button>
            {budgetItems.length > 0 && (
              <button
                type="button"
                onClick={() => setBudgetItems([])}
                className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Limpiar lista
              </button>
            )}
          </div>
          {budgetItems.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Cortinas agregadas ({budgetItems.length})
              </div>
              <div className="space-y-2">
                {budgetItems.map((item, index) => (
                  <div key={`${item.section}-${index}`} className="rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-700">
                    <div className="flex items-center justify-between gap-2">
                      <strong>{index + 1}. {getSectionLabel(item.section)}</strong>
                      <button
                        type="button"
                        onClick={() => setBudgetItems((prev) => prev.filter((_, i) => i !== index))}
                        className="rounded bg-rose-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-rose-700"
                      >
                        Quitar
                      </button>
                    </div>
                    <p className="mt-1 text-[11px]">{item.detail}</p>
                    <p className="mt-1 font-semibold">Subtotal: {money(item.total)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card>
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Generar presupuesto</h3>
        <p className="mb-3 text-xs text-slate-500">
          Guarda este calculo como cotizacion real en el sistema para continuar con pagos e instalaciones.
        </p>
        <form action={createBudgetAction} className="flex flex-wrap items-center gap-3">
          <input type="hidden" name="section" value={section} />
          <input type="hidden" name="cliente" value={common.cliente} />
          <input type="hidden" name="telefono" value={common.telefono} />
          <input type="hidden" name="direccion" value={common.direccion} />
          <input type="hidden" name="ambiente" value={common.ambiente} />
          <input type="hidden" name="observaciones" value={common.observaciones} />
          <input type="hidden" name="total" value={String(finalTotal)} />
          <input type="hidden" name="detalle" value={currentDetail} />
          <input
            type="hidden"
            name="items_json"
            value={JSON.stringify(finalItems.map((item) => ({ section: item.section, detalle: item.detail, total: item.total })))}
          />
          <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Total del presupuesto: <strong>{money(finalTotal)}</strong>
          </div>
          <div className="min-w-[220px]">
            <FieldLabel>Guardar como</FieldLabel>
            <Select name="estado" defaultValue="enviada">
              <option value="enviada">Pendiente de seguimiento</option>
              <option value="aprobada">Cerrado / aprobado</option>
            </Select>
          </div>
          <SubmitButton>Guardar presupuesto en Cotizaciones</SubmitButton>
          <button
            type="button"
            onClick={downloadBudgetPdf}
            className="btn-warm px-4 py-2.5 text-sm font-semibold"
          >
            Descargar PDF
          </button>
          <button
            type="button"
            onClick={sendBudgetToBusinessWhatsApp}
            className="btn-vivid px-4 py-2.5 text-sm font-semibold"
          >
            Enviar presupuesto por WhatsApp
          </button>
        </form>
      </Card>
    </div>
  );
}
