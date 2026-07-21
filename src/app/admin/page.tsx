import { getDashboardData } from "@/lib/dashboard";
import { resolverPeriodo } from "@/lib/financeiro";
import { FaturamentoPorGrupo } from "@/components/admin/financeiro/faturamento-por-grupo";
import { PeriodSelector } from "@/components/admin/financeiro/period-selector";
import { DashboardHero } from "@/components/admin/dashboard/dashboard-hero";
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
  const d = await getDashboardData(periodo);

  const pendingAlertas = d.agingTotal + d.reservadosTotal + d.incompletosTotal;

  return (
    <div className="space-y-6">
      <DashboardHero m={d.metricas} pendingAlertas={pendingAlertas} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <PeriodSelector
          preset={preset}
          inicio={searchParams.inicio}
          fim={searchParams.fim}
        />
        <DashboardAtalhos />
      </div>

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
