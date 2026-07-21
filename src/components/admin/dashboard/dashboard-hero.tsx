import Link from "next/link";
import { Bell, ArrowUpRight, ArrowDownRight, ArrowRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCurrency, breakdownMoeda } from "@/lib/format";
import type { MetricasFinanceiras } from "@/lib/financeiro";

const brl = (v: number) => formatCurrency(v, "BRL");
const pct = (v: number) => `${v.toFixed(1).replace(".", ",")}%`;

type Tone = "neutral" | "positive" | "negative";

interface HeroStat {
  label: string;
  value: string;
  sub: string;
  tone: Tone;
}

function sign(v: number): Tone {
  if (v > 0) return "positive";
  if (v < 0) return "negative";
  return "neutral";
}

const TONE_ICON: Record<Tone, LucideIcon> = {
  positive: ArrowUpRight,
  negative: ArrowDownRight,
  neutral: ArrowRight,
};

const TONE_RING: Record<Tone, string> = {
  positive: "stroke-positive",
  negative: "stroke-negative",
  neutral: "stroke-primary",
};

const TONE_TEXT: Record<Tone, string> = {
  positive: "text-positive",
  negative: "text-negative",
  neutral: "text-primary",
};

function StatRing({ tone }: { tone: Tone }) {
  const Icon = TONE_ICON[tone];
  const r = 24;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
      <svg viewBox="0 0 56 56" className="h-14 w-14 -rotate-90">
        <circle cx="28" cy="28" r={r} fill="none" strokeWidth="4" className="stroke-border" />
        <circle
          cx="28"
          cy="28"
          r={r}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * 0.32}
          className={TONE_RING[tone]}
        />
      </svg>
      <Icon className={cn("absolute h-5 w-5", TONE_TEXT[tone])} />
    </div>
  );
}

/**
 * Banner de boas-vindas do dashboard (padrão TailAdmin: faixa em gradiente +
 * cards de KPI flutuando por cima, meio sobre o banner, meio sobre o fundo).
 */
export function DashboardHero({ m, pendingAlertas }: { m: MetricasFinanceiras; pendingAlertas: number }) {
  const quebra = breakdownMoeda(m.estoqueCustoUSD, m.estoqueCustoBRL);
  const stats: HeroStat[] = [
    {
      label: "Estoque (custo)",
      value: brl(m.valorEstoqueCusto),
      sub: `${quebra ? `${quebra} · ` : ""}${m.totalEmEstoque} disp. · ${m.totalReservado} reserv.`,
      tone: "neutral",
    },
    {
      label: "Lucro do mês",
      value: brl(m.lucroRealizado),
      sub: `ROI ${pct(m.roiRealizado)}`,
      tone: sign(m.lucroRealizado),
    },
    {
      label: "Vendas do mês",
      value: String(m.totalVendidoPeriodo),
      sub: `Receita ${brl(m.receitaRealizada)}`,
      tone: "neutral",
    },
    {
      label: "Perdas do mês",
      value: brl(m.perdas),
      sub: `${m.totalPerdidoPeriodo} perdido(s) · taxa ${pct(m.taxaPerda)}`,
      tone: m.perdas > 0 ? "negative" : "neutral",
    },
  ];

  return (
    <div>
      <div className="admin-hero-banner relative overflow-hidden rounded-2xl px-6 pb-16 pt-7 sm:px-8 sm:pt-8">
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">Olá!</h1>
            <p className="mt-1 max-w-md text-sm text-white/80">
              Visão geral da operação — estoque, resultado do período e sinais
              de risco.
            </p>
          </div>
          <Link
            href="#alertas"
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/25"
          >
            <Bell className="h-4 w-4" />
            {pendingAlertas > 0 ? `${pendingAlertas} alerta(s)` : "Ver alertas"}
          </Link>
        </div>
      </div>

      <div className="relative -mt-12 grid grid-cols-1 gap-4 sm:-mt-14 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-theme-sm"
          >
            <StatRing tone={s.tone} />
            <div className="min-w-0">
              <div className="truncate text-sm text-muted-foreground">{s.label}</div>
              <div className="truncate text-xl font-bold tabular-nums text-foreground-strong">
                {s.value}
              </div>
              <div className="truncate text-xs text-muted-foreground">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
