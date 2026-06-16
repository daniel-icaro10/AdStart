"use client";

import { Check, MessageCircle, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { buildWhatsappLink } from "@/lib/config";
import { rentalBenefits } from "@/lib/rental-benefits";
import type { RentalPlan } from "@prisma/client";

/** Card de pricing de um plano de aluguel. */
function RentalCard({ plan }: { plan: RentalPlan }) {
  const beneficios = rentalBenefits(plan);

  const whatsappLink = buildWhatsappLink(
    [
      `Olá! Tenho interesse no *${plan.nome}* (Aluguel de Contas de Agência).`,
      "",
      `• ${formatCurrency(plan.precoMensal, "BRL")}/mês`,
      ...beneficios.map((b) => `• ${b}`),
      "",
      "Pode me passar mais detalhes?",
    ].join("\n"),
  );

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card p-6 shadow-sm",
        plan.destaque
          ? "border-primary/70 shadow-[0_12px_40px_-12px_rgb(var(--brand)/0.55)] lg:scale-[1.03]"
          : "border-border",
      )}
    >
      {plan.destaque && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 border border-primary/30 bg-primary text-primary-foreground shadow">
          <Star className="h-3 w-3" />
          Mais popular
        </Badge>
      )}

      <h3 className="text-lg font-semibold">{plan.nome}</h3>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-4xl font-bold tabular-nums text-brand">
          {formatCurrency(plan.precoMensal, "BRL")}
        </span>
        <span className="text-sm text-muted-foreground">/mês</span>
      </div>

      <ul className="mt-5 flex-1 space-y-2.5">
        {beneficios.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-positive" />
            <span>{b}</span>
          </li>
        ))}
      </ul>

      <Button
        asChild
        variant={plan.destaque ? "default" : "whatsapp"}
        size="lg"
        className="mt-6 w-full"
      >
        <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-5 w-5" />
          Tenho interesse
        </a>
      </Button>
    </div>
  );
}

/**
 * Seção "Aluguéis" da landing: planos de aluguel de contas de agência exibidos
 * como cards de pricing, com o plano em destaque visualmente realçado.
 */
export function RentalsSection({ plans }: { plans: RentalPlan[] }) {
  if (plans.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground">
        Nenhum plano de aluguel disponível no momento.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Aluguel de Contas de Agência
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Escolha o plano ideal e use contas ativas com reposição garantida.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <RentalCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
}
