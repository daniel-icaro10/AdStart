import { NextResponse } from "next/server";

import { enviarAvisosCobranca } from "@/lib/cobrancas";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Cron diário (Vercel) — dispara avisos de cobrança por WhatsApp.
 * Protegido pelo header `Authorization: Bearer ${CRON_SECRET}` que a Vercel
 * envia automaticamente quando CRON_SECRET está definido nas envs.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "Não autorizado." }, { status: 401 });
  }

  try {
    const resultado = await enviarAvisosCobranca();
    return NextResponse.json({ ok: true, ...resultado });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 },
    );
  }
}
