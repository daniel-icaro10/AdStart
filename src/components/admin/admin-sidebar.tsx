"use client";

import Link from "next/link";
import Image from "next/image";

import { cn } from "@/lib/utils";
import { AdminNavList } from "./admin-nav-list";
import { useAdminSidebar } from "./admin-sidebar-context";

/**
 * Sidebar do admin no padrão TailAdmin: estática no desktop (participa do
 * layout, não sobrepõe conteúdo), largura 290px expandida / 90px colapsada
 * (modo ícone). Oculta no mobile — lá quem cobre é o AdminMobileNav (overlay).
 */
export function AdminSidebar() {
  const { collapsed } = useAdminSidebar();

  return (
    <aside
      className={cn(
        "hidden shrink-0 flex-col border-r border-border bg-card px-5 transition-[width] duration-200 lg:flex",
        collapsed ? "w-[90px]" : "w-[290px]",
      )}
    >
      <div className={cn("flex h-20 items-center", collapsed && "justify-center")}>
        <Link
          href="/admin"
          aria-label="adStart"
          className="inline-flex items-center rounded-lg bg-white/90 shadow-sm ring-1 ring-black/5"
        >
          {collapsed ? (
            <Image
              src="/icon.png"
              alt="adStart"
              width={32}
              height={32}
              className="h-8 w-8 p-1"
            />
          ) : (
            <Image
              src="/logo.png"
              alt="adStart"
              width={1104}
              height={366}
              priority
              className="h-7 w-auto px-2.5 py-1.5"
            />
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <AdminNavList iconOnly={collapsed} />
      </nav>

      {!collapsed && (
        <div className="border-t border-border py-4 text-xs text-muted-foreground">
          Painel administrativo
        </div>
      )}
    </aside>
  );
}
