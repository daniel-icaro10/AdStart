"use client";

import * as React from "react";
import { KeyRound, Users } from "lucide-react";

import { AdminTabBar } from "@/components/admin/admin-tab-bar";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { RentalsManager } from "@/components/admin/rentals-manager";
import { ClientsManager } from "@/components/admin/clients-manager";
import type { RentalPlan } from "@prisma/client";
import type { ClientWithPlan } from "@/types";

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

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Aluguéis" description="Planos de aluguel e clientes ativos." />

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
