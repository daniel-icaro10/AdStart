import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Boxes,
  Target,
  PiggyBank,
  Receipt,
  AlertTriangle,
  Percent,
  ShieldAlert,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { MetricasFinanceiras } from "@/lib/financeiro";

function brl(v: number) {
  return formatCurrency(v, "BRL");
}
function pct(v: number) {
  return `${v.toFixed(1).replace(".", ",")}%`;
}

interface CardDef {
  label: string;
  value: string;
  icon: typeof Wallet;
  hint?: string;
  tone?: "default" | "positive" | "negative" | "accent";
}

/** Cards de resumo do dashboard financeiro (tudo consolidado em BRL). */
export function MetricsCards({ m }: { m: MetricasFinanceiras }) {
  const lucroPos = m.lucroRealizado >= 0;

  const cards: CardDef[] = [
    {
      label: "Investimento (período)",
      value: brl(m.investimentoTotal),
      icon: Wallet,
      hint: "Custo dos ativos que entraram + custos operacionais",
    },
    {
      label: "Receita realizada",
      value: brl(m.receitaRealizada),
      icon: Receipt,
      hint: `${m.totalVendidoPeriodo} venda(s) no período`,
    },
    {
      label: "Lucro realizado",
      value: brl(m.lucroRealizado),
      icon: lucroPos ? TrendingUp : TrendingDown,
      tone: lucroPos ? "positive" : "negative",
      hint: "Vendas com custo − custos operacionais",
    },
    {
      label: "ROI realizado",
      value: pct(m.roiRealizado),
      icon: Percent,
      tone: m.roiRealizado >= 0 ? "positive" : "negative",
    },
    {
      label: "Perdas (período)",
      value: brl(m.perdas),
      icon: AlertTriangle,
      tone: m.perdas > 0 ? "negative" : "default",
      hint: `${m.totalPerdidoPeriodo} ativo(s) perdido(s)`,
    },
    {
      label: "Taxa de perda",
      value: pct(m.taxaPerda),
      icon: ShieldAlert,
      tone: m.taxaPerda > 0 ? "negative" : "default",
      hint: "Perdidos ÷ (vendidos + perdidos)",
    },
    {
      label: "Estoque (custo)",
      value: brl(m.valorEstoqueCusto),
      icon: Boxes,
      hint: `${m.totalEmEstoque} disponível · ${m.totalReservado} reservado`,
    },
    {
      label: "Estoque (potencial)",
      value: brl(m.valorEstoquePotencial),
      icon: Target,
      tone: "accent",
    },
    {
      label: "Lucro previsto",
      value: brl(m.lucroPrevisto),
      icon: PiggyBank,
      tone: m.lucroPrevisto >= 0 ? "positive" : "negative",
      hint: "Potencial − custo do estoque",
    },
  ];

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-xl border border-border bg-card p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{c.label}</span>
              <c.icon
                className={cn(
                  "h-4 w-4",
                  c.tone === "positive" && "text-emerald-400",
                  c.tone === "negative" && "text-rose-400",
                  c.tone === "accent" && "text-brand",
                  (!c.tone || c.tone === "default") && "text-muted-foreground",
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
            {c.hint && (
              <div className="mt-1 text-xs text-muted-foreground">{c.hint}</div>
            )}
          </div>
        ))}
      </div>

      {m.vendasSemCusto > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5" />
          {m.vendasSemCusto} venda(s) sem custo de aquisição registrado — contam
          na receita, mas ficam fora do lucro e do ROI.
        </p>
      )}
    </div>
  );
}
