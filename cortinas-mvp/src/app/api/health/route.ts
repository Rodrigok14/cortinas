import { NextResponse } from "next/server";
import { getEnvOrNull } from "@/lib/env";

function mask(value: string | undefined) {
  if (!value) return null;
  if (value.length <= 10) return "***";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export function GET() {
  const env = getEnvOrNull();

  return NextResponse.json({
    ok: Boolean(env),
    supabaseUrl: env?.url ?? null,
    anonKey: mask(env?.anonKey),
    serviceRoleConfigured: Boolean(
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || process.env.SUPABASE_SECRET_KEY?.trim(),
    ),
  });
}
