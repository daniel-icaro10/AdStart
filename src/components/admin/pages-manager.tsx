"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, Users, UserX } from "lucide-react";

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
import { PageForm } from "@/components/admin/page-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { deletePage } from "@/app/admin/actions";
import { formatCurrency, formatInt } from "@/lib/format";
import {
  PAGE_KIND_META,
  STATUS_VENDA_META,
  type StatusVenda,
} from "@/lib/constants";
import type { Page } from "@prisma/client";

/** Colunas do board do admin, separadas por tipo (com/sem seguidores). */
const COLUMNS: { kind: "COM" | "SEM"; label: string; accent: string }[] = [
  { kind: "COM", label: "Com seguidores", accent: "bg-primary/70" },
  { kind: "SEM", label: "Sem seguidores", accent: "bg-faint" },
];

/**
 * Visão das páginas no estilo Notion: board com colunas por tipo; cada card é
 * clicável e abre um painel de edição (modal). "Nova página" abre o mesmo painel.
 */
export function PagesManager({ pages }: { pages: Page[] }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState<Page | undefined>(undefined);

  const openNew = () => {
    setCurrent(undefined);
    setOpen(true);
  };
  const openEdit = (page: Page) => {
    setCurrent(page);
    setOpen(true);
  };
  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  const renderCard = (p: Page) => {
    const status = p.status as StatusVenda;
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
          "group relative cursor-pointer rounded-xl p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          PAGE_KIND_META[p.kind as "COM" | "SEM"].cardClass,
        )}
      >
        <span
          className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <DeleteButton id={p.id} label={p.nome} action={deletePage} />
        </span>

        <div className="flex flex-wrap items-center gap-1.5 pr-8">
          <Badge variant="secondary">{p.nicho}</Badge>
          <Badge className={cn("border", STATUS_VENDA_META[status].badgeClass)}>
            {STATUS_VENDA_META[status].label}
          </Badge>
          {p.destaque && (
            <Badge className="border border-warning/30 bg-warning/15 text-warning">
              Nova
            </Badge>
          )}
        </div>

        <h3 className="mt-3 font-semibold leading-snug">{p.nome}</h3>

        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          {p.kind === "COM" ? (
            <span className="inline-flex items-center gap-1 tabular-nums">
              <Users className="h-3.5 w-3.5" />
              {formatInt(p.seguidores)} seguidores
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <UserX className="h-3.5 w-3.5" />
              Sem seguidores
            </span>
          )}
        </div>

        <div className="mt-4 border-t border-border pt-3">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Valor
          </div>
          <div className="text-xl font-bold tabular-nums">
            {formatCurrency(p.valor, "BRL")}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Páginas</h1>
          <p className="text-sm text-muted-foreground">
            {pages.length} página(s). Clique em um card para editar.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          Nova página
        </Button>
      </div>

      {pages.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/40">
          <EmptyState
            icon={FileText}
            title="Nenhuma página cadastrada ainda."
            className="py-16"
            action={
              <Button onClick={openNew}>
                <Plus className="h-4 w-4" />
                Nova página
              </Button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {COLUMNS.map((col) => {
            const items = pages.filter((p) => p.kind === col.kind);
            return (
              <section key={col.kind} className="flex flex-col">
                <div className="mb-3 flex items-center gap-2 px-1">
                  <span className={cn("h-2.5 w-2.5 rounded-full", col.accent)} />
                  <h2 className="text-sm font-semibold">{col.label}</h2>
                  <span className="rounded-md bg-accent px-1.5 py-0.5 text-xs text-muted-foreground">
                    {items.length}
                  </span>
                </div>

                {items.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-card/40 p-6 text-center text-xs text-faint">
                    Nenhuma página nesta coluna.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">{items.map(renderCard)}</div>
                )}
              </section>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="admin-theme max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {current ? `Editar · ${current.nome}` : "Nova página"}
            </DialogTitle>
          </DialogHeader>
          <PageForm
            key={current?.id ?? "new"}
            page={current}
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
