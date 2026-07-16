"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { adminNav } from "./nav-config";

/** Sidebar de navegação do admin. Esconde no mobile (vira topo só com header). */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-16 items-center border-b border-border px-5">
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

      <nav className="flex-1 space-y-1 p-3">
        {adminNav.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-foreground before:absolute before:inset-y-1.5 before:left-0 before:w-0.5 before:rounded-full before:bg-primary"
                  : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3 text-xs text-muted-foreground">
        Painel administrativo
      </div>
    </aside>
  );
}
