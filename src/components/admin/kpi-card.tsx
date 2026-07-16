import { Badge } from "@/components/ui/ds/badge";
import type { KpiDelta } from "@/lib/financeiro";

/**
 * KPI card (DESIGN.md §6.2): rótulo uppercase, valor em Geist Mono grande,
 * variação vs. período anterior em badge com seta. Sem ícone decorativo —
 * o número é o protagonista.
 */
export function KpiCard({
  label,
  value,
  hint,
  delta,
}: {
  label: string;
  value: string;
  hint?: string;
  delta?: KpiDelta | null;
}) {
  return (
    <div className="rounded-ds-lg border border-ds-border bg-ds-surface p-4">
      <span className="font-ds-sans text-ds-label uppercase text-ds-text-faint">
        {label}
      </span>
      <div className="mt-2 font-ds-mono text-ds-data-lg tabular-nums text-ds-text">
        {value}
      </div>
      {(hint || delta) && (
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {delta && (
            <Badge variant={delta.bom ? "sem-dividas" : "divida"}>
              {delta.arrowUp ? "↑" : "↓"} {delta.texto}
            </Badge>
          )}
          {hint && (
            <span className="font-ds-sans text-ds-body text-ds-text-muted">
              {hint}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
