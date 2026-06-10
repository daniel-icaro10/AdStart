"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdminMobileNav } from "./admin-mobile-nav";

interface AdminHeaderProps {
  userName: string;
  userEmail: string;
}

function initials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "A"
  );
}

/** Barra superior fina do admin: menu mobile + avatar do usuário + sair. */
export function AdminHeader({ userName, userEmail }: AdminHeaderProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card/40 px-4 sm:px-6">
      <AdminMobileNav />
      <div className="ml-auto flex items-center gap-2">
        <div className="flex items-center gap-2" title={userEmail}>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
            {initials(userName)}
          </span>
          <span className="hidden text-sm font-medium sm:inline">{userName}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Sair</span>
        </Button>
      </div>
    </header>
  );
}
