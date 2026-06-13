import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { PagePublic } from "@/types";

/** Allowlist de campos PÚBLICOS da Página (sem nada financeiro). */
const PUBLIC_PAGE_SELECT = {
  id: true,
  nome: true,
  nicho: true,
  kind: true,
  seguidores: true,
  anoCriacao: true,
  status: true,
  valor: true,
  destaque: true,
} as const satisfies Prisma.PageSelect;

/**
 * Páginas ativas do catálogo público. Mostra apenas DISPONÍVEL/RESERVADO —
 * vendidas vão para a aba "Vendidos" (getVendidosPages); perdidas, nunca.
 */
export function getCatalogPages(): Promise<PagePublic[]> {
  return prisma.page.findMany({
    where: { status: { in: ["DISPONIVEL", "RESERVADO"] } },
    orderBy: [{ destaque: "desc" }, { valor: "desc" }, { createdAt: "desc" }],
    // Allowlist: nenhum campo financeiro sai para a vitrine.
    select: PUBLIC_PAGE_SELECT,
  });
}

/** Páginas já vendidas, para a aba "Vendidos". Mais recentes primeiro. */
export function getVendidosPages(): Promise<PagePublic[]> {
  return prisma.page.findMany({
    where: { status: "VENDIDO" },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: PUBLIC_PAGE_SELECT,
  });
}

/** Todas as páginas para a área admin. */
export function getAdminPages() {
  return prisma.page.findMany({ orderBy: { createdAt: "desc" } });
}

export function getPageById(id: string) {
  return prisma.page.findUnique({ where: { id } });
}
