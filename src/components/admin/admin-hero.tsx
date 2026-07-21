import Link from "next/link";
import { ArrowUpRight, ArrowDownRight, ArrowRight, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type HeroTone = "neutral" | "positive" | "negative";

export interface AdminHeroStat {
  label: string;
  value: string;
  sub?: string;
  tone: HeroTone;
}

export interface AdminHeroAction {
  label: string;
  href: string;
  icon: LucideIcon;
}

const TONE_ICON: Record<HeroTone, LucideIcon> = {
  positive: ArrowUpRight,
  negative: ArrowDownRight,
  neutral: ArrowRight,
};

const TONE_RING: Record<HeroTone, string> = {
  positive: "stroke-positive",
  negative: "stroke-negative",
  neutral: "stroke-primary",
};

const TONE_TEXT: Record<HeroTone, string> = {
  positive: "text-positive",
  negative: "text-negative",
  neutral: "text-primary",
};

function StatRing({ tone }: { tone: HeroTone }) {
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

interface AdminHeroProps {
  title: string;
  description: string;
  stats: AdminHeroStat[];
  action?: AdminHeroAction;
}

/**
 * Banner de topo de página no padrão TailAdmin: faixa em gradiente + cards de
 * KPI flutuando por cima (meio sobre o banner, meio sobre o fundo). Usado no
 * Dashboard, Ativos e Financeiro — cada um passa seus próprios stats/ação.
 */
export function AdminHero({ title, description, stats, action }: AdminHeroProps) {
  return (
    <div>
      <div className="admin-hero-banner relative overflow-hidden rounded-2xl px-6 pb-16 pt-7 sm:px-8 sm:pt-8">
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{title}</h1>
            <p className="mt-1 max-w-md text-sm text-white/80">{description}</p>
          </div>
          {action && (
            <Link
              href={action.href}
              className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/25"
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Link>
          )}
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
              {s.sub && <div className="truncate text-xs text-muted-foreground">{s.sub}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
