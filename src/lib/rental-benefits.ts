import type { RentalPlan } from "@prisma/client";

/**
 * Deriva a lista de benefícios de um plano de aluguel a partir dos campos
 * estruturados + os benefícios extras em texto livre. Módulo PURO (sem prisma)
 * para poder ser usado tanto no servidor quanto em componentes client.
 */
export function rentalBenefits(plan: RentalPlan): string[] {
  const lista: string[] = [];

  if (plan.contasAtivas > 0) {
    lista.push(
      `${plan.contasAtivas} conta${plan.contasAtivas > 1 ? "s" : ""} de anúncio ativa${
        plan.contasAtivas > 1 ? "s" : ""
      }`,
    );
  }
  if (plan.reposicoesIlimitadas) lista.push("Reposições ilimitadas");
  if (plan.paginasAntigas2021Ilimitadas) {
    lista.push("Páginas antigas 2021 ilimitadas");
  } else if (plan.paginasAntigas2021) {
    lista.push("Páginas antigas 2021");
  }
  if (plan.perfisVerificados > 0) {
    lista.push(
      `${plan.perfisVerificados} perfil${
        plan.perfisVerificados > 1 ? "is" : ""
      } verificado${plan.perfisVerificados > 1 ? "s" : ""}`,
    );
  }

  // Benefícios extras digitados em texto livre (um por linha).
  if (plan.beneficios) {
    for (const linha of plan.beneficios.split("\n")) {
      const t = linha.trim().replace(/^[-•]\s*/, "");
      if (t) lista.push(t);
    }
  }

  return lista;
}
