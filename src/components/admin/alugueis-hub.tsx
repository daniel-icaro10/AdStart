"use client";

import * as React from "react";
import { KeyRound, Users, Bell } from "lucide-react";

import { AdminTabBar } from "@/components/admin/admin-tab-bar";
import { AdminHero, type AdminHeroStat } from "@/components/admin/admin-hero";
import { RentalsManager } from "@/components/admin/rentals-manager";
import { ClientsManager } from "@/components/admin/clients-manager";
import { formatCurrency } from "@/lib/format";
import type { RentalPlan } from "@prisma/client";
import type { ClientWithPlan } from "@/types";

const brl = (v: number) => formatCurrency(v, "BRL");

export type AlugueisTab = "PLANOS" | "CLIENTES";

/** Hub da aba "Aluguéis": sub-abas Planos / Clientes. */
export function AlugueisHub({
  plans,
  clients,
  initialTab = "PLANOS",
}: {
  plans: RentalPlan[];
  clients: ClientWithPlan[];
  initialTab?: AlugueisTab;
}) {
  const [tab, setTab] = React.useState<AlugueisTab>(initialTab);

  const tabs = [
    { value: "PLANOS", label: "Planos", Icon: KeyRound, count: plans.length },
    { value: "CLIENTES", label: "Clientes", Icon: Users, count: clients.length },
  ] as const;

  const clientesAtivos = clients.filter((c) => c.status === "ATIVO");
  const clientesInativos = clients.length - clientesAtivos.length;
  const mrr = clientesAtivos.reduce((sum, c) => sum + (c.valorMensal ?? 0), 0);
  const planosAtivos = plans.filter((p) => p.ativo).length;

  const heroStats: AdminHeroStat[] = [
    {
      label: "Planos ativos",
      value: String(planosAtivos),
      sub: `${plans.length} no total`,
      tone: "neutral",
    },
    { label: "Clientes ativos", value: String(clientesAtivos.length), tone: "neutral" },
    { label: "Receita mensal (MRR)", value: brl(mrr), tone: "positive" },
    {
      label: "Pausados/cancelados",
      value: String(clientesInativos),
      tone: clientesInativos > 0 ? "negative" : "neutral",
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHero
        title="Aluguéis"
        description="Planos de aluguel e clientes ativos."
        stats={heroStats}
        action={{ label: "Ver alertas", href: "/admin#alertas", icon: Bell }}
      />

      <AdminTabBar
        items={tabs.map((t) => ({
          key: t.value,
          label: t.label,
          icon: t.Icon,
          count: t.count,
          active: tab === t.value,
          onClick: () => setTab(t.value),
        }))}
      />

      {tab === "PLANOS" ? (
        <RentalsManager plans={plans} />
      ) : (
        <ClientsManager clients={clients} plans={plans} />
      )}
    </div>
  );
}
