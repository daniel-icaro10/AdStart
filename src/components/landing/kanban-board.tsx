"use client";

import { cn } from "@/lib/utils";
import { CATEGORIA_META, CATEGORIA_ORDER, type Categoria } from "@/lib/constants";
import type { AssetWithContas } from "@/types";
import { AssetCard } from "./asset-card";

interface KanbanBoardProps {
  assets: AssetWithContas[];
  onSelect: (asset: AssetWithContas) => void;
  /** Ordem das colunas (definida no admin). Default: ordem padrão. */
  order?: Categoria[];
}

/**
 * Board Kanban: uma coluna por categoria.
 * Desktop → colunas horizontais com scroll; mobile → seções empilhadas.
 */
export function KanbanBoard({
  assets,
  onSelect,
  order = CATEGORIA_ORDER,
}: KanbanBoardProps) {
  // Agrupa os ativos por categoria, mantendo apenas colunas que têm itens.
  const columns = order.map((categoria) => ({
    categoria,
    items: assets.filter((a) => (a.categoria as Categoria) === categoria),
  })).filter((col) => col.items.length > 0);

  if (assets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground">
        Nenhum ativo encontrado com os filtros atuais.
      </div>
    );
  }

  return (
    <div className="flex snap-x gap-4 overflow-x-auto pb-4 scrollbar-subtle lg:grid lg:auto-cols-fr lg:grid-flow-col lg:overflow-visible">
      {columns.map((col) => (
        <section
          key={col.categoria}
          className="flex w-[85vw] shrink-0 snap-start flex-col sm:w-[340px] lg:w-auto"
        >
          {/* cabeçalho da coluna (pílula colorida estilo Notion) */}
          <div className="mb-3 flex items-center gap-2 px-1">
            <span
              className={cn(
                "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
                CATEGORIA_META[col.categoria].badgeClass,
              )}
            >
              {CATEGORIA_META[col.categoria].label}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {col.items.length}
            </span>
          </div>

          {/* cards */}
          <div className="flex flex-col gap-3">
            {col.items.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onClick={() => onSelect(asset)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
