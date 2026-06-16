import type { RentalPlan } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/**
 * Planos de aluguel de contas de agência.
 *
 * Todos os campos do RentalPlan são públicos (preço/quotas fazem parte da
 * oferta) — não há dado sigiloso, então não é necessária allowlist como em
 * Asset/Page. Os preços e quotas são 100% editáveis no admin.
 */

/** Todos os planos para a área admin (ordenados pela `ordem`). */
export function getAdminRentalPlans(): Promise<RentalPlan[]> {
  return prisma.rentalPlan.findMany({
    orderBy: [{ ordem: "asc" }, { precoMensalUSD: "asc" }],
  });
}

/** Planos ativos para a landing pública (ordenados pela `ordem`). */
export function getActiveRentalPlans(): Promise<RentalPlan[]> {
  return prisma.rentalPlan.findMany({
    where: { ativo: true },
    orderBy: [{ ordem: "asc" }, { precoMensalUSD: "asc" }],
  });
}

export function getRentalPlanById(id: string) {
  return prisma.rentalPlan.findUnique({ where: { id } });
}
