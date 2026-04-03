import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import type { ActionState } from "@/lib/validations";

export function ok(message: string): ActionState {
  return { ok: true, message };
}

export function fail(error: unknown, fallback = "No se pudo completar la accion"): ActionState {
  if (error instanceof ZodError) {
    return { ok: false, message: error.issues[0]?.message ?? fallback };
  }

  if (error instanceof Error) {
    return { ok: false, message: error.message || fallback };
  }

  return { ok: false, message: fallback };
}

export function toText(value: FormDataEntryValue | null): string | null {
  const parsed = value?.toString().trim() ?? "";
  return parsed.length > 0 ? parsed : null;
}

export function toDateText(value: FormDataEntryValue | null): string | null {
  const parsed = value?.toString().trim() ?? "";
  return parsed ? parsed : null;
}

export function revalidate(paths: string[]) {
  for (const path of paths) {
    revalidatePath(path);
  }
}
