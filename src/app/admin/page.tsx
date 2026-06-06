import { LayoutDashboard } from "lucide-react";

/**
 * Dashboard — DELIBERADAMENTE EM BRANCO.
 * Apenas o placeholder. Widgets/gráficos serão adicionados depois.
 */
export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral do painel administrativo.
        </p>
      </div>

      <div className="flex min-h-[50vh] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/40 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-muted-foreground">
          <LayoutDashboard className="h-6 w-6" />
        </span>
        <p className="mt-4 text-sm font-medium text-muted-foreground">
          Dashboard — em construção
        </p>
        <p className="mt-1 max-w-xs text-xs text-muted-foreground">
          Esqueleto pronto. Adicione widgets e novas sub-rotas em
          src/app/admin/.
        </p>
      </div>
    </div>
  );
}
