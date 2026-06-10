import Link from "next/link";
import { Clock, Hourglass, FileWarning, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  AGING_WARN,
  AGING_CRIT,
  type AgingItem,
  type IncompletoItem,
} from "@/lib/dashboard";

function diasBadge(dias: number) {
  const tone =
    dias >= AGING_CRIT
      ? "border-rose-500/30 bg-rose-500/15 text-rose-300"
      : dias >= AGING_WARN
        ? "border-amber-500/30 bg-amber-500/15 text-amber-300"
        : "border-border text-muted-foreground";
  return <Badge className={cn("border tabular-nums", tone)}>{dias}d</Badge>;
}

function Card({
  icon: Icon,
  title,
  children,
  footer,
}: {
  icon: typeof Clock;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {title}
      </div>
      <div className="flex-1 space-y-1.5">{children}</div>
      {footer && <div className="mt-3 border-t border-border pt-2">{footer}</div>}
    </div>
  );
}

const vazio = (
  <p className="py-4 text-center text-xs text-muted-foreground">
    Nada por aqui 👍
  </p>
);

const verTodos = (
  <Link
    href="/admin/financeiro/ativos"
    className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
  >
    Abrir em Financeiro → Ativos <ArrowRight className="h-3 w-3" />
  </Link>
);

export function DashboardAlertas({
  aging,
  agingWarn,
  agingCrit,
  reservados,
  incompletos,
  incompletosTotal,
}: {
  aging: AgingItem[];
  agingWarn: number;
  agingCrit: number;
  reservados: AgingItem[];
  incompletos: IncompletoItem[];
  incompletosTotal: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card
        icon={Clock}
        title="Parados em estoque"
        footer={
          <div className="flex items-center justify-between">
            <span className="flex gap-2 text-xs">
              <span className="text-amber-300">{agingWarn} ≥{AGING_WARN}d</span>
              <span className="text-rose-300">{agingCrit} ≥{AGING_CRIT}d</span>
            </span>
            {verTodos}
          </div>
        }
      >
        {aging.length === 0
          ? vazio
          : aging.map((a) => (
              <div key={`${a.origem}-${a.id}`} className="flex items-center justify-between gap-2">
                <span className="truncate text-sm">{a.titulo}</span>
                {diasBadge(a.dias)}
              </div>
            ))}
      </Card>

      <Card
        icon={Hourglass}
        title="Reservas travadas"
        footer={verTodos}
      >
        {reservados.length === 0
          ? vazio
          : reservados.map((a) => (
              <div key={`${a.origem}-${a.id}`} className="flex items-center justify-between gap-2">
                <span className="truncate text-sm">{a.titulo}</span>
                {diasBadge(a.dias)}
              </div>
            ))}
      </Card>

      <Card
        icon={FileWarning}
        title="Dados incompletos"
        footer={
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {incompletosTotal} ativo(s)
            </span>
            {verTodos}
          </div>
        }
      >
        {incompletos.length === 0
          ? vazio
          : incompletos.map((a) => (
              <div key={`${a.origem}-${a.id}`} className="flex items-center justify-between gap-2">
                <span className="truncate text-sm">{a.titulo}</span>
                <span className="flex shrink-0 gap-1">
                  {a.faltaCusto && (
                    <Badge variant="secondary" className="text-[10px]">sem custo</Badge>
                  )}
                  {a.faltaFornecedor && (
                    <Badge variant="secondary" className="text-[10px]">sem fornec.</Badge>
                  )}
                </span>
              </div>
            ))}
      </Card>
    </div>
  );
}
