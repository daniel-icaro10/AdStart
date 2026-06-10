"use client";

import Link from "next/link";
import { LineChart as LineChartIcon, Boxes } from "lucide-react";
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
import type { PontoMensal } from "@/lib/financeiro";
import type { EstoqueCategoria } from "@/lib/dashboard";

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
  const serieTemDado = serie.some((s) => s.receita !== 0 || s.lucro !== 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard title="Receita × lucro (6 meses)">
        {!serieTemDado ? (
          <EmptyState
            icon={LineChartIcon}
            title="Registre vendas para ver a evolução aqui."
            action={
              <Link
                href="/admin/financeiro/ativos"
                className="text-sm font-medium text-brand hover:underline"
              >
                Ir para Financeiro → Ativos
              </Link>
            }
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={serie} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
              <XAxis dataKey="mes" tick={{ fill: chart.axis, fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tickFormatter={brlCompact} tick={{ fill: chart.axis, fontSize: 11 }} tickLine={false} axisLine={false} width={56} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => brlFull(v)} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="receita" name="Receita" fill={chart.accent} radius={[3, 3, 0, 0]} />
              <Bar dataKey="lucro" name="Lucro" fill={chart.positive} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Estoque por categoria (BMs)">
        {estoquePorCategoria.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title="Sem ativos em estoque no momento."
            action={
              <Link
                href="/admin/ativos"
                className="text-sm font-medium text-brand hover:underline"
              >
                Cadastrar ativo
              </Link>
            }
          />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={estoquePorCategoria} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: chart.axis, fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="label" tick={{ fill: chart.axis, fontSize: 12 }} tickLine={false} axisLine={false} width={90} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="qtd" name="Em estoque" fill={chart.accent} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>
    </div>
  );
}
