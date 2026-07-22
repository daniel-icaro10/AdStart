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
        "relative hidden shrink-0 flex-col overflow-hidden border-r border-border bg-card px-5 transition-[width] duration-200 lg:flex",
        collapsed ? "w-[90px]" : "w-[290px]",
      )}
    >
      {/* fundo: mesma grade sutil + glows do hero da landing */}
      <div aria-hidden className="ad-sidebar-grid pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="ad-float pointer-events-none absolute -right-16 -top-10 h-56 w-56 rounded-full bg-brand/20 blur-3xl"
      />
      <div
        aria-hidden
        className="ad-float pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-brand/10 blur-3xl [animation-delay:-3.5s]"
      />

      <div className="relative z-10 flex h-32 items-center justify-center">
        {collapsed ? (
          <Link
            href="/admin"
            aria-label="Startfy"
            className="inline-flex items-center rounded-lg bg-white/90 shadow-sm ring-1 ring-black/5"
          >
            <Image
              src="/icon.png"
              alt="Startfy"
              width={32}
              height={32}
              className="h-8 w-8 p-1"
            />
          </Link>
        ) : (
          <Link href="/admin" aria-label="Startfy">
            <Image
              src="/logo-black.png"
              alt="Startfy"
              width={1774}
              height={887}
              priority
              className="h-20 w-auto dark:hidden"
            />
            <Image
              src="/logo-white.png"
              alt="Startfy"
              width={1774}
              height={887}
              priority
              className="hidden h-20 w-auto dark:block"
            />
          </Link>
        )}
      </div>

      <nav className="relative z-10 flex-1 overflow-y-auto py-4">
        <AdminNavList iconOnly={collapsed} />
      </nav>

      {!collapsed && (
        <div className="relative z-10 border-t border-border py-4 text-xs text-muted-foreground">
          Painel administrativo
        </div>
      )}
    </aside>
  );
}
