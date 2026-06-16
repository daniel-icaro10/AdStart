"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, KeyRound, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { RentalPlanForm } from "@/components/admin/rental-plan-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteRentalPlan } from "@/app/admin/actions";
import { formatCurrency } from "@/lib/format";
import { rentalBenefits } from "@/lib/rental-benefits";
import type { RentalPlan } from "@prisma/client";

/**
 * Admin dos planos de aluguel: board de cards no mesmo visual da página de
 * Ativos/Páginas. Cada card abre um painel de edição (modal); "Novo plano"
 * abre o mesmo painel em branco.
 */
export function RentalsManager({ plans }: { plans: RentalPlan[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState<RentalPlan | undefined>(undefined);

  const openNew = () => {
    setCurrent(undefined);
    setOpen(true);
  };
  const openEdit = (plan: RentalPlan) => {
    setCurrent(plan);
    setOpen(true);
  };
  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  const renderCard = (p: RentalPlan) => {
    const beneficios = rentalBenefits(p);
    return (
      <div
        key={p.id}
        role="button"
        tabIndex={0}
        onClick={() => openEdit(p)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openEdit(p);
          }
        }}
        className={cn(
          "group relative cursor-pointer rounded-xl border bg-card p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          p.destaque ? "border-primary/60" : "border-border",
          !p.ativo && "opacity-60",
        )}
      >
        <span
          className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <DeleteButton id={p.id} label={p.nome} action={deleteRentalPlan} />
        </span>

        <div className="flex flex-wrap items-center gap-1.5 pr-8">
          {p.destaque && (
            <Badge className="border border-primary/30 bg-primary/15 text-primary">
              Mais popular
            </Badge>
          )}
          <Badge
            className={cn(
              "border",
              p.ativo
                ? "border-positive/30 bg-positive/15 text-positive"
                : "border-border bg-muted text-muted-foreground",
            )}
          >
            {p.ativo ? "Ativo" : "Inativo"}
          </Badge>
          <Badge variant="secondary">#{p.ordem}</Badge>
        </div>

        <h3 className="mt-3 text-base font-semibold leading-snug">{p.nome}</h3>

        <div className="mt-1 flex items-baseline gap-1">
          <span className="text-2xl font-bold tabular-nums">
            {formatCurrency(p.precoMensalUSD, "USD")}
          </span>
          <span className="text-xs text-muted-foreground">/mês</span>
        </div>

        {beneficios.length > 0 && (
          <ul className="mt-3 space-y-1 border-t border-border pt-3">
            {beneficios.slice(0, 5).map((b, i) => (
              <li
                key={i}
                className="flex items-start gap-1.5 text-xs text-muted-foreground"
              >
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-positive" />
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Aluguéis</h1>
          <p className="text-sm text-muted-foreground">
            {plans.length} plano(s) de aluguel. Clique em um card para editar.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          Novo plano
        </Button>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/40">
          <EmptyState
            icon={KeyRound}
            title="Nenhum plano de aluguel cadastrado ainda."
            className="py-16"
            action={
              <Button onClick={openNew}>
                <Plus className="h-4 w-4" />
                Novo plano
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map(renderCard)}
        </div>
      )}

      {/* painel de edição/criação */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="admin-theme max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {current ? `Editar · ${current.nome}` : "Novo plano"}
            </DialogTitle>
          </DialogHeader>
          <RentalPlanForm
            key={current?.id ?? "new"}
            plan={current}
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
