"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { adminNav } from "./nav-config";

interface AdminNavListProps {
  /** Modo ícone (sem rótulo) — usado pela sidebar desktop colapsada. */
  iconOnly?: boolean;
  onNavigate?: () => void;
}

/**
 * Lista de navegação do admin no padrão TailAdmin (.menu-item / .menu-item-active).
 * Compartilhada entre a sidebar desktop e o drawer mobile.
 */
export function AdminNavList({ iconOnly, onNavigate }: AdminNavListProps) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-1">
      {adminNav.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              title={iconOnly ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                iconOnly && "justify-center",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!iconOnly && <span>{item.label}</span>}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
