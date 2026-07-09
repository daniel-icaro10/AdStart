"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

// "Ativos" agora vive na sub-aba Financeiro de /admin/ativos (tudo num lugar só).
const ITEMS = [
  { label: "Resumo", href: "/admin/financeiro" },
  { label: "Custos", href: "/admin/financeiro/custos" },
];

/** Abas internas do módulo financeiro. */
export function FinanceiroNav() {
  const pathname = usePathname();
  return (
    <nav className="inline-flex rounded-xl border border-border bg-card p-1 shadow-sm">
      {ITEMS.map((item) => {
        const active =
          item.href === "/admin/financeiro"
            ? pathname === "/admin/financeiro"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
