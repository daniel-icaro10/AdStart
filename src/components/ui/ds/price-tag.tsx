import * as React from "react";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";

/**
 * PriceTag — bloco de preço do card de BM (DESIGN.md §5.1).
 *
 *   R$ 2.290  ~R$ 3.490~  [-34%]
 *
 * Preço atual em --ds-money, 22px mono (papel "Dado grande"); preço
 * original riscado em --ds-text-faint; percentual calculado a partir dos
 * dois valores (nunca digitado à mão — evita o problema de descontos
 * inconsistentes citado no §4) num selo âmbar (--ds-money em opacidade,
 * já que o token é RGB puro e aceita o modificador de alfa do Tailwind —
 * não precisa de um --ds-money-bg dedicado).
 *
 * Reaproveita a única formatCurrency do projeto (§7: "uma única função").
 * Só tokens de globals.css (--ds-*). Ainda não usado em nenhuma página.
 */
export interface PriceTagProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  /** Preço de venda atual, em BRL. */
  price: number;
  /** Preço "de" — se maior que `price`, mostra riscado + selo de desconto. */
  originalPrice?: number | null;
}

function DsPriceTag({
  price,
  originalPrice,
  className,
  ...props
}: PriceTagProps) {
  const temDesconto =
    originalPrice != null && originalPrice > 0 && originalPrice > price;
  const pct = temDesconto
    ? Math.round((1 - price / originalPrice!) * 100)
    : 0;

  return (
    <div
      className={cn("flex flex-wrap items-baseline gap-2", className)}
      {...props}
    >
      <span className="font-ds-mono text-ds-data-lg tabular-nums text-ds-money">
        {formatCurrency(price, "BRL")}
      </span>

      {temDesconto && (
        <span className="font-ds-mono text-ds-data tabular-nums text-ds-text-faint line-through">
          {formatCurrency(originalPrice!, "BRL")}
        </span>
      )}

      {temDesconto && pct > 0 && (
        <span className="inline-flex h-[22px] items-center rounded-ds-sm bg-ds-money/15 px-2 font-ds-sans text-[11px] font-semibold uppercase leading-none tracking-[0.06em] text-ds-money">
          -{pct}%
        </span>
      )}
    </div>
  );
}

export { DsPriceTag as PriceTag };
