"use client";

import * as React from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { LogOut, Mail, Bell, ShieldCheck, PanelLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminMobileNav } from "./admin-mobile-nav";
import { ThemeToggle } from "./theme-toggle";
import { useAdminSidebar } from "./admin-sidebar-context";

interface AdminHeaderProps {
  userEmail: string;
  userRole: string;
  /** Nº de avisos pendentes (ponto rosa no sino). Ainda não conectado a uma fonte real. */
  pendingCount?: number;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
};

/**
 * Barra superior do admin no padrão TailAdmin: hambúrguer mobile + toggle de
 * colapso da sidebar (desktop) + busca à esquerda; tema claro/escuro,
 * notificações e conta à direita.
 */
export function AdminHeader({ userEmail, userRole, pendingCount = 0 }: AdminHeaderProps) {
  const [open, setOpen] = React.useState(false);
  const { toggleCollapsed } = useAdminSidebar();
  const funcao = ROLE_LABELS[userRole] ?? userRole;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between overflow-hidden border-b border-border bg-sidebar px-4 py-3 shadow-theme-xs sm:px-6">
      {/* mesmo fundo (marca espalhada + glow) da sidebar */}
      <div
        aria-hidden
        className="ad-admin-mark-bg pointer-events-none absolute inset-0 [mask-image:none]"
      />
      <div
        aria-hidden
        className="ad-float pointer-events-none absolute -right-10 -top-24 h-56 w-56 rounded-full bg-brand/20 blur-3xl"
      />
      <div
        aria-hidden
        className="ad-float pointer-events-none absolute -left-10 -bottom-24 h-56 w-56 rounded-full bg-brand/10 blur-3xl [animation-delay:-3.5s]"
      />

      <div className="relative z-10 flex items-center gap-3">
        <AdminMobileNav />
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label="Recolher/expandir menu"
          className="hidden h-10 w-10 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:inline-flex"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
      </div>

      <div className="relative z-10 flex items-center gap-2 sm:gap-3">
        <ThemeToggle />

        <button
          type="button"
          aria-label="Notificações"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Bell className="h-5 w-5" />
          {pendingCount > 0 && (
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-card" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Conta do administrador"
          title="Conta"
          className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-border">
            <Image
              src="/icon-admin.png"
              alt="Admin"
              width={44}
              height={44}
              className="h-full w-full object-cover"
            />
          </span>
          <span className="hidden text-sm font-medium text-foreground-strong sm:inline">
            {userEmail.split("@")[0]}
          </span>
        </button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>

      {/* modal da conta */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="admin-theme font-admin max-w-sm">
          <DialogHeader>
            <DialogTitle>Conta</DialogTitle>
          </DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full ring-1 ring-border">
              <Image
                src="/icon-admin.png"
                alt="Admin"
                width={48}
                height={48}
                className="h-full w-full object-cover"
              />
            </span>
            <div className="min-w-0 space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="truncate font-medium">{userEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Função: {funcao}</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
