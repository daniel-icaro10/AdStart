"use client";

import { usePathname } from "next/navigation";

import { AdminTabBar } from "@/components/admin/admin-tab-bar";

// "Ativos" agora vive na sub-aba Financeiro de /admin/ativos (tudo num lugar só).
const ITEMS = [
  { label: "Resumo", href: "/admin/financeiro" },
  { label: "Custos", href: "/admin/financeiro/custos" },
];

/** Abas internas do módulo financeiro. */
export function FinanceiroNav() {
  const pathname = usePathname();
  return (
    <AdminTabBar
      items={ITEMS.map((item) => ({
        key: item.href,
        label: item.label,
        href: item.href,
        active:
          item.href === "/admin/financeiro"
            ? pathname === "/admin/financeiro"
            : pathname.startsWith(item.href),
      }))}
    />
  );
}
