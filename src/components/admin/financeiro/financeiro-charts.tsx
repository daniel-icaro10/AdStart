"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { formatCurrency } from "@/lib/format";
import type { MetricasFinanceiras, PontoMensal } from "@/lib/financeiro";
import { TIPO_LABELS } from "./assets-filters";

const COLORS = ["#2563eb", "#10b981", "#f59e0b", "#a855f7", "#ec4899", "#64748b"];
const AXIS = "#9199a8";
const GRID = "rgba(255,255,255,0.06)";

const compact = (v: number) =>
  new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(v);
const brl = (v: number) => formatCurrency(v, "BRL");

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <div className="h-64">{children}</div>
    </div>
  );
}

const tooltipStyle = {
  backgroundColor: "#141517",
  border: "1px solid #252830",
  borderRadius: 8,
  fontSize: 12,
};

export function FinanceiroCharts({
  serie,
  m,
}: {
  serie: PontoMensal[];
  m: MetricasFinanceiras;
}) {
  const lucroPorTipo = Object.entries(m.lucroPorTipo).map(([tipo, v]) => ({
    tipo: TIPO_LABELS[tipo] ?? tipo,
    lucro: Math.round(v.lucroRealizado),
  }));
  const estoquePorTipo = Object.entries(m.estoquePorTipo).map(
    ([tipo, v]) => ({
      tipo: TIPO_LABELS[tipo] ?? tipo,
      value: Math.round(v.custo),
      quantidade: v.quantidade,
    }),
  );
  const estoqueTotal = estoquePorTipo.reduce((s, e) => s + e.value, 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Evolução mensal */}
      <ChartCard title="Evolução mensal (investimento × receita × lucro)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={serie} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
            <XAxis dataKey="mes" tick={{ fill: AXIS, fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={compact} tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => brl(v)} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="investimento" name="Investimento" fill="#64748b" radius={[3, 3, 0, 0]} />
            <Bar dataKey="receita" name="Receita" fill="#2563eb" radius={[3, 3, 0, 0]} />
            <Bar dataKey="lucro" name="Lucro" fill="#10b981" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Lucro por tipo */}
      <ChartCard title="Lucro realizado por tipo (período)">
        {lucroPorTipo.length === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={lucroPorTipo} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
              <XAxis type="number" tickFormatter={compact} tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="tipo" tick={{ fill: AXIS, fontSize: 12 }} tickLine={false} axisLine={false} width={90} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => brl(v)} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="lucro" name="Lucro" fill="#10b981" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Composição do estoque por tipo */}
      <ChartCard title="Composição do estoque por tipo (custo)">
        {estoqueTotal === 0 ? (
          <EmptyChart />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={estoquePorTipo}
                dataKey="value"
                nameKey="tipo"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
              >
                {estoquePorTipo.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => brl(v)} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      Sem dados no período.
    </div>
  );
}
