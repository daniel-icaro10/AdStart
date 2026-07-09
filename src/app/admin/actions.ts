"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  assetSchema,
  pageSchema,
  rentalPlanSchema,
  clientSchema,
  clientEntrySchema,
} from "@/lib/validation";
import { CATEGORIA_ORDER } from "@/lib/constants";
import {
  enviarAvisosCobranca,
  enviarAvisoParaCliente,
} from "@/lib/cobrancas";
import { CATEGORY_ORDER_KEY } from "@/lib/settings";

export type ActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

/** Garante que há um admin autenticado antes de qualquer mutação. */
async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Não autorizado.");
}

function revalidateAssets() {
  revalidatePath("/");
  revalidatePath("/admin/ativos");
}

function revalidatePages() {
  revalidatePath("/");
  revalidatePath("/admin/ativos");
}

// ---------------------------------------------------------------------------
// Ativos (BMs)
// ---------------------------------------------------------------------------

/** Deriva a moeda a partir do ícone escolhido (US/EU → moeda estrangeira). */
function moedaFromIcone(icone: string): string {
  if (icone === "US") return "USD";
  if (icone === "EU") return "EUR";
  return "BRL";
}

export async function createAsset(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = assetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;
  const asset = await prisma.asset.create({
    data: {
      titulo: data.titulo,
      codigo: data.titulo, // código = título (campo único de identificação)
      icone: data.icone || null,
      conteudo: data.conteudo || null,
      categoria: data.categoria,
      statusVenda: data.statusVenda,
      destaque: data.destaque,
      tier: data.tier ?? null,
      valor: data.valor,
      precoAntigo: data.precoAntigo,
      moeda: moedaFromIcone(data.icone),
      custoAquisicao: data.custoAquisicao,
      moedaCusto: data.custoAquisicao != null ? "BRL" : null,
      dataEntrada: new Date(), // entrou no estoque agora
      imagens: {
        create: (data.imagens ?? []).map((url, i) => ({ data: url, ordem: i })),
      },
    },
  });
  revalidateAssets();
  return { ok: true, id: asset.id };
}

export async function updateAsset(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = assetSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;
  // Substitui as imagens (simples e previsível para o MVP).
  await prisma.$transaction([
    prisma.assetImage.deleteMany({ where: { assetId: id } }),
    prisma.asset.update({
      where: { id },
      data: {
        titulo: data.titulo,
        codigo: data.titulo,
        icone: data.icone || null,
        conteudo: data.conteudo || null,
        categoria: data.categoria,
        statusVenda: data.statusVenda,
        destaque: data.destaque,
        tier: data.tier ?? null,
        valor: data.valor,
        precoAntigo: data.precoAntigo,
        moeda: moedaFromIcone(data.icone),
        custoAquisicao: data.custoAquisicao,
        moedaCusto: data.custoAquisicao != null ? "BRL" : null,
        imagens: {
          create: (data.imagens ?? []).map((url, i) => ({ data: url, ordem: i })),
        },
      },
    }),
  ]);
  revalidateAssets();
  return { ok: true, id };
}

/** Lê as imagens (data URLs) de uma BM — usado pelo modal de detalhes. */
export async function fetchAssetImagens(id: string): Promise<string[]> {
  const imgs = await prisma.assetImage.findMany({
    where: { assetId: id },
    orderBy: { ordem: "asc" },
    select: { data: true },
  });
  return imgs.map((i) => i.data);
}

/** Salva a ordem das categorias na landing (admin, drag-and-drop). */
export async function saveCategoryOrder(order: string[]): Promise<ActionResult> {
  await requireAdmin();
  const known = CATEGORIA_ORDER as string[];
  const clean = order.filter((c) => known.includes(c));
  if (clean.length === 0) {
    return { ok: false, error: "Ordem inválida." };
  }
  await prisma.setting.upsert({
    where: { key: CATEGORY_ORDER_KEY },
    update: { value: JSON.stringify(clean) },
    create: { key: CATEGORY_ORDER_KEY, value: JSON.stringify(clean) },
  });
  revalidatePath("/");
  revalidatePath("/admin/categorias");
  revalidatePath("/admin/ativos");
  return { ok: true };
}

