import {
  Boxes,
  TrendingUp,
  TrendingDown,
  Receipt,
  AlertTriangle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { MetricasFinanceiras } from "@/lib/financeiro";

const brl = (v: number) => formatCurrency(v, "BRL");
const pct = (v: number) => `${v.toFixed(1).replace(".", ",")}%`;

/** Faixa de KPIs do dashboard (mês atual + estoque). */
export function DashboardKpis({ m }: { m: MetricasFinanceiras }) {
  const lucroPos = m.lucroRealizado >= 0;
  const cards = [
    {
      label: "Estoque (custo)",
      value: brl(m.valorEstoqueCusto),
      hint: `${m.totalEmEstoque} disp. · ${m.totalReservado} reserv. · potencial ${brl(m.valorEstoquePotencial)}`,
      icon: Boxes,
      tone: "default" as const,
    },
    {
      label: "Lucro do mês",
      value: brl(m.lucroRealizado),
      hint: `ROI ${pct(m.roiRealizado)}`,
      icon: lucroPos ? TrendingUp : TrendingDown,
      tone: lucroPos ? ("positive" as const) : ("negative" as const),
    },
    {
      label: "Vendas do mês",
      value: String(m.totalVendidoPeriodo),
      hint: `Receita ${brl(m.receitaRealizada)}`,
      icon: Receipt,
      tone: "default" as const,
    },
    {
      label: "Perdas do mês",
      value: brl(m.perdas),
      hint: `${m.totalPerdidoPeriodo} perdido(s) · taxa ${pct(m.taxaPerda)}`,
      icon: AlertTriangle,
      tone: m.perdas > 0 || m.taxaPerda > 0 ? ("negative" as const) : ("default" as const),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{c.label}</span>
            <c.icon
              className={cn(
                "h-4 w-4",
                c.tone === "positive" && "text-emerald-400",
                c.tone === "negative" && "text-rose-400",
                c.tone === "default" && "text-muted-foreground",
              )}
            />
          </div>
          <div
            className={cn(
              "mt-2 text-2xl font-bold tabular-nums",
              c.tone === "positive" && "text-emerald-400",
              c.tone === "negative" && "text-rose-400",
            )}
          >
            {c.value}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{c.hint}</div>
        </div>
      ))}
    </div>
  );
}
