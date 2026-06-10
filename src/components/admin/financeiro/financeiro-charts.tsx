"use client";

import { BarChart3, Boxes, Layers } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

import { EmptyState } from "@/components/ui/empty-state";
import { chart, tooltipStyle, brlCompact, brlFull } from "@/lib/chart-theme";
import type { MetricasFinanceiras, PontoMensal } from "@/lib/financeiro";
import { TIPO_LABELS } from "./assets-filters";

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
}

export function FinanceiroCharts({
  serie,
  m,
}: {
  serie: PontoMensal[];
  m: MetricasFinanceiras;
}) {
  const serieTemDado = serie.some(
    (s) => s.investimento !== 0 || s.receita !== 0 || s.lucro !== 0,
  );
  const lucroPorTipo = Object.entries(m.lucroPorTipo).map(([tipo, v]) => ({
    tipo: TIPO_LABELS[tipo] ?? tipo,
    lucro: Math.round(v.lucroRealizado),
  }));
  const estoquePorTipo = Object.entries(m.estoquePorTipo).map(([tipo, v]) => ({
    tipo: TIPO_LABELS[tipo] ?? tipo,
    custo: Math.round(v.custo),
  }));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Evolução mensal */}
      <ChartCard title="Investimento × receita × lucro (6 meses)">
        {!serieTemDado ? (
          <EmptyState icon={BarChart3} title="Sem movimentação financeira nos últimos meses." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={serie} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
              <XAxis dataKey="mes" tick={{ fill: chart.axis, fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={brlCompact} tick={{ fill: chart.axis, fontSize: 11 }} tickLine={false} axisLine={false} width={56} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => brlFull(v)} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="investimento" name="Investimento" fill={chart.neutral} radius={[3, 3, 0, 0]} />
              <Bar dataKey="receita" name="Receita" fill={chart.accent} radius={[3, 3, 0, 0]} />
              <Bar dataKey="lucro" name="Lucro" fill={chart.positive} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Lucro por tipo */}
      <ChartCard title="Lucro realizado por tipo (período)">
        {lucroPorTipo.length === 0 ? (
          <EmptyState icon={Layers} title="Nenhuma venda no período para comparar por tipo." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={lucroPorTipo} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} horizontal={false} />
              <XAxis type="number" tickFormatter={brlCompact} tick={{ fill: chart.axis, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="tipo" tick={{ fill: chart.axis, fontSize: 12 }} tickLine={false} axisLine={false} width={90} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => brlFull(v)} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="lucro" name="Lucro" fill={chart.positive} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Composição do estoque por tipo */}
      <ChartCard title="Composição do estoque por tipo (custo)">
        {estoquePorTipo.length === 0 ? (
          <EmptyState icon={Boxes} title="Sem ativos em estoque com custo registrado." />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={estoquePorTipo} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} horizontal={false} />
              <XAxis type="number" tickFormatter={brlCompact} tick={{ fill: chart.axis, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="tipo" tick={{ fill: chart.axis, fontSize: 12 }} tickLine={false} axisLine={false} width={90} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => brlFull(v)} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="custo" name="Custo" fill={chart.accent} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