export async function deleteAsset(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.asset.delete({ where: { id } });
  revalidateAssets();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Páginas
// ---------------------------------------------------------------------------

export async function createPage(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;
  const page = await prisma.page.create({
    data: {
      nome: data.nome,
      categoria: data.categoria,
      kind: data.kind,
      status: data.status,
      valor: data.valor,
      destaque: data.destaque,
      conteudo: data.conteudo || null,
      custoAquisicao: data.custoAquisicao,
      moedaCusto: data.custoAquisicao != null ? "BRL" : null,
      quantidade: data.quantidade,
      dataEntrada: new Date(), // entrou no estoque agora
      imagens: {
        create: (data.imagens ?? []).map((url, i) => ({ data: url, ordem: i })),
      },
    },
  });
  revalidatePages();
  return { ok: true, id: page.id };
}

export async function updatePage(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = pageSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const data = parsed.data;
  // Substitui as imagens (simples e previsível para o MVP).
  await prisma.$transaction([
    prisma.pageImage.deleteMany({ where: { pageId: id } }),
    prisma.page.update({
      where: { id },
      data: {
        nome: data.nome,
        categoria: data.categoria,
        kind: data.kind,
        status: data.status,
        valor: data.valor,
        destaque: data.destaque,
        conteudo: data.conteudo || null,
        custoAquisicao: data.custoAquisicao,
        moedaCusto: data.custoAquisicao != null ? "BRL" : null,
        quantidade: data.quantidade,
        imagens: {
          create: (data.imagens ?? []).map((url, i) => ({ data: url, ordem: i })),
        },
      },
    }),
  ]);
  revalidatePages();
  return { ok: true, id };
}

/** Lê as imagens (data URLs) de uma página — usado pelo modal de detalhes. */
export async function fetchPageImagens(id: string): Promise<string[]> {
  const imgs = await prisma.pageImage.findMany({
    where: { pageId: id },
    orderBy: { ordem: "asc" },
    select: { data: true },
  });
  return imgs.map((i) => i.data);
}

export async function deletePage(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.page.delete({ where: { id } });
  revalidatePages();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Aluguéis (planos de aluguel de contas de agência)
// ---------------------------------------------------------------------------

function revalidateRentals() {
  revalidatePath("/");
  revalidatePath("/admin/alugueis");
}

/** Normaliza um texto em slug url-safe. */
function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
}

/** Gera um slug único (acrescenta -2, -3… em caso de colisão). */
async function uniqueRentalSlug(base: string, exceptId?: string): Promise<string> {
  const root = slugify(base) || "plano";
  let slug = root;
  let n = 2;
  // Loop curto: o volume de planos é baixo.
  for (;;) {
    const found = await prisma.rentalPlan.findUnique({ where: { slug } });
    if (!found || found.id === exceptId) return slug;
    slug = `${root}-${n++}`;
  }
}

export async function createRentalPlan(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = rentalPlanSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;
  const slug = await uniqueRentalSlug(d.slug || d.nome);
  const plan = await prisma.rentalPlan.create({
    data: {
      nome: d.nome,
      slug,
      precoMensal: d.precoMensal,
      contasAtivas: d.contasAtivas,
      reposicoesIlimitadas: d.reposicoesIlimitadas,
      paginasAntigas2021: d.paginasAntigas2021,
      paginasAntigas2021Ilimitadas: d.paginasAntigas2021Ilimitadas,
      perfisVerificados: d.perfisVerificados,
      beneficios: d.beneficios || null,
      destaque: d.destaque,
      ordem: d.ordem,
      ativo: d.ativo,
    },
  });
  revalidateRentals();
  return { ok: true, id: plan.id };
}

export async function updateRentalPlan(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = rentalPlanSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;
  const slug = await uniqueRentalSlug(d.slug || d.nome, id);
  await prisma.rentalPlan.update({
    where: { id },
    data: {
      nome: d.nome,
      slug,
      precoMensal: d.precoMensal,
      contasAtivas: d.contasAtivas,
      reposicoesIlimitadas: d.reposicoesIlimitadas,
      paginasAntigas2021: d.paginasAntigas2021,
      paginasAntigas2021Ilimitadas: d.paginasAntigas2021Ilimitadas,
      perfisVerificados: d.perfisVerificados,
      beneficios: d.beneficios || null,
      destaque: d.destaque,
      ordem: d.ordem,
      ativo: d.ativo,
    },
  });
  revalidateRentals();
  return { ok: true, id };
}

export async function deleteRentalPlan(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.rentalPlan.delete({ where: { id } });
  revalidateRentals();
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Clientes (CRM de aluguéis)
// ---------------------------------------------------------------------------

function revalidateClients() {
  revalidatePath("/admin/clientes");
  revalidatePath("/admin/alugueis");
}

export async function createClient(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;
  const client = await prisma.client.create({
    data: {
      nome: d.nome,
      contato: d.contato || null,
      planId: d.planId || null,
      valorMensal: d.valorMensal,
      dataVencimento: d.dataVencimento,
      status: d.status,
    },
  });
  revalidateClients();
  return { ok: true, id: client.id };
}

export async function updateClient(
  id: string,
  input: unknown,
): Promise<ActionResult> {
  await requireAdmin();
  const parsed = clientSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;
  await prisma.client.update({
    where: { id },
    data: {
      nome: d.nome,
      contato: d.contato || null,
      planId: d.planId || null,
      valorMensal: d.valorMensal,
      dataVencimento: d.dataVencimento,
      status: d.status,
      // observacoes preservado — editado pela planilha/bloco (updateClientNotes)
    },
  });
  revalidateClients();
  return { ok: true, id };
}

export async function deleteClient(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.client.delete({ where: { id } });
  revalidateClients();
  return { ok: true };
}

// ── Planilha do cliente (ClientEntry) ────────────────────────────────────────

/** Cria uma linha em branco na planilha do cliente (no fim). */
export async function addClientEntry(clientId: string): Promise<ActionResult> {
  await requireAdmin();
  if (!clientId) return { ok: false, error: "Cliente inválido." };
  const count = await prisma.clientEntry.count({ where: { clientId } });
  const entry = await prisma.clientEntry.create({
    data: { clientId, ordem: count },
  });
  revalidateClients();
  return { ok: true, id: entry.id };
}

/** Atualiza uma linha da planilha. */
export async function updateClientEntry(input: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = clientEntrySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const d = parsed.data;
  await prisma.clientEntry.update({
    where: { id: d.id },
    data: {
      data: d.data,
      descricao: d.descricao,
      valor: d.valor,
      status: d.status,
    },
  });
  revalidateClients();
  return { ok: true };
}

/** Remove uma linha da planilha. */
export async function deleteClientEntry(id: string): Promise<ActionResult> {
  await requireAdmin();
  await prisma.clientEntry.delete({ where: { id } });
  revalidateClients();
  return { ok: true };
}

export type AvisosResult =
  | { ok: true; clientes: number; enviados: number; erros: string[] }
  | { ok: false; error: string };

/** Dispara manualmente os avisos de cobrança por WhatsApp (mesma lógica do cron). */
export async function dispararAvisosCobranca(): Promise<AvisosResult> {
  await requireAdmin();
  try {
    const r = await enviarAvisosCobranca();
    return { ok: true, ...r };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Envia o aviso de cobrança para UM cliente específico (só o cliente). */
export async function enviarAvisoCliente(
  clientId: string,
): Promise<ActionResult> {
  await requireAdmin();
  try {
    const r = await enviarAvisoParaCliente(clientId);
    return r.ok ? { ok: true } : { ok: false, error: r.error ?? "Falha no envio." };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Avança uma data em 1 mês (em UTC), mantendo o dia (com clamp no fim do mês). */
function avancarUmMes(d: Date): Date {
  const dia = d.getUTCDate();
  const r = new Date(d);
  r.setUTCDate(1);
  r.setUTCMonth(r.getUTCMonth() + 1);
  const ultimoDia = new Date(
    Date.UTC(r.getUTCFullYear(), r.getUTCMonth() + 1, 0),
  ).getUTCDate();
  r.setUTCDate(Math.min(dia, ultimoDia));
  return r;
}

/**
 * Registra o pagamento do mês: avança o vencimento +1 mês (reabrindo o ciclo de
 * avisos) e lança uma linha "pago" na planilha do cliente.
 */
export async function registrarPagamento(
  clientId: string,
): Promise<ActionResult> {
  await requireAdmin();
  const c = await prisma.client.findUnique({
    where: { id: clientId },
    select: { dataVencimento: true, valorMensal: true },
  });
  if (!c) return { ok: false, error: "Cliente não encontrado." };
  if (!c.dataVencimento) {
    return {
      ok: false,
      error: "Defina uma data de vencimento antes de registrar o pagamento.",
    };
  }

  const venc = c.dataVencimento;
  const proximoVenc = avancarUmMes(venc);
  const mesPago = venc.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
  const ordem = await prisma.clientEntry.count({ where: { clientId } });

  await prisma.$transaction([
    prisma.client.update({
      where: { id: clientId },
      data: {
        dataVencimento: proximoVenc,
        avisoPreEm: null,
        avisoDiaEm: null,
        pagoVencimentoEm: null,
      },
    }),
    prisma.clientEntry.create({
      data: {
        clientId,
        data: new Date(),
        descricao: `Mensalidade ${mesPago}`,
        valor: c.valorMensal,
        status: "pago",
        ordem,
      },
    }),
  ]);
  revalidateClients();
  return { ok: true };
}

/** Salva o bloco de anotações livres do cliente (campo observacoes). */
export async function updateClientNotes(
  clientId: string,
  anotacoes: string,
): Promise<ActionResult> {
  await requireAdmin();
  if (!clientId) return { ok: false, error: "Cliente inválido." };
  await prisma.client.update({
    where: { id: clientId },
    data: { observacoes: anotacoes.slice(0, 5000) || null },
  });
  revalidateClients();
  return { ok: true };
}
