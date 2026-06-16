"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  venderSchema,
  perderSchema,
  ativoFinanceiroSchema,
  reverterStatusSchema,
} from "@/lib/financeiro-validation";

export type FinanceiroResult = { ok: true } | { ok: false; error: string };

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Não autorizado.");
}

// ─── Detalhe do ativo (identificação) ──────────────────────────────────────────

export type AtivoDetalheConta = {
  nome: string;
  status: string;
  gastos: number | null;
};

export type AtivoDetalhe =
  | {
      origem: "asset";
      codigo: string;
      titulo: string;
      categoria: string;
      tipo: string | null;
      icone: string | null;
      tier: number | null;
      anoCriacao: number | null;
      moeda: string;
      valor: number;
      conteudo: string | null;
      verificada: boolean;
      semDividas: boolean;
      semBloqueios: boolean;
      qtdContas: number | null;
      totalGastosBRL: number | null;
      totalGastosUSD: number | null;
      destaque: boolean;
      statusVenda: string;
      fornecedor: string | null;
      observacoes: string | null;
      contas: AtivoDetalheConta[];
      imagens: string[];
    }
  | {
      origem: "page";
      titulo: string;
      nicho: string | null;
      kind: string;
      seguidores: number;
      anoCriacao: number | null;
      valor: number;
      status: string;
      destaque: boolean;
      conteudo: string | null;
      tipo: string | null;
      fornecedor: string | null;
      observacoes: string | null;
    };

/**
 * Detalhe completo de um ativo para identificação no financeiro (read-only):
 * código, categoria, conteúdo, contas e imagens. Admin-only.
 */
export async function getAtivoDetalhe(
  origem: "asset" | "page",
  id: string,
): Promise<AtivoDetalhe | null> {
  await requireAdmin();

  if (origem === "asset") {
    const a = await prisma.asset.findUnique({
      where: { id },
      include: {
        contas: { orderBy: { nome: "asc" } },
        imagens: { orderBy: { ordem: "asc" } },
      },
    });
    if (!a) return null;
    return {
      origem: "asset",
      codigo: a.codigo,
      titulo: a.titulo,
      categoria: a.categoria,
      tipo: a.tipo,
      icone: a.icone,
      tier: a.tier,
      anoCriacao: a.anoCriacao,
      moeda: a.moeda,
      valor: a.valor,
      conteudo: a.conteudo,
      verificada: a.verificada,
      semDividas: a.semDividas,
      semBloqueios: a.semBloqueios,
      qtdContas: a.qtdContas,
      totalGastosBRL: a.totalGastosBRL,
      totalGastosUSD: a.totalGastosUSD,
      destaque: a.destaque,
      statusVenda: a.statusVenda,
      fornecedor: a.fornecedor,
      observacoes: a.observacoes,
      contas: a.contas.map((c) => ({
        nome: c.nome,
        status: c.status,
        gastos: c.gastos,
      })),
      imagens: a.imagens.map((im) => im.data),
    };
  }

  const p = await prisma.page.findUnique({ where: { id } });
  if (!p) return null;
  return {
    origem: "page",
    titulo: p.nome,
    nicho: p.nicho,
    kind: p.kind,
    seguidores: p.seguidores,
    anoCriacao: p.anoCriacao,
    valor: p.valor,
    status: p.status,
    destaque: p.destaque,
    conteudo: p.conteudo,
    tipo: p.tipo,
    fornecedor: p.fornecedor,
    observacoes: p.observacoes,
  };
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

/** Lê o status atual do ativo (Asset ou Page). */
async function getEstadoAtivo(origem: "asset" | "page", id: string) {
  if (origem === "asset") {
    const r = await prisma.asset.findUnique({
      where: { id },
      select: { statusVenda: true },
    });
    return r ? { status: r.statusVenda } : null;
  }
  const r = await prisma.page.findUnique({
    where: { id },
    select: { status: true },
  });
  return r ? { status: r.status } : null;
}

/**
 * Atualização ATÔMICA com guarda de status: só altera se o status atual estiver
 * em `statusPermitidos` (via updateMany + WHERE). Retorna a contagem afetada —
 * 0 significa status inválido (ou ativo inexistente), sem race condition.
 */
async function updateAtivoGuarded(
  origem: "asset" | "page",
  id: string,
  statusPermitidos: string[],
  data: Record<string, unknown>,
  novoStatus: string,
): Promise<number> {
  if (origem === "asset") {
    const r = await prisma.asset.updateMany({
      where: { id, statusVenda: { in: statusPermitidos } },
      data: { ...data, statusVenda: novoStatus },
    });
    return r.count;
  }
  const r = await prisma.page.updateMany({
    where: { id, status: { in: statusPermitidos } },
    data: { ...data, status: novoStatus },
  });
  return r.count;
}

const EM_ESTOQUE = ["DISPONIVEL", "RESERVADO"];

/**
 * Marca o ativo como VENDIDO. precoVenda é obrigatório (validado no schema).
 * dataSaida default = agora. Tudo em R$ (sem USD).
 */
export async function venderAtivo(input: unknown): Promise<FinanceiroResult> {
  await requireAdmin();
  const parsed = venderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { origem, id, precoVenda, comprador, dataSaida, observacoes } =
    parsed.data;

  const estado = await getEstadoAtivo(origem, id);
  if (!estado) return { ok: false, error: "Ativo não encontrado." };

  // Guarda atômica: só vende se ainda estiver em estoque (não sobrescreve venda/perda).
  const count = await updateAtivoGuarded(
    origem,
    id,
    EM_ESTOQUE,
    {
      precoVenda,
      moedaVenda: "BRL",
      taxaVendaNaDia: null,
      comprador: comprador || null,
      dataSaida: dataSaida ?? new Date(),
      ...(observacoes ? { observacoes } : {}),
    },
    "VENDIDO",
  );
  if (count === 0) {
    return {
      ok: false,
      error: `Só é possível vender ativos em estoque (status atual: ${estado.status}).`,
    };
  }
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

  const estado = await getEstadoAtivo(origem, id);
  if (!estado) return { ok: false, error: "Ativo não encontrado." };

  // Guarda atômica: só marca perdido se ainda estiver em estoque.
  const count = await updateAtivoGuarded(
    origem,
    id,
    EM_ESTOQUE,
    {
      motivoPerda,
      dataSaida: dataSaida ?? new Date(),
    },
    "PERDIDO",
  );
  if (count === 0) {
    return {
      ok: false,
      error: `Só é possível marcar como perdido ativos em estoque (status atual: ${estado.status}).`,
    };
  }
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
    {
      precoVenda: null,
      moedaVenda: null,
      taxaVendaNaDia: null,
      comprador: null,
      dataSaida: null,
      motivoPerda: null,
      taxaCambioNaDia: null,
    },
    novoStatus,
  );
  revalidate();
  return { ok: true };
}

/**
 * Entrada/edição dos dados financeiros de um ativo (custo, fornecedor,
 * previsão de venda, data de entrada, tipo). Tudo em R$. Não altera o status.
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
    dataEntrada,
    precoPrevisto,
    observacoes,
  } = parsed.data;

  await updateAtivo(origem, id, {
    tipo: tipo ?? null,
    fornecedor: fornecedor || null,
    custoAquisicao,
    moedaCusto: "BRL",
    dataEntrada: dataEntrada ?? undefined,
    precoPrevisto,
    taxaCambioNaDia: null,
    observacoes: observacoes || null,
  });
  revalidate();
  return { ok: true };
}
