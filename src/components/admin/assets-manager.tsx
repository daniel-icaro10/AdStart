"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Boxes } from "lucide-react";

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
import { AssetForm } from "@/components/admin/asset-form";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteAsset } from "@/app/admin/actions";
import { formatCurrency } from "@/lib/format";
import {
  CATEGORIA_META,
  CATEGORIA_ORDER,
  STATUS_VENDA_META,
  TIER_BADGE_CLASS,
  getIconeEmoji,
  type Categoria,
  type StatusVenda,
} from "@/lib/constants";
import type { AssetWithDetails } from "@/types";

/**
 * Visão dos ativos no estilo Notion: board com colunas por categoria (todas,
 * inclusive vazias); cada card é clicável e abre um painel de edição (modal).
 */
export function AssetsManager({
  assets,
  order = CATEGORIA_ORDER,
}: {
  assets: AssetWithDetails[];
  order?: Categoria[];
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  // undefined = criando; objeto = editando.
  const [current, setCurrent] = React.useState<AssetWithDetails | undefined>(
    undefined,
  );

  const openNew = () => {
    setCurrent(undefined);
    setOpen(true);
  };
  const openEdit = (asset: AssetWithDetails) => {
    setCurrent(asset);
    setOpen(true);
  };
  const handleSuccess = () => {
    setOpen(false);
    router.refresh();
  };

  const renderCard = (a: AssetWithDetails) => {
    const categoria = a.categoria as Categoria;
    const status = a.statusVenda as StatusVenda;
    const emoji = getIconeEmoji(a.icone);
    return (
      <div
        key={a.id}
        role="button"
        tabIndex={0}
        onClick={() => openEdit(a)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openEdit(a);
          }
        }}
        className={cn(
          "group relative cursor-pointer rounded-lg p-2.5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          CATEGORIA_META[categoria].cardClass,
        )}
      >
        {/* excluir (não dispara a edição) */}
        <span
          className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.stopPropagation()}
        >
          <DeleteButton id={a.id} label={a.codigo} action={deleteAsset} />
        </span>

        <div className="flex flex-wrap items-center gap-1.5 pr-8">
          <Badge className={cn("border", CATEGORIA_META[categoria].badgeClass)}>
            {CATEGORIA_META[categoria].label}
          </Badge>
          <Badge className={cn("border", STATUS_VENDA_META[status].badgeClass)}>
            {STATUS_VENDA_META[status].label}
          </Badge>
          {a.tier != null && (
            <Badge className={TIER_BADGE_CLASS}>Tier {a.tier}</Badge>
          )}
          {a.destaque && (
            <Badge className="border border-warning/30 bg-warning/15 text-warning">
              Nova
            </Badge>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          {emoji && <span className="text-base leading-none">{emoji}</span>}
          <h3 className="text-[13px] font-semibold leading-snug">{a.titulo}</h3>
        </div>

        {a.conteudo && (
          <p className="mt-1.5 whitespace-pre-line text-[10.5px] leading-snug text-muted-foreground">
            {a.conteudo}
          </p>
        )}

        {a.valor > 0 && (
          <div className="mt-2 border-t border-border pt-2 text-sm font-bold tabular-nums">
            {formatCurrency(a.valor, "BRL")}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ativos (BMs)</h1>
          <p className="text-sm text-muted-foreground">
            {assets.length} ativo(s). Clique em um card para editar.
          </p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          Novo ativo
        </Button>
      </div>

      {assets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/40">
          <EmptyState
            icon={Boxes}
            title="Nenhum ativo cadastrado ainda."
            className="py-16"
            action={
              <Button onClick={openNew}>
                <Plus className="h-4 w-4" />
                Novo ativo
              </Button>
            }
          />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-subtle">
          {order.map((cat) => {
            const items = assets.filter((a) => (a.categoria as Categoria) === cat);
            return (
              <section key={cat} className="flex w-[260px] shrink-0 flex-col">
                <div className="mb-3 flex items-center gap-2 px-1">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
                      CATEGORIA_META[cat].badgeClass,
                    )}
                  >
                    {CATEGORIA_META[cat].label}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">
                    {items.length}
                  </span>
                </div>

                {items.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-border bg-card/40 p-6 text-center text-xs text-faint">
                    Vazia
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">{items.map(renderCard)}</div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* painel de edição/criação */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="admin-theme max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {current ? `Editar · ${current.codigo}` : "Novo ativo"}
            </DialogTitle>
          </DialogHeader>
          <AssetForm
            key={current?.id ?? "new"}
            asset={current}
            onSuccess={handleSuccess}
            onCancel={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
