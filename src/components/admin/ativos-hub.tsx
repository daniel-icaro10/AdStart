"use client";

import * as React from "react";
import {
  Boxes,
  FileText,
  AtSign,
  Wallet,
  Download,
  Bell,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdminTabBar } from "@/components/admin/admin-tab-bar";
import { AdminHero, type AdminHeroStat } from "@/components/admin/admin-hero";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AssetsManager } from "@/components/admin/assets-manager";
import { PagesManager } from "@/components/admin/pages-manager";
import { AssetsFilters } from "@/components/admin/financeiro/assets-filters";
import { AssetsTableClient } from "@/components/admin/financeiro/assets-table-client";
import type { AssetWithDetails, PageWithImages } from "@/types";
import type { Categoria } from "@/lib/constants";
import type { AtivosPageResult } from "@/lib/financeiro";

export type AtivosTab = "DISPONIVEIS" | "BMS" | "PAGINAS" | "PERFIS" | "FINANCEIRO";

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
  initialTab = "DISPONIVEIS",
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

  const disponiveis = React.useMemo(
    () => assets.filter((a) => a.statusVenda === "DISPONIVEL"),
    [assets],
  );

  const tabs = [
    {
      value: "DISPONIVEIS",
      label: "Disponíveis",
      Icon: CheckCircle2,
      count: disponiveis.length,
    },
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

  const heroStats: AdminHeroStat[] = [
    { label: "BMs em catálogo", value: String(assets.length), tone: "neutral" },
    { label: "Páginas", value: String(paginas.length), tone: "neutral" },
    { label: "Perfis", value: String(perfis.length), tone: "neutral" },
    { label: "Itens no financeiro", value: String(financeiro.total), tone: "neutral" },
  ];

  return (
    <div className="space-y-6">
      <AdminHero
        title="Ativos"
        description="BMs, páginas e perfis em catálogo."
        stats={heroStats}
        action={{ label: "Ver alertas", href: "/admin#alertas", icon: Bell }}
      />

      <AdminTabBar
        items={tabs.map((t) => ({
          key: t.value,
          label: t.label,
          icon: t.Icon,
          count: t.count,
          active: tab === t.value,
          onClick: () => setTab(t.value),
        }))}
      />

      {tab === "DISPONIVEIS" ? (
        <AssetsManager assets={disponiveis} order={order} />
      ) : tab === "BMS" ? (
        <AssetsManager assets={assets} order={order} />
      ) : tab === "PAGINAS" ? (
        <PagesManager pages={paginas} categoria="PAGINA" />
      ) : tab === "PERFIS" ? (
        <PagesManager pages={perfis} categoria="PERFIL" />
      ) : (
        <div className="space-y-6">
          <AdminPageHeader
            title="Financeiro dos ativos"
            description="Custo, margem prevista, dias em estoque e registro de venda/perda."
            actions={
              <Button asChild variant="outline" size="sm">
                <a href="/admin/financeiro/export?tipo=ativos">
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </a>
              </Button>
            }
          />

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
