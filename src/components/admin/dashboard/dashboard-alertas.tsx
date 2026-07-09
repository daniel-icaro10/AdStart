import Link from "next/link";
import { Clock, Hourglass, FileWarning, Check, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  AGING_WARN,
  AGING_CRIT,
  type AgingItem,
} from "@/lib/dashboard";

function DiasBadge({ dias }: { dias: number }) {
  const cls =
    dias >= AGING_CRIT
      ? "border-negative/30 bg-negative/15 text-negative"
      : dias >= AGING_WARN
        ? "border-warning/30 bg-warning/15 text-warning"
        : "border-border text-faint";
  return <Badge className={cn("border tabular-nums", cls)}>{dias}d</Badge>;
}

function verTodos(n: number) {
  return (
    <Link
      href="/admin/ativos?tab=financeiro"
      className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
    >
      Ver todos ({n}) <ArrowRight className="h-3 w-3" />
    </Link>
  );
}

/** Cartão de alerta — colapsa para uma linha quando está zerado. */
function AlertCard({
  icon: Icon,
  title,
  empty,
  emptyLabel,
  children,
  footer,
}: {
  icon: typeof Clock;
  title: string;
  empty: boolean;
  emptyLabel: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (empty) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
        <Check className="h-4 w-4 text-positive" />
        <span className="font-medium text-foreground">{title}</span>
        <span>· {emptyLabel}</span>
      </div>
    );
  }
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-faint" />
        {title}
      </div>
      <div className="flex-1 space-y-1.5">{children}</div>
      {footer && <div className="mt-3 border-t border-border pt-2">{footer}</div>}
    </div>
  );
}

function Linha({ titulo, right }: { titulo: string; right: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="truncate text-sm">{titulo}</span>
      {right}
    </div>
  );
}

export function DashboardAlertas({
  aging,
  agingTotal,
  agingWarn,
  agingCrit,
  reservados,
  reservadosTotal,
  incompletosTotal,
  incSemCusto,
  incSemFornecedor,
}: {
  aging: AgingItem[];
  agingTotal: number;
  agingWarn: number;
  agingCrit: number;
  reservados: AgingItem[];
  reservadosTotal: number;
  incompletosTotal: number;
  incSemCusto: number;
  incSemFornecedor: number;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
      <AlertCard
        icon={Clock}
        title="Parados em estoque"
        empty={aging.length === 0}
        emptyLabel="nenhum há 15+ dias 👍"
        footer={
          <div className="flex items-center justify-between">
            <span className="flex gap-2 text-xs">
              <span className="text-warning">{agingWarn} ≥{AGING_WARN}d</span>
              <span className="text-negative">{agingCrit} ≥{AGING_CRIT}d</span>
            </span>
            {agingTotal > aging.length && verTodos(agingTotal)}
          </div>
        }
      >
        {aging.map((a) => (
          <Linha
            key={`${a.origem}-${a.id}`}
            titulo={a.titulo}
            right={<DiasBadge dias={a.dias} />}
          />
        ))}
      </AlertCard>

      <AlertCard
        icon={Hourglass}
        title="Reservas travadas"
        empty={reservados.length === 0}
        emptyLabel="nenhuma parada 👍"
        footer={
          reservadosTotal > reservados.length ? verTodos(reservadosTotal) : undefined
        }
      >
        {reservados.map((a) => (
          <Linha
            key={`${a.origem}-${a.id}`}
            titulo={a.titulo}
            right={<DiasBadge dias={a.dias} />}
          />
        ))}
      </AlertCard>

      <AlertCard
        icon={FileWarning}
        title="Dados incompletos"
        empty={incompletosTotal === 0}
        emptyLabel="tudo preenchido 👍"
      >
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground tabular-nums">{incSemCusto}</strong>{" "}
          sem custo de aquisição ·{" "}
          <strong className="text-foreground tabular-nums">
            {incSemFornecedor}
          </strong>{" "}
          sem fornecedor
        </p>
        <Link
          href="/admin/ativos?tab=financeiro"
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
        >
          Completar dados <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </AlertCard>
    </div>
  );
}
