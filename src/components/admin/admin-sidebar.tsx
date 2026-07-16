"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { AdminNavLinks } from "./admin-nav-links";

/** Sidebar de navegação do admin (DESIGN.md §6.1: 240px fixa). Esconde no mobile. */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-ds-border-soft bg-ds-surface lg:flex">
      <div className="flex h-16 items-center border-b border-ds-border-soft px-5">
        <Link
          href="/admin"
          aria-label="adStart"
          className="inline-flex items-center rounded-lg bg-white/90 px-2.5 py-1.5 shadow-sm ring-1 ring-black/5"
        >
          <Image
            src="/logo.png"
            alt="adStart"
            width={1104}
            height={366}
            priority
            className="h-6 w-auto"
          />
        </Link>
      </div>

      <AdminNavLinks pathname={pathname} />

      <div className="border-t border-ds-border-soft p-3 font-ds-sans text-xs text-ds-text-faint">
        Painel administrativo
      </div>
    </aside>
  );
}
