"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTaxaAtual, upsertTaxaCambio } from "@/lib/financeiro";
import {
  venderSchema,
  perderSchema,
  ativoFinanceiroSchema,
  reverterStatusSchema,
  taxaCambioSchema,
} from "@/lib/financeiro-validation";

export type FinanceiroResult = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Não autorizado.");
}

function revalidate() {
  // Financeiro + vitrine pública + admin de ativos (status afeta todos).
  revalidatePath("/admin/financeiro");
  revalidatePath("/admin/financeiro/ativos");
  revalidatePath("/");
  revalidatePath("/admin/ativos");
  revalidatePath("/admin/paginas");
}

/** Atualiza um ativo (Asset ou Page) pelo par origem/id. Mapeia o campo de status. */
async function updateAtivo(
  origem: "asset" | "page",
  id: string,
  data: Record<string, unknown>,
  novoStatus?: string,
) {
  if (origem === "asset") {
    await prisma.asset.update({
      where: { id },
      data: { ...data, ...(novoStatus ? { statusVenda: novoStatus } : {}) },
    });
  } else {
    await prisma.page.update({
      where: { id },
      data: { ...data, ...(novoStatus ? { status: novoStatus } : {}) },
    });
  }
}

/** Lê moedaCusto + taxaCambioNaDia atuais do ativo (para snapshot de câmbio). */
async function getMoedaInfo(origem: "asset" | "page", id: string) {
  const row =
    origem === "asset"
      ? await prisma.asset.findUnique({
          where: { id },
          select: { moedaCusto: true, taxaCambioNaDia: true },
        })
      : await prisma.page.findUnique({
          where: { id },
          select: { moedaCusto: true, taxaCambioNaDia: true },
        });
  return row;
}

/**
 * Marca o ativo como VENDIDO. precoVenda é obrigatório (validado no schema).
 * dataSaida default = agora. Congela a taxa de câmbio se o custo é em USD e
 * ainda não havia taxa registrada (histórico fiel).
 */
export async function venderAtivo(input: unknown): Promise<FinanceiroResult> {
  await requireAdmin();
  const parsed = venderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { origem, id, precoVenda, comprador, dataSaida, observacoes } =
    parsed.data;

  const info = await getMoedaInfo(origem, id);
  const taxaSnapshot =
    info?.moedaCusto === "USD" && info.taxaCambioNaDia == null
      ? await getTaxaAtual()
      : undefined;

  await updateAtivo(
    origem,
    id,
    {
      precoVenda,
      comprador: comprador || null,
      dataSaida: dataSaida ?? new Date(),
      ...(observacoes ? { observacoes } : {}),
      ...(taxaSnapshot != null ? { taxaCambioNaDia: taxaSnapshot } : {}),
    },
    "VENDIDO",
  );
  revalidate();
  return { ok: true };
}

/** Marca o ativo como PERDIDO. motivoPerda obrigatório. */
export async function marcarPerdido(input: unknown): Promise<FinanceiroResult> {
  await requireAdmin();
  const parsed = perderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { origem, id, motivoPerda, dataSaida } = parsed.data;

  const info = await getMoedaInfo(origem, id);
  const taxaSnapshot =
    info?.moedaCusto === "USD" && info.taxaCambioNaDia == null
      ? await getTaxaAtual()
      : undefined;

  await updateAtivo(
    origem,
    id,
    {
      motivoPerda,
      dataSaida: dataSaida ?? new Date(),
      ...(taxaSnapshot != null ? { taxaCambioNaDia: taxaSnapshot } : {}),
    },
    "PERDIDO",
  );
  revalidate();
  return { ok: true };
}

/**
 * Reverte um ativo de VENDIDO/PERDIDO de volta para o estoque.
 * Exige confirmação explícita (schema) e limpa os campos de saída.
 */
export async function reverterStatus(input: unknown): Promise<FinanceiroResult> {
  await requireAdmin();
  const parsed = reverterStatusSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { origem, id, novoStatus } = parsed.data;
  await updateAtivo(
    origem,
    id,
    { precoVenda: null, comprador: null, dataSaida: null, motivoPerda: null },
    novoStatus,
  );
  revalidate();
  return { ok: true };
}

/** Atualiza a taxa de câmbio USD→BRL usada na consolidação dos relatórios. */
export async function salvarTaxaCambio(input: unknown): Promise<FinanceiroResult> {
  await requireAdmin();
  const parsed = taxaCambioSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Taxa inválida." };
  }
  await upsertTaxaCambio(parsed.data.taxa);
  revalidate();
  return { ok: true };
}

/**
 * Entrada/edição dos dados financeiros de um ativo (custo, fornecedor,
 * previsão de venda, data de entrada, tipo). Não altera o status de venda.
 */
export async function salvarFinanceiroAtivo(
  input: unknown,
): Promise<FinanceiroResult> {
  await requireAdmin();
  const parsed = ativoFinanceiroSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const {
    origem,
    id,
    tipo,
    fornecedor,
    custoAquisicao,
    moedaCusto,
    dataEntrada,
    precoPrevisto,
    taxaCambioNaDia,
    observacoes,
  } = parsed.data;

  // Congela a taxa do dia se custo em USD e não informada explicitamente.
  const taxaFinal =
    taxaCambioNaDia ??
    (moedaCusto === "USD" ? await getTaxaAtual() : null);

  await updateAtivo(origem, id, {
    tipo: tipo ?? null,
    fornecedor: fornecedor || null,
    custoAquisicao,
    moedaCusto: moedaCusto ?? null,
    dataEntrada: dataEntrada ?? undefined,
    precoPrevisto,
    taxaCambioNaDia: taxaFinal,
    observacoes: observacoes || null,
  });
  revalidate();
  return { ok: true };
}
