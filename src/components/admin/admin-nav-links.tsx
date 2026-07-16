"use client";

import Link from "next/link";

import { cn } from "@/lib/utils";
import { adminNavGroups } from "./nav-config";

/**
 * Grupos de navegação do admin (DESIGN.md §6.1): rótulo uppercase por grupo,
 * item ativo com fundo --ds-accent-soft e texto --ds-accent. Compartilhado
 * entre a sidebar desktop e o drawer mobile — uma única fonte de verdade.
 */
export function AdminNavLinks({ pathname }: { pathname: string }) {
  return (
    <nav className="flex-1 space-y-5 p-3">
      {adminNavGroups.map((group) => (
        <div key={group.label}>
          <div className="px-3 pb-1.5 font-ds-sans text-ds-label uppercase text-ds-text-faint">
            {group.label}
          </div>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-ds-sm px-3 py-2 font-ds-sans text-sm font-medium transition-colors",
                    active
                      ? "bg-ds-accent-soft text-ds-accent"
                      : "text-ds-text-muted hover:bg-ds-surface-2 hover:text-ds-text",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
