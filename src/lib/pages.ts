import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { PagePublic } from "@/types";

/** Categoria de uma Page: "PAGINA" (fanpage) ou "PERFIL" (perfil). */
export type CategoriaPagina = "PAGINA" | "PERFIL";

/** Allowlist de campos PÚBLICOS da Página/Perfil (sem nada financeiro). */
const PUBLIC_PAGE_SELECT = {
  id: true,
  nome: true,
  categoria: true,
  kind: true,
  status: true,
  valor: true,
  precoAntigo: true,
  destaque: true,
  conteudo: true,
  // imagem de capa (a primeira) — exibida direto no card da vitrine.
  imagens: { select: { data: true }, orderBy: { ordem: "asc" }, take: 1 },
} as const satisfies Prisma.PageSelect;

/**
 * Páginas/Perfis ativos do catálogo público (por categoria). Mostra apenas
 * DISPONÍVEL/RESERVADO COM unidades em estoque (quantidade > 0). A contagem de
 * unidades nunca é exposta na vitrine.
 */
export function getCatalogPages(
  categoria: CategoriaPagina = "PAGINA",
): Promise<PagePublic[]> {
  return prisma.page.findMany({
    where: {
      categoria,
      status: { in: ["DISPONIVEL", "RESERVADO"] },
      quantidade: { gt: 0 },
    },
    orderBy: [{ destaque: "desc" }, { valor: "desc" }, { createdAt: "desc" }],
    // Allowlist: nenhum campo financeiro sai para a vitrine.
    select: PUBLIC_PAGE_SELECT,
  });
}

/** Páginas/Perfis para a área admin (por categoria, com imagens). */
export function getAdminPages(categoria: CategoriaPagina = "PAGINA") {
  return prisma.page.findMany({
    where: { categoria },
    orderBy: { createdAt: "desc" },
    include: { imagens: { orderBy: { ordem: "asc" } } },
  });
}

export function getPageById(id: string) {
  return prisma.page.findUnique({
    where: { id },
    include: { imagens: { orderBy: { ordem: "asc" } } },
  });
}
