import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Badge — DESIGN.md §5.2.
 * Altura 22px, --ds-radius-sm, texto 11px uppercase Geist 600.
 *
 * Variantes: tier/moeda/vendida usam o mesmo tratamento neutro (borda,
 * sem preenchimento); "nova" usa accent-soft/accent; "sem-dividas" usa
 * success-bg/success; "divida" usa danger-bg/danger.
 *
 * "vendida" descreve também o comportamento do CARD inteiro (opacidade
 * 0.55 + badge sobreposto) — isso é responsabilidade do componente de
 * card (fora deste escopo); aqui só o rótulo neutro é resolvido.
 *
 * Só tokens de globals.css (--ds-*). Ainda não usado em nenhuma página.
 */
const badgeVariants = cva(
  "inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-ds-sm px-2 font-ds-sans text-[11px] font-semibold uppercase leading-none tracking-[0.06em]",
  {
    variants: {
      variant: {
        tier: "border border-ds-border bg-transparent text-ds-text-muted",
        moeda: "border border-ds-border bg-transparent text-ds-text-muted",
        vendida: "border border-ds-border bg-transparent text-ds-text-muted",
        nova: "border border-transparent bg-ds-accent-soft text-ds-accent",
        "sem-dividas":
          "border border-transparent bg-ds-success-bg text-ds-success",
        divida: "border border-transparent bg-ds-danger-bg text-ds-danger",
      },
    },
    defaultVariants: {
      variant: "tier",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function DsBadge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { DsBadge as Badge, badgeVariants };
