import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface AdminTabItem {
  key: string;
  label: string;
  icon?: LucideIcon;
  count?: number;
  active: boolean;
  /** Aba navega por rota (Link). Omita e use onClick para aba de estado local. */
  href?: string;
  onClick?: () => void;
}

/**
 * Barra de abas em pílula, no padrão do design system do admin (mesma cor de
 * estado ativo da sidebar: bg-primary/10 + text-primary). Usada tanto para
 * abas de estado local (hubs) quanto de rota (Link).
 */
export function AdminTabBar({ items }: { items: AdminTabItem[] }) {
  return (
    <div className="inline-flex max-w-full overflow-x-auto rounded-2xl border border-border bg-card p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item) => {
        const className = cn(
          "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4",
          item.active
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-foreground",
        );
        const content = (
          <>
            {item.icon && <item.icon className="h-4 w-4" />}
            {item.label}
            {item.count !== undefined && (
              <span className="rounded bg-background/60 px-1.5 text-xs tabular-nums">
                {item.count}
              </span>
            )}
          </>
        );

        return item.href ? (
          <Link key={item.key} href={item.href} className={className}>
            {content}
          </Link>
        ) : (
          <button
            key={item.key}
            type="button"
            onClick={item.onClick}
            aria-pressed={item.active}
            className={className}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
