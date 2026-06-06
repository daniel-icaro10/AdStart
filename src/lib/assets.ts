import type { Page } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { AssetWithContas, AssetWithDetails, CatalogStats } from "@/types";

/**
 * Busca os ativos visíveis no catálogo público.
 * Vendidos são INCLUÍDOS para que apareçam com selo "VENDIDO" (não some o card),
 * mas você pode filtrá-los aqui se preferir ocultar completamente.
 */
export async function getCatalogAssets(): Promise<AssetWithContas[]> {
  return prisma.asset.findMany({
    orderBy: [{ destaque: "desc" }, { valor: "desc" }, { createdAt: "desc" }],
    include: {
      contas: { orderBy: { nome: "asc" } },
    },
  });
}

/** Todos os ativos para a área admin (com contas + imagens). */
export function getAdminAssets(): Promise<AssetWithDetails[]> {
  return prisma.asset.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      contas: { orderBy: { nome: "asc" } },
      imagens: { orderBy: { ordem: "asc" } },
    },
  });
}

/** Um ativo por id (com contas + imagens) para edição. */
export function getAssetById(id: string) {
  return prisma.asset.findUnique({
    where: { id },
    include: {
      contas: { orderBy: { nome: "asc" } },
      imagens: { orderBy: { ordem: "asc" } },
    },
  });
}

/** Calcula as estatísticas exibidas na barra de contadores da landing. */
export function computeStats(
  assets: AssetWithContas[],
  pages: Page[] = [],
): CatalogStats {
  // Vendidos não contam como "disponíveis".
  const ativos = assets.filter((a) => a.statusVenda !== "VENDIDO");

  return {
    totalDisponiveis: ativos.filter((a) => a.statusVenda === "DISPONIVEL").length,
    totalDolar: ativos.filter((a) => a.moeda === "USD").length,
    totalVerificadas: ativos.filter((a) => a.verificada).length,
    totalPaginasDisponiveis: pages.filter(
      (p) => p.status === "DISPONIVEL",
    ).length,
  };
}
