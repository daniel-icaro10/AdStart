import { Download } from "lucide-react";

import { AdminHero, type AdminHeroStat, type HeroTone } from "@/components/admin/admin-hero";
import { FinanceiroNav } from "@/components/admin/financeiro/financeiro-nav";
import { PeriodSelector } from "@/components/admin/financeiro/period-selector";
import { MetricsCards } from "@/components/admin/financeiro/metrics-cards";
import { FaturamentoPorGrupo } from "@/components/admin/financeiro/faturamento-por-grupo";
import { FinanceiroCharts } from "@/components/admin/financeiro/financeiro-charts";
import { formatCurrency } from "@/lib/format";
import {
  resolverPeriodo,
  getMetricasFinanceiras,
  getSerieMensal,
} from "@/lib/financeiro";

const brl = (v: number) => formatCurrency(v, "BRL");
const pct = (v: number) => `${v.toFixed(1).replace(".", ",")}%`;
function sign(v: number): HeroTone {
  if (v > 0) return "positive";
  if (v < 0) return "negative";
  return "neutral";
}

export const dynamic = "force-dynamic";

export default async function FinanceiroPage({
  searchParams,
}: {
  searchParams: { periodo?: string; inicio?: string; fim?: string };
}) {
  const { preset, periodo } = resolverPeriodo(
    searchParams.periodo,
    searchParams.inicio,
    searchParams.fim,
  );

  const [metricas, serie] = await Promise.all([
    getMetricasFinanceiras(periodo),
    getSerieMensal(6),
  ]);

  const exportHref = `/admin/financeiro/export?tipo=resumo&${new URLSearchParams(
    Object.entries({
      periodo: searchParams.periodo ?? "",
      inicio: searchParams.inicio ?? "",
      fim: searchParams.fim ?? "",
    }).filter(([, v]) => v),
  ).toString()}`;

  const heroStats: AdminHeroStat[] = [
    { label: "Investimento (período)", value: brl(metricas.investimentoTotal), tone: "neutral" },
    {
      label: "Receita realizada",
      value: brl(metricas.receitaRealizada),
      sub: `${metricas.totalVendidoPeriodo} venda(s)`,
      tone: "neutral",
    },
    {
      label: "Lucro realizado",
      value: brl(metricas.lucroRealizado),
      sub: `ROI ${pct(metricas.roiRealizado)}`,
      tone: sign(metricas.lucroRealizado),
    },
    {
      label: "Perdas (período)",
      value: brl(metricas.perdas),
      sub: `${metricas.totalPerdidoPeriodo} perdido(s)`,
      tone: metricas.perdas > 0 ? "negative" : "neutral",
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHero
        title="Financeiro"
        description="Controle de estoque, vendas, perdas e lucro — consolidado em R$."
        stats={heroStats}
        action={{ label: "Exportar CSV", href: exportHref, icon: Download }}
      />

      <FinanceiroNav />
      <PeriodSelector
        preset={preset}
        inicio={searchParams.inicio}
        fim={searchParams.fim}
      />
      <MetricsCards m={metricas} />
      <FaturamentoPorGrupo m={metricas} />
      <FinanceiroCharts serie={serie} m={metricas} />
    </div>
  );
}
