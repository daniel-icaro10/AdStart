import { Wallet, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { FinanceiroNav } from "@/components/admin/financeiro/financeiro-nav";
import { PeriodSelector } from "@/components/admin/financeiro/period-selector";
import { MetricsCards } from "@/components/admin/financeiro/metrics-cards";
import { FaturamentoPorGrupo } from "@/components/admin/financeiro/faturamento-por-grupo";
import { FinanceiroCharts } from "@/components/admin/financeiro/financeiro-charts";
import {
  resolverPeriodo,
  getMetricasFinanceiras,
  getSerieMensal,
} from "@/lib/financeiro";

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

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Financeiro"
        description="Controle de estoque, vendas, perdas e lucro — consolidado em R$."
        icon={Wallet}
        actions={
          <Button asChild variant="outline" size="sm">
            <a
              href={`/admin/financeiro/export?tipo=resumo&${new URLSearchParams(
                Object.entries({
                  periodo: searchParams.periodo ?? "",
                  inicio: searchParams.inicio ?? "",
                  fim: searchParams.fim ?? "",
                }).filter(([, v]) => v),
              ).toString()}`}
            >
              <Download className="h-4 w-4" />
              Exportar CSV
            </a>
          </Button>
        }
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
