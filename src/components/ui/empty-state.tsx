import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Estado vazio padrão: ícone + frase de uma linha (que diz o que fazer) + ação.
 * Usado em gráficos sem dados, tabelas sem resultado e alertas zerados.
 */
export function EmptyState({
  icon: Icon,
  title,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center gap-3 px-4 py-8 text-center",
        className,
      )}
    >
      <Icon className="h-6 w-6 text-ds-text-faint" />
      <p className="max-w-xs font-ds-sans text-ds-body text-ds-text-muted">
        {title}
      </p>
      {action}
    </div>
  );
}
