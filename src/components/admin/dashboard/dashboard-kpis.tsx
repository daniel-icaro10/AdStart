import { KpiCard } from "@/components/admin/kpi-card";
import { formatCurrency, breakdownMoeda } from "@/lib/format";
import { kpiDelta, type MetricasFinanceiras } from "@/lib/financeiro";

const brl = (v: number) => formatCurrency(v, "BRL");
const pct = (v: number) => `${v.toFixed(1).replace(".", ",")}%`;

/** Faixa de KPIs do dashboard — anatomia idêntica nos quatro cards. */
export function DashboardKpis({
  m,
  anterior,
}: {
  m: MetricasFinanceiras;
  anterior?: MetricasFinanceiras | null;
}) {
  const quebra = breakdownMoeda(m.estoqueCustoUSD, m.estoqueCustoBRL);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Estoque é uma foto atual (não varia por período) — sem delta. */}
      <KpiCard
        label="Estoque (custo)"
        value={brl(m.valorEstoqueCusto)}
        hint={`${quebra ? `${quebra} · ` : ""}${m.totalEmEstoque} disp. · ${m.totalReservado} reserv.`}
      />
      <KpiCard
        label="Lucro do mês"
        value={brl(m.lucroRealizado)}
        hint={`ROI ${pct(m.roiRealizado)}`}
        delta={anterior && kpiDelta(m.lucroRealizado, anterior.lucroRealizado)}
      />
      <KpiCard
        label="Vendas do mês"
        value={String(m.totalVendidoPeriodo)}
        hint={`Receita ${brl(m.receitaRealizada)}`}
        delta={
          anterior &&
          kpiDelta(m.totalVendidoPeriodo, anterior.totalVendidoPeriodo)
        }
      />
      <KpiCard
        label="Perdas do mês"
        value={brl(m.perdas)}
        hint={`${m.totalPerdidoPeriodo} perdido(s) · taxa ${pct(m.taxaPerda)}`}
        delta={anterior && kpiDelta(m.perdas, anterior.perdas, false)}
      />
    </div>
  );
}
