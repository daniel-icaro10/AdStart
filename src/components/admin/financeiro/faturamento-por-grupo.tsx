import { Boxes, FileText, AtSign, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import type { MetricasFinanceiras, GrupoAtivo } from "@/lib/financeiro";

const GRUPOS: { key: GrupoAtivo; label: string; Icon: LucideIcon }[] = [
  { key: "BM", label: "BMs", Icon: Boxes },
  { key: "PAGINA", label: "Páginas", Icon: FileText },
  { key: "PERFIL", label: "Perfis", Icon: AtSign },
];

const brl = (v: number) => formatCurrency(v, "BRL");

/**
 * Faturamento do período separado por grupo (BMs / Páginas / Perfis):
 * receita, lucro, nº de vendas e participação no total.
 */
export function FaturamentoPorGrupo({ m }: { m: MetricasFinanceiras }) {
  const g = m.faturamentoPorGrupo;
  const totalReceita = GRUPOS.reduce((s, x) => s + g[x.key].receita, 0);

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-faint">
          Faturamento por tipo (período)
        </h2>
        <span className="text-sm text-muted-foreground">
          Total {brl(totalReceita)}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {GRUPOS.map(({ key, label, Icon }) => {
          const d = g[key];
          const pct = totalReceita > 0 ? (d.receita / totalReceita) * 100 : 0;
          return (
            <div
              key={key}
              className="rounded-2xl border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm font-medium">
                  <Icon className="h-4 w-4 text-brand" />
                  {label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {d.quantidade} venda(s)
                </span>
              </div>

              <div className="mt-2 text-2xl font-bold tabular-nums">
                {brl(d.receita)}
              </div>

              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  {pct.toFixed(0)}% do total
                </span>
                <span
                  className={cn(
                    "tabular-nums",
                    d.lucro > 0 && "text-positive",
                    d.lucro < 0 && "text-negative",
                    d.lucro === 0 && "text-muted-foreground",
                  )}
                >
                  lucro {brl(d.lucro)}
                </span>
              </div>

              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-accent">
                <div
                  className="h-full rounded-full bg-brand transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
