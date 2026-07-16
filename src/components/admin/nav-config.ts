import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Boxes, KeyRound, ListOrdered, Wallet } from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

/**
 * Navegação do admin, em grupos com rótulo uppercase (DESIGN.md §6.1).
 *
 * Para adicionar uma nova sub-rota no futuro:
 *   1. Crie a pasta/página em `src/app/admin/<rota>/page.tsx`.
 *   2. Adicione uma entrada no grupo apropriado (label, href "/admin/<rota>", ícone lucide).
 * O middleware já protege automaticamente qualquer rota sob /admin/*.
 */
export const adminNavGroups: AdminNavGroup[] = [
  {
    label: "Geral",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Catálogo",
    items: [
      { label: "Ativos", href: "/admin/ativos", icon: Boxes },
      { label: "Aluguéis", href: "/admin/alugueis", icon: KeyRound },
      { label: "Categorias", href: "/admin/categorias", icon: ListOrdered },
    ],
  },
  {
    label: "Financeiro",
    items: [{ label: "Financeiro", href: "/admin/financeiro", icon: Wallet }],
  },
];
