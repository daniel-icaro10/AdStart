"use client";

import * as React from "react";

import type { Categoria } from "@/lib/constants";
import type { AssetWithContas } from "@/types";
import { Filters, DEFAULT_FILTERS, type FilterState } from "./filters";
import { KanbanBoard } from "./kanban-board";
import { AssetDetailModal } from "./asset-detail-modal";

/** Faixas de gasto (referência em BRL) usadas pelo filtro. */
function matchFaixa(asset: AssetWithContas, faixa: FilterState["faixa"]): boolean {
  if (faixa === "ALL") return true;
  const gasto =
    asset.moeda === "USD"
      ? (asset.totalGastosUSD ?? 0) * 5 // aproxima USD→BRL só para a faixa
      : asset.totalGastosBRL ?? 0;

  switch (faixa) {
    case "0_10K":
      return gasto <= 10_000;
    case "10K_50K":
      return gasto > 10_000 && gasto <= 50_000;
    case "50K_PLUS":
      return gasto > 50_000;
    default:
      return true;
  }
}

/**
 * Componente cliente que orquestra a experiência do catálogo:
 * mantém o estado dos filtros, aplica a filtragem em memória e
 * controla a abertura do modal de detalhes.
 */
export function CatalogExplorer({
  assets,
  order,
}: {
  assets: AssetWithContas[];
  order?: Categoria[];
}) {
  const [filters, setFilters] = React.useState<FilterState>(DEFAULT_FILTERS);
  const [selected, setSelected] = React.useState<AssetWithContas | null>(null);
  const [open, setOpen] = React.useState(false);

  const filtered = React.useMemo(() => {
    const termo = filters.busca.trim().toLowerCase();
    return assets.filter((a) => {
      if (
        termo &&
        !a.codigo.toLowerCase().includes(termo) &&
        !a.titulo.toLowerCase().includes(termo)
      ) {
        return false;
      }
      if (filters.categoria !== "ALL" && a.categoria !== filters.categoria) {
        return false;
      }
      if (filters.moeda !== "ALL" && a.moeda !== filters.moeda) return false;
      if (filters.status !== "ALL" && a.statusVenda !== filters.status) {
        return false;
      }
      if (!matchFaixa(a, filters.faixa)) return false;
      return true;
    });
  }, [assets, filters]);

  const handleSelect = (asset: AssetWithContas) => {
    setSelected(asset);
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <Filters value={filters} onChange={setFilters} />
      <KanbanBoard assets={filtered} onSelect={handleSelect} order={order} />
      <AssetDetailModal asset={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
