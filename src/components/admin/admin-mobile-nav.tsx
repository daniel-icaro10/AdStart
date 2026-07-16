"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";

import { AdminNavLinks } from "./admin-nav-links";

/**
 * Navegação mobile do admin: botão hambúrguer que abre um drawer lateral
 * com os mesmos itens da sidebar. Visível apenas em telas pequenas (lg:hidden).
 */
export function AdminMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // Fecha o drawer sempre que a rota mudar (após clicar num link).
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="Abrir menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-ds-text-muted transition-colors hover:bg-ds-surface-2 hover:text-ds-text lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 lg:hidden" />
        <DialogPrimitive.Content
          className="admin-theme fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col border-r border-ds-border-soft bg-ds-surface text-ds-text shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left lg:hidden"
        >
          <DialogPrimitive.Title className="sr-only">
            Menu administrativo
          </DialogPrimitive.Title>

          <div className="flex h-16 items-center justify-between border-b border-ds-border-soft px-4">
            <span className="inline-flex items-center rounded-lg bg-white/90 px-2.5 py-1.5 shadow-sm ring-1 ring-black/5">
              <Image
                src="/logo.png"
                alt="adStart"
                width={1104}
                height={366}
                className="h-6 w-auto"
              />
            </span>
            <DialogPrimitive.Close
              aria-label="Fechar menu"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-ds-text-muted hover:bg-ds-surface-2 hover:text-ds-text"
            >
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          <AdminNavLinks pathname={pathname} />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
