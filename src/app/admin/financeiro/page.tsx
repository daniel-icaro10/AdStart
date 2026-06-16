import { Wallet, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FinanceiroNav } from "@/components/admin/financeiro/financeiro-nav";
import { PeriodSelector } from "@/components/admin/financeiro/period-selector";
import { MetricsCards } from "@/components/admin/financeiro/metrics-cards";
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Wallet className="h-6 w-6 text-brand" />
            Financeiro
          </h1>
          <p className="text-sm text-muted-foreground">
            Controle de estoque, vendas, perdas e lucro — consolidado em R$.
          </p>
        </div>
        <div className="flex items-center gap-2">
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
        </div>
      </div>

      <FinanceiroNav />
      <PeriodSelector
        preset={preset}
        inicio={searchParams.inicio}
        fim={searchParams.fim}
      />
      <MetricsCards m={metricas} />
      <FinanceiroCharts serie={serie} m={metricas} />
    </div>
  );
}
