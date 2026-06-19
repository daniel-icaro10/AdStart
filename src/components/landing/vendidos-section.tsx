"use client";

import * as React from "react";

import { AssetCard } from "./asset-card";
import { AssetDetailModal } from "./asset-detail-modal";
import type { AssetWithContas } from "@/types";

/**
 * Aba "Vendidos" do catálogo: BMs já vendidas (prova de giro). Páginas e perfis
 * NÃO entram aqui — são vendidos por unidade e somem da vitrine ao esgotar.
 */
export function VendidosSection({ assets }: { assets: AssetWithContas[] }) {
  const [selected, setSelected] = React.useState<AssetWithContas | null>(null);
  const [open, setOpen] = React.useState(false);

  if (assets.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground">
        Nenhuma BM vendida ainda. As vendidas aparecem aqui como prova de giro.
      </div>
    );
  }

  const plural = assets.length > 1;

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-muted-foreground">
        {assets.length} BM{plural ? "s" : ""} já vendida{plural ? "s" : ""} —
        prova de giro real.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assets.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onClick={() => {
              setSelected(asset);
              setOpen(true);
            }}
          />
        ))}
      </div>

      <AssetDetailModal asset={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
