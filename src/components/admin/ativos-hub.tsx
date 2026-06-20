"use client";

import * as React from "react";
import { Boxes, FileText, AtSign } from "lucide-react";

import { cn } from "@/lib/utils";
import { AssetsManager } from "@/components/admin/assets-manager";
import { PagesManager } from "@/components/admin/pages-manager";
import type { AssetWithDetails, PageWithImages } from "@/types";
import type { Categoria } from "@/lib/constants";

export type AtivosTab = "BMS" | "PAGINAS" | "PERFIS";

/**
 * Hub da aba "Ativos": sub-abas BMs / Páginas / Perfis (estilo landing).
 * Cada sub-aba reaproveita o manager existente; Perfis usa o mesmo de Páginas
 * com categoria="PERFIL".
 */
export function AtivosHub({
  assets,
  order,
  paginas,
  perfis,
  initialTab = "BMS",
}: {
  assets: AssetWithDetails[];
  order: Categoria[];
  paginas: PageWithImages[];
  perfis: PageWithImages[];
  initialTab?: AtivosTab;
}) {
  const [tab, setTab] = React.useState<AtivosTab>(initialTab);

  const tabs = [
    { value: "BMS", label: "BMs", Icon: Boxes, count: assets.length },
    { value: "PAGINAS", label: "Páginas", Icon: FileText, count: paginas.length },
    { value: "PERFIS", label: "Perfis", Icon: AtSign, count: perfis.length },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="inline-flex max-w-full overflow-x-auto rounded-xl border border-border bg-card p-1 shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((t) => {
          const active = tab === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              aria-pressed={active}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <t.Icon className="h-4 w-4" />
              {t.label}
              <span className="rounded bg-background/60 px-1.5 text-xs tabular-nums">
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      {tab === "BMS" ? (
        <AssetsManager assets={assets} order={order} />
      ) : tab === "PAGINAS" ? (
        <PagesManager pages={paginas} categoria="PAGINA" />
      ) : (
        <PagesManager pages={perfis} categoria="PERFIL" />
      )}
    </div>
  );
}
