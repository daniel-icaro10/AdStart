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
} from "recharts";

import { formatCurrency } from "@/lib/format";
import type { PontoMensal } from "@/lib/financeiro";
import type { EstoqueCategoria } from "@/lib/dashboard";

const AXIS = "#9199a8";
const GRID = "rgba(255,255,255,0.06)";
const compact = (v: number) =>
  new Intl.NumberFormat("pt-BR", { notation: "compact" }).format(v);
const tooltipStyle = {
  backgroundColor: "#141517",
  border: "1px solid #252830",
  borderRadius: 8,
  fontSize: 12,
};

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold">{title}</h3>
      <div className="h-60">{children}</div>
    </div>
  );
}

export function DashboardCharts({
  serie,
  estoquePorCategoria,
}: {
  serie: PontoMensal[];
  estoquePorCategoria: EstoqueCategoria[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard title="Receita × lucro (6 meses)">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={serie} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
            <XAxis dataKey="mes" tick={{ fill: AXIS, fontSize: 12 }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={compact} tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => formatCurrency(v, "BRL")} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="receita" name="Receita" fill="#2563eb" radius={[3, 3, 0, 0]} />
            <Bar dataKey="lucro" name="Lucro" fill="#10b981" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Estoque por categoria (BMs)">
        {estoquePorCategoria.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Sem ativos em estoque.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={estoquePorCategoria} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: AXIS, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="label" tick={{ fill: AXIS, fontSize: 12 }} tickLine={false} axisLine={false} width={90} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="qtd" name="Em estoque" fill="#a855f7" radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
