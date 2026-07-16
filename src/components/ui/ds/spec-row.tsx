import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * SpecRow — linha pontilhada rótulo→valor da "ficha técnica" (DESIGN.md §5.1).
 *
 *   Gasto total ················· US$ 2.623,95
 *   Limite Meta ···················· US$ 900
 *
 * Técnica do "líder de pontos": rótulo fixo à esquerda, um elemento vazio
 * flex-1 com border-bottom pontilhada preenche o espaço entre rótulo e
 * valor (equivalente ao pseudo-elemento sugerido no doc, só que como nó
 * real — mais simples de compor em React), valor fixo à direita.
 *
 * Rótulo no papel tipográfico "Rótulo" (uppercase, --ds-text-faint);
 * valor em Geist Mono tabular-nums (papel "Dado"), alinhado à direita.
 *
 * Só tokens de globals.css (--ds-*). Ainda não usado em nenhuma página.
 */
export interface SpecRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode;
  value: React.ReactNode;
}

function DsSpecRow({ label, value, className, ...props }: SpecRowProps) {
  return (
    <div
      className={cn("flex items-baseline gap-2", className)}
      {...props}
    >
      <span className="shrink-0 font-ds-sans text-ds-label uppercase text-ds-text-faint">
        {label}
      </span>
      <span
        aria-hidden
        className="mx-1 h-0 flex-1 translate-y-[-3px] self-end border-b border-dotted border-ds-border"
      />
      <span className="shrink-0 font-ds-mono text-ds-data tabular-nums text-ds-text">
        {value}
      </span>
    </div>
  );
}

export { DsSpecRow as SpecRow };
