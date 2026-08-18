"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus, Boxes, Star, Users, CalendarDays } from "lucide-react";

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

/** Cor sólida do chip de status (estilo label do Trello) — só usada no card. */
const STATUS_DOT_CLASS: Record<StatusVenda, string> = {
  DISPONIVEL: "bg-emerald-500 text-white",
  RESERVADO: "bg-amber-500 text-white",
  VENDIDO: "bg-rose-500 text-white",
  PERDIDO: "bg-zinc-500 text-white",
};

/** Dias em estoque: entrada até a saída (se já saiu) ou até hoje. */
function diasEstoque(entrada: Date | null, saida: Date | null): number | null {
  if (!entrada) return null;
  const start = new Date(entrada).getTime();
  const end = saida ? new Date(saida).getTime() : Date.now();
  return Math.max(0, Math.floor((end - start) / 86_400_000));
}

/**
 * Visão dos ativos no estilo Trello: board com colunas por categoria (todas,
 * inclusive vazias); cada card é clicável e abre um painel de edição (modal).
 * Faixa lateral colorida indica a categoria; chips coloridos substituem os
 * badges de texto uniformes.
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
    const dias = diasEstoque(a.dataEntrada ?? a.createdAt, a.dataSaida);

    return (
      <div
        key={a.id}
        role="button"
        tabIndex={0}
        onClick={() => openEdit(a)}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openEdit(a);
          }
        }}
        className="group relative flex cursor-pointer overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {/* faixa lateral colorida por categoria */}
        <span
          className={cn("w-1.5 shrink-0", CATEGORIA_META[categoria].accentClass)}
          aria-hidden
        />

        <div className="min-w-0 flex-1 p-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-1.5">
              {emoji && <span className="text-base leading-none">{emoji}</span>}
              <h3 className="text-[13px] font-semibold leading-snug">{a.titulo}</h3>
            </div>
            {/* excluir (não dispara a edição) */}
            <span
              className="shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <DeleteButton id={a.id} label={a.codigo} action={deleteAsset} />
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <span
                className={cn("h-1.5 w-1.5 rounded-full", CATEGORIA_META[categoria].accentClass)}
                aria-hidden
              />
              {CATEGORIA_META[categoria].label}
            </span>
            <Badge
              className={cn(
                "rounded-full border-transparent px-1.5 py-0.5 text-[10px] font-semibold",
                STATUS_DOT_CLASS[status],
              )}
            >
              {STATUS_VENDA_META[status].label}
            </Badge>
            {a.tier != null && (
              <Badge
                className={cn(TIER_BADGE_CLASS, "rounded-full px-1.5 py-0.5 text-[10px]")}
              >
                Tier {a.tier}
              </Badge>
            )}
            {a.destaque && (
              <Badge className="gap-0.5 rounded-full border-warning/30 bg-warning/15 px-1.5 py-0.5 text-[10px] text-warning">
                <Star className="h-2.5 w-2.5 fill-current" />
                Nova
              </Badge>
            )}
          </div>

          {a.conteudo && (
            <p className="mt-1.5 line-clamp-2 whitespace-pre-line text-[10.5px] leading-snug text-muted-foreground">
              {a.conteudo}
            </p>
          )}

          <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-2">
            <div className="flex items-baseline gap-1.5">
              {a.precoAntigo != null && a.precoAntigo > a.valor && (
                <span className="text-[10px] tabular-nums text-muted-foreground line-through">
                  {formatCurrency(a.precoAntigo, "BRL")}
                </span>
              )}
              <span className="text-sm font-bold tabular-nums">
                {a.valor > 0 ? formatCurrency(a.valor, "BRL") : "—"}
              </span>
              {a.precoAntigo != null && a.precoAntigo > a.valor && (
                <span className="text-[10px] font-semibold text-emerald-400">
                  -{Math.round((1 - a.valor / a.precoAntigo) * 100)}%
                </span>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2 text-[10px] text-muted-foreground">
              {a.contas.length > 0 && (
                <span className="inline-flex items-center gap-0.5">
                  <Users className="h-3 w-3" />
                  {a.contas.length}
                </span>
              )}
              {dias != null && (
                <span className="inline-flex items-center gap-0.5">
                  <CalendarDays className="h-3 w-3" />
                  {dias}d
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const vendidas = assets.filter((a) => a.statusVenda === "VENDIDO");

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
        <div className="rounded-2xl border border-dashed border-border bg-card/40">
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
            // Vendidas saem das colunas de categoria — ficam na coluna própria no fim.
            const items = assets.filter(
              (a) =>
                (a.categoria as Categoria) === cat &&
                a.statusVenda !== "VENDIDO",
            );
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

          {/* coluna fixa no fim: BMs vendidas (separadas das disponíveis) */}
          <section className="flex w-[260px] shrink-0 flex-col">
            <div className="mb-3 flex items-center gap-2 px-1">
              <span
                className={cn(
                  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
                  STATUS_VENDA_META.VENDIDO.badgeClass,
                )}
              >
                Vendidas
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {vendidas.length}
              </span>
            </div>

            {vendidas.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-card/40 p-6 text-center text-xs text-faint">
                Vazia
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {vendidas.map(renderCard)}
              </div>
            )}
          </section>
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
