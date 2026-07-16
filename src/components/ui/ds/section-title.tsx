import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * SectionTitle — títulos em Archivo (DESIGN.md §3, papel "Display").
 *
 * Cobre os dois papéis Display da escala tipográfica:
 *   - "xl" → Display XL 40/44 Archivo 800 (hero da landing)
 *   - "l"  → Display L 28/32 Archivo 700 (títulos de seção) — default
 *
 * `description` usa o papel "Corpo" (Geist Sans, --ds-text-muted);
 * `action` é o slot opcional à direita (ex.: botão/link da seção).
 *
 * Só tokens de globals.css (--ds-*). Ainda não usado em nenhuma página.
 */
export interface SectionTitleProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  as?: "h1" | "h2" | "h3";
  size?: "xl" | "l";
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}

function DsSectionTitle({
  as = "h2",
  size = "l",
  description,
  action,
  children,
  className,
  ...props
}: SectionTitleProps) {
  const Heading = as;

  return (
    <div
      className={cn(
        "flex flex-wrap items-end justify-between gap-3",
        className,
      )}
      {...props}
    >
      <div className="space-y-1">
        <Heading
          className={cn(
            "font-ds-display text-ds-text",
            size === "xl" ? "text-ds-display-xl" : "text-ds-display-l",
          )}
        >
          {children}
        </Heading>
        {description && (
          <p className="font-ds-sans text-ds-body text-ds-text-muted">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export { DsSectionTitle as SectionTitle };
