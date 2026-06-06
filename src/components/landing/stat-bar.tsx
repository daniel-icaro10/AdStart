import { Package, DollarSign, ShieldCheck, FileText } from "lucide-react";

import type { CatalogStats } from "@/types";
import { formatInt } from "@/lib/format";

/** Barra de contadores calculados a partir do banco. */
export function StatBar({ stats }: { stats: CatalogStats }) {
  const items = [
    {
      icon: Package,
      label: "BMs disponíveis",
      value: formatInt(stats.totalDisponiveis),
    },
    {
      icon: DollarSign,
      label: "BMs em dólar",
      value: formatInt(stats.totalDolar),
    },
    {
      icon: ShieldCheck,
      label: "Verificadas",
      value: formatInt(stats.totalVerificadas),
    },
    {
      icon: FileText,
      label: "Páginas disponíveis",
      value: formatInt(stats.totalPaginasDisponiveis),
    },
  ];

  return (
    <section className="container pt-6 sm:pt-8">
      <div className="grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:grid-cols-4 sm:gap-4 sm:p-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-lg px-3 py-2"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <item.icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="text-xl font-bold leading-none">{item.value}</div>
              <div className="mt-1 truncate text-xs text-muted-foreground">
                {item.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
