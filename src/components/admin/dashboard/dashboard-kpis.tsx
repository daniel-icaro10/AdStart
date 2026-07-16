import {
  Boxes,
  TrendingUp,
  Receipt,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCurrency, breakdownMoeda } from "@/lib/format";
import type { MetricasFinanceiras } from "@/lib/financeiro";

const brl = (v: number) => formatCurrency(v, "BRL");
const pct = (v: number) => `${v.toFixed(1).replace(".", ",")}%`;

type Tone = "neutral" | "positive" | "negative";

interface Kpi {
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  tone: Tone;
}

/** Regra: zero/nulo é neutro — só colore quando o valor carrega significado. */
function sign(v: number): Tone {
  if (v > 0) return "positive";
  if (v < 0) return "negative";
  return "neutral";
}

/** Faixa de KPIs do dashboard — anatomia idêntica nos quatro cards. */
export function DashboardKpis({ m }: { m: MetricasFinanceiras }) {
  const quebra = breakdownMoeda(m.estoqueCustoUSD, m.estoqueCustoBRL);
  const cards: Kpi[] = [
    {
      label: "Estoque (custo)",
      value: brl(m.valorEstoqueCusto),
      sub: `${quebra ? `${quebra} · ` : ""}${m.totalEmEstoque} disp. · ${m.totalReservado} reserv.`,
      icon: Boxes,
      tone: "neutral",
    },
    {
      label: "Lucro do mês",
      value: brl(m.lucroRealizado),
      sub: `ROI ${pct(m.roiRealizado)}`,
      icon: TrendingUp,
      tone: sign(m.lucroRealizado),
    },
    {
      label: "Vendas do mês",
      value: String(m.totalVendidoPeriodo),
      sub: `Receita ${brl(m.receitaRealizada)}`,
      icon: Receipt,
      tone: "neutral",
    },
    {
      label: "Perdas do mês",
      value: brl(m.perdas),
      sub: `${m.totalPerdidoPeriodo} perdido(s) · taxa ${pct(m.taxaPerda)}`,
      icon: AlertTriangle,
      tone: m.perdas > 0 ? "negative" : "neutral",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-xl border border-border bg-card p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="text-xs uppercase tracking-wide text-faint">
              {c.label}
            </span>
            <c.icon className="h-4 w-4 shrink-0 text-faint" />
          </div>
          <div
            className={cn(
              "mt-2 text-3xl font-semibold tabular-nums",
              c.tone === "positive" && "text-positive",
              c.tone === "negative" && "text-negative",
              c.tone === "neutral" && "text-foreground",
            )}
          >
            {c.value}
          </div>
          <div className="mt-1 text-sm text-muted-foreground">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}
