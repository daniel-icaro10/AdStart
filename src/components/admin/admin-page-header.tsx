import type { LucideIcon } from "lucide-react";

interface AdminPageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}

/** Cabeçalho padrão de página do admin: título + descrição + ações opcionais à direita. */
export function AdminPageHeader({ title, description, icon: Icon, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-foreground-strong">
          {Icon && <Icon className="h-6 w-6 text-primary" />}
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
