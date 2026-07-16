"use client";

import * as React from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { LogOut, Mail, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminMobileNav } from "./admin-mobile-nav";

interface AdminHeaderProps {
  userEmail: string;
  userRole: string;
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Administrador",
};

/**
 * Barra superior do admin: menu mobile + ícone da conta + sair.
 * O ícone (icon-admin.png) abre um modal com o email e a função do admin.
 */
export function AdminHeader({ userEmail, userRole }: AdminHeaderProps) {
  const [open, setOpen] = React.useState(false);
  const funcao = ROLE_LABELS[userRole] ?? userRole;

  return (
    <header className="flex h-14 items-center justify-between border-b border-ds-border-soft bg-ds-surface/40 px-4 sm:px-6">
      <AdminMobileNav />
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Conta do administrador"
          title="Conta"
          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full ring-1 ring-border transition-shadow hover:ring-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Image
            src="/icon-admin.png"
            alt="Admin"
            width={36}
            height={36}
            className="h-full w-full object-cover"
          />
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
        <DialogContent className="admin-theme max-w-sm">
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
