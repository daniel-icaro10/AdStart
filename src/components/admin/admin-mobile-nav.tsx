"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";

import { AdminNavList } from "./admin-nav-list";

/**
 * Navegação mobile do admin: botão hambúrguer que abre um drawer lateral
 * (overlay) com os mesmos itens da sidebar. Visível apenas em telas
 * pequenas (lg:hidden) — no desktop quem navega é a AdminSidebar estática.
 */
export function AdminMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="Abrir menu"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 lg:hidden" />
        <DialogPrimitive.Content
          className="admin-theme font-admin fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col border-r border-border bg-card px-5 text-foreground shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left lg:hidden"
        >
          <DialogPrimitive.Title className="sr-only">
            Menu administrativo
          </DialogPrimitive.Title>

          <div className="flex h-20 items-center justify-between">
            <Image
              src="/logo.png"
              alt="adStart"
              width={1104}
              height={366}
              className="h-7 w-auto"
            />
            <DialogPrimitive.Close
              aria-label="Fechar menu"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <AdminNavList onNavigate={() => setOpen(false)} />
          </nav>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
