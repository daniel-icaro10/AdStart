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
 * Barra de abas em pílula, no mesmo padrão visual do seletor da landing
 * (catalog-tabs): container rounded-full com blur, pílula ativa em
 * bg-primary com glow. Usada tanto para abas de estado local (hubs) quanto
 * de rota (Link).
 */
export function AdminTabBar({ items }: { items: AdminTabItem[] }) {
  return (
    <div className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-border bg-card/80 p-1 shadow-sm backdrop-blur [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {items.map((item) => {
        const className = cn(
          "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors",
          item.active
            ? "bg-primary text-primary-foreground shadow-[0_6px_24px_-6px_rgb(var(--brand)/0.8)]"
            : "text-muted-foreground hover:text-foreground",
        );
        const content = (
          <>
            {item.icon && <item.icon className="h-4 w-4" />}
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  item.active ? "bg-white/20" : "bg-background/60",
                )}
              >
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
