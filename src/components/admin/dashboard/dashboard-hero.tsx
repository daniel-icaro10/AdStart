import { Bell } from "lucide-react";

import { formatCurrency, breakdownMoeda } from "@/lib/format";
import type { MetricasFinanceiras } from "@/lib/financeiro";
import { AdminHero, type AdminHeroStat, type HeroTone } from "@/components/admin/admin-hero";

const brl = (v: number) => formatCurrency(v, "BRL");
const pct = (v: number) => `${v.toFixed(1).replace(".", ",")}%`;

function sign(v: number): HeroTone {
  if (v > 0) return "positive";
  if (v < 0) return "negative";
  return "neutral";
}

/** Banner de boas-vindas do dashboard, com os KPIs de topo em destaque. */
export function DashboardHero({ m, pendingAlertas }: { m: MetricasFinanceiras; pendingAlertas: number }) {
  const quebra = breakdownMoeda(m.estoqueCustoUSD, m.estoqueCustoBRL);
  const stats: AdminHeroStat[] = [
    {
      label: "Estoque (custo)",
      value: brl(m.valorEstoqueCusto),
      sub: `${quebra ? `${quebra} · ` : ""}${m.totalEmEstoque} disp. · ${m.totalReservado} reserv.`,
      tone: "neutral",
    },
    {
      label: "Lucro do mês",
      value: brl(m.lucroRealizado),
      sub: `ROI ${pct(m.roiRealizado)}`,
      tone: sign(m.lucroRealizado),
    },
    {
      label: "Vendas do mês",
      value: String(m.totalVendidoPeriodo),
      sub: `Receita ${brl(m.receitaRealizada)}`,
      tone: "neutral",
    },
    {
      label: "Perdas do mês",
      value: brl(m.perdas),
      sub: `${m.totalPerdidoPeriodo} perdido(s) · taxa ${pct(m.taxaPerda)}`,
      tone: m.perdas > 0 ? "negative" : "neutral",
    },
  ];

  return (
    <AdminHero
      title="Olá!"
      description="Visão geral da operação — estoque, resultado do período e sinais de risco."
      stats={stats}
      action={{
        label: pendingAlertas > 0 ? `${pendingAlertas} alerta(s)` : "Ver alertas",
        href: "#alertas",
        icon: Bell,
      }}
    />
  );
}
