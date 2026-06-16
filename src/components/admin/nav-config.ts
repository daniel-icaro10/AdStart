import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Boxes,
  FileText,
  KeyRound,
  Users,
  ListOrdered,
  Wallet,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

/**
 * Itens de navegação do admin.
 *
 * Para adicionar uma nova sub-rota no futuro:
 *   1. Crie a pasta/página em `src/app/admin/<rota>/page.tsx`.
 *   2. Adicione uma entrada aqui (label, href "/admin/<rota>", ícone lucide).
 * O middleware já protege automaticamente qualquer rota sob /admin/*.
 *
 * Exemplos prontos para descomentar quando implementar:
 *   { label: "Ativos",     href: "/admin/ativos",     icon: Boxes },
 *   { label: "Clientes",   href: "/admin/clientes",   icon: Users },
 *   { label: "Financeiro", href: "/admin/financeiro", icon: Wallet },
 */
export const adminNav: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Ativos", href: "/admin/ativos", icon: Boxes },
  { label: "Páginas", href: "/admin/paginas", icon: FileText },
  { label: "Aluguéis", href: "/admin/alugueis", icon: KeyRound },
  { label: "Clientes", href: "/admin/clientes", icon: Users },
  { label: "Categorias", href: "/admin/categorias", icon: ListOrdered },
  { label: "Financeiro", href: "/admin/financeiro", icon: Wallet },
];
