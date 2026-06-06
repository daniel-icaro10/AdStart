import { prisma } from "@/lib/prisma";

/** Páginas exibidas no catálogo público (todas; vendidas aparecem com selo). */
export function getCatalogPages() {
  return prisma.page.findMany({
    orderBy: [{ destaque: "desc" }, { valor: "desc" }, { createdAt: "desc" }],
  });
}

/** Todas as páginas para a área admin. */
export function getAdminPages() {
  return prisma.page.findMany({ orderBy: { createdAt: "desc" } });
}

export function getPageById(id: string) {
  return prisma.page.findUnique({ where: { id } });
}
