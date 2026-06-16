import { prisma } from "@/lib/prisma";
import type { ClientWithPlan } from "@/types";

/**
 * Clientes do controle de aluguéis (CRM admin). Inclui o plano vinculado.
 * Ordenados pelo vencimento mais próximo (sem data vão para o fim).
 */
export function getAdminClients(): Promise<ClientWithPlan[]> {
  return prisma.client.findMany({
    include: { plan: true, entries: { orderBy: { ordem: "asc" } } },
    orderBy: [{ dataVencimento: "asc" }, { createdAt: "desc" }],
  });
}

export function getClientById(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: { plan: true, entries: { orderBy: { ordem: "asc" } } },
  });
}
