"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assetSchema, pageSchema } from "@/lib/validation";
import { CATEGORIA_ORDER } from "@/lib/constants";
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
  revalidatePath("/admin/paginas");
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
      moeda: moedaFromIcone(data.icone),
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
        moeda: moedaFromIcone(data.icone),
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
      kind: data.kind,
      status: data.status,
      valor: data.valor,
      destaque: data.destaque,
      conteudo: data.conteudo || null,
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
        kind: data.kind,
        status: data.status,
        valor: data.valor,
        destaque: data.destaque,
        conteudo: data.conteudo || null,
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
