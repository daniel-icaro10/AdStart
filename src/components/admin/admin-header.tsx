"use client";

import { signOut } from "next-auth/react";
import { LogOut, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdminMobileNav } from "./admin-mobile-nav";

interface AdminHeaderProps {
  userName: string;
  userEmail: string;
}

/** Header do admin: menu mobile + nome do usuário + tema + logout. */
export function AdminHeader({ userName, userEmail }: AdminHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 sm:px-6">
      <div className="flex items-center gap-2">
        <AdminMobileNav />
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <User className="h-4 w-4" />
        </span>
        <div className="leading-tight">
          <div className="text-sm font-medium">{userName}</div>
          <div className="text-xs text-muted-foreground">{userEmail}</div>
        </div>
      </div>

      <div className="flex items-center gap-1">
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
