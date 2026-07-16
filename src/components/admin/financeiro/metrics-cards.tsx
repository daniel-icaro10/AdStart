import { AlertTriangle } from "lucide-react";

import { KpiCard } from "@/components/admin/kpi-card";
import { formatCurrency } from "@/lib/format";
import { kpiDelta, type MetricasFinanceiras } from "@/lib/financeiro";

const brl = (v: number) => formatCurrency(v, "BRL");
const pct = (v: number) => `${v.toFixed(1).replace(".", ",")}%`;

/** Cards de resumo do dashboard financeiro (consolidado em BRL). */
export function MetricsCards({
  m,
  anterior,
}: {
  m: MetricasFinanceiras;
  anterior?: MetricasFinanceiras | null;
}) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          label="Investimento (período)"
          value={brl(m.investimentoTotal)}
          hint="Custo dos ativos que entraram + custos operacionais"
          delta={
            anterior &&
            kpiDelta(m.investimentoTotal, anterior.investimentoTotal, false)
          }
        />
        <KpiCard
          label="Receita realizada"
          value={brl(m.receitaRealizada)}
          hint={`${m.totalVendidoPeriodo} venda(s) no período`}
          delta={
            anterior &&
            kpiDelta(m.receitaRealizada, anterior.receitaRealizada)
          }
        />
        <KpiCard
          label="Lucro realizado"
          value={brl(m.lucroRealizado)}
          hint="Vendas com custo − custos operacionais"
          delta={anterior && kpiDelta(m.lucroRealizado, anterior.lucroRealizado)}
        />
        <KpiCard
          label="ROI realizado"
          value={pct(m.roiRealizado)}
          delta={anterior && kpiDelta(m.roiRealizado, anterior.roiRealizado)}
        />
        <KpiCard
          label="Perdas (período)"
          value={brl(m.perdas)}
          hint={`${m.totalPerdidoPeriodo} ativo(s) perdido(s)`}
          delta={anterior && kpiDelta(m.perdas, anterior.perdas, false)}
        />
        <KpiCard
          label="Taxa de perda"
          value={pct(m.taxaPerda)}
          hint="Perdidos ÷ (vendidos + perdidos)"
          delta={anterior && kpiDelta(m.taxaPerda, anterior.taxaPerda, false)}
        />
        {/* Estoque/potencial/lucro previsto são fotos atuais — sem delta. */}
        <KpiCard
          label="Estoque (custo)"
          value={brl(m.valorEstoqueCusto)}
          hint={`${m.totalEmEstoque} disponível · ${m.totalReservado} reservado`}
        />
        <KpiCard
          label="Estoque (potencial)"
          value={brl(m.valorEstoquePotencial)}
          hint="Só ativos precificados (custo + preço previsto)"
        />
        <KpiCard
          label="Lucro previsto"
          value={brl(m.lucroPrevisto)}
          hint="Potencial − custo, sobre o mesmo conjunto precificado"
        />
      </div>

      {m.vendasSemCusto > 0 && (
        <p className="mt-3 flex items-center gap-1.5 font-ds-sans text-ds-body text-ds-money">
          <AlertTriangle className="h-3.5 w-3.5" />
          {m.vendasSemCusto} venda(s) sem custo de aquisição registrado — contam
          na receita, mas ficam fora do lucro e do ROI.
        </p>
      )}

      {m.estoqueSemPreco > 0 && (
        <p className="mt-2 flex items-center gap-1.5 font-ds-sans text-ds-body text-ds-money">
          <AlertTriangle className="h-3.5 w-3.5" />
          {m.estoqueSemPreco} ativo(s) em estoque sem custo e/ou preço previsto —
          fora do potencial e do lucro previsto.
        </p>
      )}
    </div>
  );
}
