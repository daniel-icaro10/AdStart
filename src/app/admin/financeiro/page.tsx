import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/ds/section-title";
import { FinanceiroNav } from "@/components/admin/financeiro/financeiro-nav";
import { PeriodSelector } from "@/components/admin/financeiro/period-selector";
import { MetricsCards } from "@/components/admin/financeiro/metrics-cards";
import { FaturamentoPorGrupo } from "@/components/admin/financeiro/faturamento-por-grupo";
import { FinanceiroCharts } from "@/components/admin/financeiro/financeiro-charts";
import {
  resolverPeriodo,
  periodoAnterior,
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

  const [metricas, serie, metricasAnterior] = await Promise.all([
    getMetricasFinanceiras(periodo),
    getSerieMensal(6),
    preset === "total"
      ? Promise.resolve(null)
      : getMetricasFinanceiras(periodoAnterior(periodo)),
  ]);

  return (
    <div className="space-y-6">
      <SectionTitle
        as="h1"
        size="l"
        description="Controle de estoque, vendas, perdas e lucro — consolidado em R$."
        action={
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
      >
        Financeiro
      </SectionTitle>

      <FinanceiroNav />
      <PeriodSelector
        preset={preset}
        inicio={searchParams.inicio}
        fim={searchParams.fim}
      />
      <MetricsCards m={metricas} anterior={metricasAnterior} />
      <FaturamentoPorGrupo m={metricas} />
      <FinanceiroCharts serie={serie} m={metricas} />
    </div>
  );
}
