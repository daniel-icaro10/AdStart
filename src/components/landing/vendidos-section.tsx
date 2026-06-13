"use client";

import * as React from "react";

import { AssetCard } from "./asset-card";
import { AssetDetailModal } from "./asset-detail-modal";
import { PageCard } from "./pages-section";
import type { AssetWithContas, PagePublic } from "@/types";

/**
 * Aba "Vendidos" do catálogo: reúne BMs e Páginas já vendidas como prova de giro.
 * BMs abrem o modal de detalhes; páginas exibem o card com selo "Vendido".
 */
export function VendidosSection({
  assets,
  pages,
}: {
  assets: AssetWithContas[];
  pages: PagePublic[];
}) {
  const [selected, setSelected] = React.useState<AssetWithContas | null>(null);
  const [open, setOpen] = React.useState(false);

  const total = assets.length + pages.length;

  if (total === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground">
        Nenhum ativo vendido ainda. Os vendidos aparecem aqui como prova de giro.
      </div>
    );
  }

  const plural = total > 1;

  return (
    <div className="space-y-6">
      <p className="text-center text-sm text-muted-foreground">
        {total} ativo{plural ? "s" : ""} já vendido{plural ? "s" : ""} — prova de
        giro real.
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
        {pages.map((page) => (
          <PageCard key={page.id} page={page} />
        ))}
      </div>

      <AssetDetailModal asset={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
