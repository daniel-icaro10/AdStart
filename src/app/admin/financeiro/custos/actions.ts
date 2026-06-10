"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTaxaAtual } from "@/lib/financeiro";
import { custoOperacionalSchema } from "@/lib/financeiro-validation";
import type { FinanceiroResult } from "@/app/admin/financeiro/actions";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Não autorizado.");
}

function revalidate() {
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/financeiro/custos");
}

/** Lança um custo operacional. Congela a taxa do dia se em USD e não informada. */
export async function criarCusto(input: unknown): Promise<FinanceiroResult> {
  await requireAdmin();
  const parsed = custoOperacionalSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;
  const taxaFinal =
    d.taxaCambioNaDia ?? (d.moeda === "USD" ? await getTaxaAtual() : null);

  await prisma.custoOperacional.create({
    data: {
      descricao: d.descricao,
      categoria: d.categoria,
      valor: d.valor,
      moeda: d.moeda,
      data: d.data,
      recorrente: d.recorrente,
      taxaCambioNaDia: taxaFinal,
    },
  });
  revalidate();
  return { ok: true };
}

/** Exclui um custo operacional. */
export async function deletarCusto(id: string): Promise<FinanceiroResult> {
  await requireAdmin();
  await prisma.custoOperacional.delete({ where: { id } });
  revalidate();
  return { ok: true };
}
