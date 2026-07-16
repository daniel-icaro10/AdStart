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
        <h2 className="font-ds-sans text-ds-label uppercase text-ds-text-faint">
          Faturamento por tipo (período)
        </h2>
        <span className="font-ds-sans text-ds-body text-ds-text-muted">
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
              className="rounded-ds-lg border border-ds-border bg-ds-surface p-4"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 font-ds-sans text-ds-body font-medium text-ds-text">
                  <Icon className="h-4 w-4 text-ds-accent" />
                  {label}
                </span>
                <span className="font-ds-sans text-xs text-ds-text-muted">
                  {d.quantidade} venda(s)
                </span>
              </div>

              <div className="mt-2 font-ds-mono text-ds-data-lg tabular-nums text-ds-text">
                {brl(d.receita)}
              </div>

              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-ds-text-muted">
                  {pct.toFixed(0)}% do total
                </span>
                <span
                  className={cn(
                    "font-ds-mono tabular-nums",
                    d.lucro > 0 && "text-ds-success",
                    d.lucro < 0 && "text-ds-danger",
                    d.lucro === 0 && "text-ds-text-muted",
                  )}
                >
                  lucro {brl(d.lucro)}
                </span>
              </div>

              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ds-surface-2">
                <div
                  className="h-full rounded-full bg-ds-accent transition-all"
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
