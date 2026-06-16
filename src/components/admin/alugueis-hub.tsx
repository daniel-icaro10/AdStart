"use client";

import * as React from "react";
import { KeyRound, Users } from "lucide-react";

import { cn } from "@/lib/utils";
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
      <div className="inline-flex rounded-xl border border-border bg-card p-1 shadow-sm">
        {tabs.map((t) => {
          const active = tab === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <t.Icon className="h-4 w-4" />
              {t.label}
              <span className="rounded bg-background/60 px-1.5 text-xs tabular-nums">
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {tab === "PLANOS" ? (
        <RentalsManager plans={plans} />
      ) : (
        <ClientsManager clients={clients} plans={plans} />
      )}
    </div>
  );
}
