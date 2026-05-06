import { z } from "zod";

const requiredString = (name: string) =>
  z.string().trim().min(1, `${name} es obligatorio`);

const optionalString = z.string().trim().nullable().optional();

export const loginSchema = z.object({
  email: z.string().email("Email invalido"),
  password: z.string().min(6, "La contrasena debe tener al menos 6 caracteres"),
});

export const clientSchema = z.object({
  id: z.string().uuid().optional(),
  nombre_completo: requiredString("Nombre completo"),
  telefono: requiredString("Telefono"),
  email: z.string().email("Email invalido").nullable().optional(),
  direccion: optionalString,
  ciudad: optionalString,
  observaciones: optionalString,
});

export const projectSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: z.string().uuid("Cliente invalido"),
  nombre_obra: requiredString("Nombre de obra"),
  direccion_instalacion: optionalString,
  estado: z.enum([
    "relevamiento",
    "cotizada",
    "aprobada",
    "en_produccion",
    "lista_para_instalar",
    "instalada",
    "cerrada",
  ]),
  fecha_visita: z.string().nullable().optional(),
  fecha_entrega_estimada: z.string().nullable().optional(),
  observaciones: optionalString,
});

export const roomSchema = z.object({
  id: z.string().uuid().optional(),
  project_id: z.string().uuid("Obra invalida"),
  nombre_ambiente: requiredString("Nombre de ambiente"),
  observaciones: optionalString,
});

export const measurementSchema = z.object({
  id: z.string().uuid().optional(),
  room_id: z.string().uuid("Ambiente invalido"),
  tipo_producto: z.enum(["tradicional", "roller"]),
  tipo_montaje: z.enum(["interior", "exterior"]),
  ancho: z.coerce.number().positive("Ancho debe ser mayor a 0"),
  alto: z.coerce.number().positive("Alto debe ser mayor a 0"),
  cantidad: z.coerce.number().int().positive("Cantidad debe ser mayor a 0"),
  lado_mando: z.enum(["izquierdo", "derecho", "sin_mando"]),
  tela: optionalString,
  color: optionalString,
  observaciones: optionalString,
});

export const quotationSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: z.string().uuid("Cliente invalido"),
  project_id: z.string().uuid().nullable().optional(),
  numero: requiredString("Numero obligatorio"),
  fecha: requiredString("Fecha obligatoria"),
  estado: z.enum(["borrador", "enviada", "aprobada", "rechazada", "vencida"]),
  descuento: z.coerce.number().min(0),
  costo_instalacion: z.coerce.number().min(0),
  anticipo_requerido: z.coerce.number().min(0),
  observaciones: optionalString,
});

export const quotationItemSchema = z.object({
  id: z.string().uuid().optional(),
  quotation_id: z.string().uuid("Cotizacion invalida"),
  measurement_id: z.string().uuid().nullable().optional(),
  descripcion: requiredString("Descripcion obligatoria"),
  cantidad: z.coerce.number().positive(),
  precio_unitario: z.coerce.number().min(0),
});

export const installationSchema = z.object({
  id: z.string().uuid().optional(),
  project_id: z.string().uuid("Obra invalida"),
  fecha_programada: requiredString("Fecha programada obligatoria"),
  tecnico: requiredString("Tecnico obligatorio"),
  estado: z.enum(["pendiente", "reprogramada", "realizada", "observada"]),
  observaciones: optionalString,
});

export const paymentSchema = z.object({
  id: z.string().uuid().optional(),
  quotation_id: z.string().uuid("Cotizacion invalida"),
  fecha_pago: requiredString("Fecha de pago obligatoria"),
  monto: z.coerce.number().positive("Monto invalido"),
  medio_pago: requiredString("Medio de pago obligatorio"),
  estado: requiredString("Estado obligatorio"),
  observaciones: optionalString,
});

export const orderSchema = z.object({
  id: z.string().uuid().optional(),
  client_id: z.string().uuid("Cliente invalido"),
  numero: requiredString("Numero de pedido obligatorio"),
  fecha_pedido: requiredString("Fecha pedido obligatoria"),
  estado: z.enum(["realizado", "pendiente", "en_produccion", "entregado", "cancelado"]),
  fecha_entrega_estimada: z.string().nullable().optional(),
  total_venta: z.coerce.number().min(0),
  costo_total: z.coerce.number().min(0),
  observaciones: optionalString,
});

export const costSchema = z.object({
  id: z.string().uuid().optional(),
  categoria: requiredString("Categoria obligatoria"),
  producto: requiredString("Producto obligatorio"),
  costo_unitario: z.coerce.number().min(0),
  unidad: requiredString("Unidad obligatoria"),
  observaciones: optionalString,
});

export const expenseSchema = z.object({
  id: z.string().uuid().optional(),
  fecha: requiredString("Fecha obligatoria"),
  categoria: requiredString("Categoria obligatoria"),
  descripcion: requiredString("Descripcion obligatoria"),
  monto: z.coerce.number().positive("Monto invalido"),
});

export type ActionState = {
  ok: boolean;
  message: string;
};

export const defaultActionState: ActionState = {
  ok: true,
  message: "",
};
