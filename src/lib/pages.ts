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

/** Páginas exibidas no catálogo público (vendidas aparecem com selo; perdidas, não). */
export function getCatalogPages(): Promise<PagePublic[]> {
  return prisma.page.findMany({
    where: { status: { not: "PERDIDO" } },
    orderBy: [{ destaque: "desc" }, { valor: "desc" }, { createdAt: "desc" }],
    // Allowlist: nenhum campo financeiro sai para a vitrine.
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
