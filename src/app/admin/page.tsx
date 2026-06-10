import { LayoutDashboard } from "lucide-react";

import { getDashboardData } from "@/lib/dashboard";
import { DashboardKpis } from "@/components/admin/dashboard/dashboard-kpis";
import { DashboardAtalhos } from "@/components/admin/dashboard/dashboard-atalhos";
import { DashboardAlertas } from "@/components/admin/dashboard/dashboard-alertas";
import { DashboardCharts } from "@/components/admin/dashboard/dashboard-charts";
import { DashboardFornecedores } from "@/components/admin/dashboard/dashboard-fornecedores";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const d = await getDashboardData();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <LayoutDashboard className="h-6 w-6 text-brand" />
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Visão geral da operação — estoque, resultado do mês e sinais de risco.
          </p>
        </div>
        <DashboardAtalhos />
      </div>

      <DashboardKpis m={d.metricas} />

      <DashboardAlertas
        aging={d.aging}
        agingWarn={d.agingWarn}
        agingCrit={d.agingCrit}
        reservados={d.reservadosTravados}
        incompletos={d.incompletos}
        incompletosTotal={d.incompletosTotal}
      />

      <DashboardCharts serie={d.serie} estoquePorCategoria={d.estoquePorCategoria} />

      <DashboardFornecedores rows={d.fornecedores} />
    </div>
  );
}
