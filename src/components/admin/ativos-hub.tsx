"use client";

import * as React from "react";
import { Boxes, FileText, AtSign, Wallet, Download } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AssetsManager } from "@/components/admin/assets-manager";
import { PagesManager } from "@/components/admin/pages-manager";
import { AssetsFilters } from "@/components/admin/financeiro/assets-filters";
import { AssetsTableClient } from "@/components/admin/financeiro/assets-table-client";
import type { AssetWithDetails, PageWithImages } from "@/types";
import type { Categoria } from "@/lib/constants";
import type { AtivosPageResult } from "@/lib/financeiro";

export type AtivosTab = "BMS" | "PAGINAS" | "PERFIS" | "FINANCEIRO";

/**
 * Hub da aba "Ativos": sub-abas BMs / Páginas / Perfis / Financeiro.
 * Financeiro traz a tabela completa (custo, margem, venda/perda) que antes
 * vivia em /admin/financeiro/ativos — tudo de ativo num lugar só.
 */
export function AtivosHub({
  assets,
  order,
  paginas,
  perfis,
  financeiro,
  fornecedores,
  initialTab = "BMS",
}: {
  assets: AssetWithDetails[];
  order: Categoria[];
  paginas: PageWithImages[];
  perfis: PageWithImages[];
  financeiro: AtivosPageResult;
  fornecedores: string[];
  initialTab?: AtivosTab;
}) {
  const [tab, setTab] = React.useState<AtivosTab>(initialTab);

  const tabs = [
    { value: "BMS", label: "BMs", Icon: Boxes, count: assets.length },
    { value: "PAGINAS", label: "Páginas", Icon: FileText, count: paginas.length },
    { value: "PERFIS", label: "Perfis", Icon: AtSign, count: perfis.length },
    {
      value: "FINANCEIRO",
      label: "Financeiro",
      Icon: Wallet,
      count: financeiro.total,
    },
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
      ) : tab === "PERFIS" ? (
        <PagesManager pages={perfis} categoria="PERFIL" />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Financeiro dos ativos
              </h1>
              <p className="text-sm text-muted-foreground">
                Custo, margem prevista, dias em estoque e registro de
                venda/perda.
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <a href="/admin/financeiro/export?tipo=ativos">
                <Download className="h-4 w-4" />
                Exportar CSV
              </a>
            </Button>
          </div>

          <AssetsFilters fornecedores={fornecedores} />
          <AssetsTableClient
            items={financeiro.items}
            page={financeiro.page}
            totalPages={financeiro.totalPages}
            total={financeiro.total}
          />
        </div>
      )}
    </div>
  );
}
