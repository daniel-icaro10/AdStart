import { getDashboardData } from "@/lib/dashboard";
import {
  resolverPeriodo,
  periodoAnterior,
  getMetricasFinanceiras,
} from "@/lib/financeiro";
import { SectionTitle } from "@/components/ui/ds/section-title";
import { FaturamentoPorGrupo } from "@/components/admin/financeiro/faturamento-por-grupo";
import { PeriodSelector } from "@/components/admin/financeiro/period-selector";
import { DashboardKpis } from "@/components/admin/dashboard/dashboard-kpis";
import { DashboardAtalhos } from "@/components/admin/dashboard/dashboard-atalhos";
import { DashboardAlertas } from "@/components/admin/dashboard/dashboard-alertas";
import { DashboardCharts } from "@/components/admin/dashboard/dashboard-charts";
import { DashboardFornecedores } from "@/components/admin/dashboard/dashboard-fornecedores";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: { periodo?: string; inicio?: string; fim?: string };
}) {
  const { preset, periodo } = resolverPeriodo(
    searchParams.periodo,
    searchParams.inicio,
    searchParams.fim,
  );
  const [d, metricasAnterior] = await Promise.all([
    getDashboardData(periodo),
    // "Total" não tem período anterior significativo — sem badge de variação.
    preset === "total"
      ? Promise.resolve(null)
      : getMetricasFinanceiras(periodoAnterior(periodo)),
  ]);

  return (
    <div className="space-y-6">
      <SectionTitle
        as="h1"
        size="l"
        description="Visão geral da operação — estoque, resultado do período e sinais de risco."
        action={<DashboardAtalhos />}
      >
        Dashboard
      </SectionTitle>

      <PeriodSelector
        preset={preset}
        inicio={searchParams.inicio}
        fim={searchParams.fim}
      />

      <DashboardKpis m={d.metricas} anterior={metricasAnterior} />

      <FaturamentoPorGrupo m={d.metricas} />

      <DashboardAlertas
        aging={d.aging}
        agingTotal={d.agingTotal}
        agingWarn={d.agingWarn}
        agingCrit={d.agingCrit}
        reservados={d.reservadosTravados}
        reservadosTotal={d.reservadosTotal}
        incompletosTotal={d.incompletosTotal}
        incSemCusto={d.incSemCusto}
        incSemFornecedor={d.incSemFornecedor}
      />

      <DashboardCharts serie={d.serie} estoquePorCategoria={d.estoquePorCategoria} />

      <DashboardFornecedores rows={d.fornecedores} />
    </div>
  );
}
