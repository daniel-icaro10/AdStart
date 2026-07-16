import { LayoutDashboard } from "lucide-react";

import { getDashboardData } from "@/lib/dashboard";
import { resolverPeriodo } from "@/lib/financeiro";
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
  const d = await getDashboardData(periodo);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <LayoutDashboard className="h-6 w-6 text-brand" />
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Visão geral da operação — estoque, resultado do período e sinais de
            risco.
          </p>
        </div>
        <DashboardAtalhos />
      </div>

      <PeriodSelector
        preset={preset}
        inicio={searchParams.inicio}
        fim={searchParams.fim}
      />

      <DashboardKpis m={d.metricas} />

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
