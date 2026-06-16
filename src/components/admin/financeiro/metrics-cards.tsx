import {
  TrendingUp,
  Wallet,
  Boxes,
  Target,
  PiggyBank,
  Receipt,
  AlertTriangle,
  Percent,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { MetricasFinanceiras } from "@/lib/financeiro";

const brl = (v: number) => formatCurrency(v, "BRL");
const pct = (v: number) => `${v.toFixed(1).replace(".", ",")}%`;

type Tone = "neutral" | "positive" | "negative";
function sign(v: number): Tone {
  if (v > 0) return "positive";
  if (v < 0) return "negative";
  return "neutral";
}

interface CardDef {
  label: string;
  value: string;
  icon: LucideIcon;
  hint?: string;
  tone: Tone;
}

/** Cards de resumo do dashboard financeiro (consolidado em BRL). */
export function MetricsCards({ m }: { m: MetricasFinanceiras }) {
  const cards: CardDef[] = [
    {
      label: "Investimento (período)",
      value: brl(m.investimentoTotal),
      icon: Wallet,
      hint: "Custo dos ativos que entraram + custos operacionais",
      tone: "neutral",
    },
    {
      label: "Receita realizada",
      value: brl(m.receitaRealizada),
      icon: Receipt,
      hint: `${m.totalVendidoPeriodo} venda(s) no período`,
      tone: "neutral",
    },
    {
      label: "Lucro realizado",
      value: brl(m.lucroRealizado),
      icon: TrendingUp,
      tone: sign(m.lucroRealizado),
      hint: "Vendas com custo − custos operacionais",
    },
    {
      label: "ROI realizado",
      value: pct(m.roiRealizado),
      icon: Percent,
      tone: sign(m.roiRealizado),
    },
    {
      label: "Perdas (período)",
      value: brl(m.perdas),
      icon: AlertTriangle,
      tone: m.perdas > 0 ? "negative" : "neutral",
      hint: `${m.totalPerdidoPeriodo} ativo(s) perdido(s)`,
    },
    {
      label: "Taxa de perda",
      value: pct(m.taxaPerda),
      icon: ShieldAlert,
      tone: m.taxaPerda > 0 ? "negative" : "neutral",
      hint: "Perdidos ÷ (vendidos + perdidos)",
    },
    {
      label: "Estoque (custo)",
      value: brl(m.valorEstoqueCusto),
      icon: Boxes,
      hint: `${m.totalEmEstoque} disponível · ${m.totalReservado} reservado`,
      tone: "neutral",
    },
    {
      label: "Estoque (potencial)",
      value: brl(m.valorEstoquePotencial),
      icon: Target,
      hint: "Só ativos precificados (custo + preço previsto)",
      tone: "neutral",
    },
    {
      label: "Lucro previsto",
      value: brl(m.lucroPrevisto),
      icon: PiggyBank,
      tone: sign(m.lucroPrevisto),
      hint: "Potencial − custo, sobre o mesmo conjunto precificado",
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
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs uppercase tracking-wide text-faint">
                {c.label}
              </span>
              <c.icon className="h-4 w-4 shrink-0 text-faint" />
            </div>
            <div
              className={cn(
                "mt-2 text-2xl font-semibold tabular-nums",
                c.tone === "positive" && "text-positive",
                c.tone === "negative" && "text-negative",
                c.tone === "neutral" && "text-foreground",
              )}
            >
              {c.value}
            </div>
            {c.hint && (
              <div className="mt-1 text-sm text-muted-foreground">{c.hint}</div>
            )}
          </div>
        ))}
      </div>

      {m.vendasSemCusto > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-warning">
          <AlertTriangle className="h-3.5 w-3.5" />
          {m.vendasSemCusto} venda(s) sem custo de aquisição registrado — contam
          na receita, mas ficam fora do lucro e do ROI.
        </p>
      )}

      {m.estoqueSemPreco > 0 && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-warning">
          <AlertTriangle className="h-3.5 w-3.5" />
          {m.estoqueSemPreco} ativo(s) em estoque sem custo e/ou preço previsto —
          fora do potencial e do lucro previsto.
        </p>
      )}
    </div>
  );
}
