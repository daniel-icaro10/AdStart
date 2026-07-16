"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { CatalogExplorer } from "./catalog-explorer";
import { PagesSection } from "./pages-section";
import { VendidosSection } from "./vendidos-section";
import { RentalsSection } from "./rentals-section";
import type { Categoria } from "@/lib/constants";
import type { AssetWithContas } from "@/types";
import type { PagePublic } from "@/types";
import type { RentalPlan } from "@prisma/client";

type View = "BMS" | "PAGINAS" | "PERFIS" | "VENDIDOS" | "ALUGUEIS";

const STORAGE_KEY = "adstart:catalog-view";

const VIEWS: View[] = ["BMS", "PAGINAS", "PERFIS", "ALUGUEIS", "VENDIDOS"];

/**
 * Tabs de segmento no topo do catálogo (DESIGN.md §5.3): navegação, não
 * decoração — cada aba mostra a contagem real e a ativa tem estado visível
 * (fundo --ds-surface-2 + indicador inferior --ds-accent). Lembra a última
 * aba via localStorage.
 */
export function CatalogTabs({
  assets,
  pages,
  perfis,
  vendidosAssets,
  rentals,
  order,
}: {
  assets: AssetWithContas[];
  pages: PagePublic[];
  perfis: PagePublic[];
  vendidosAssets: AssetWithContas[];
  rentals: RentalPlan[];
  order?: Categoria[];
}) {
  const [view, setView] = React.useState<View>("BMS");

  // Restaura a aba escolhida anteriormente.
  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (VIEWS as string[]).includes(saved)) setView(saved as View);
  }, []);

  const select = (v: View) => {
    setView(v);
    localStorage.setItem(STORAGE_KEY, v);
  };

  const tabs: { value: View; label: string; count: number }[] = [
    { value: "BMS", label: "BMs", count: assets.length },
    { value: "PAGINAS", label: "Páginas", count: pages.length },
    { value: "PERFIS", label: "Perfis", count: perfis.length },
    { value: "ALUGUEIS", label: "Aluguéis", count: rentals.length },
    { value: "VENDIDOS", label: "Vendidos", count: vendidosAssets.length },
  ];

  return (
    <section id="catalogo" className="container pt-8 pb-16 sm:pt-10 sm:pb-20">
      {/* tabs de segmento: BMs · Páginas · Perfis · Aluguéis · Vendidos */}
      <div className="mb-8 -mx-4 flex justify-start overflow-x-auto border-b border-ds-border-soft px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:justify-center sm:px-0">
        <div className="flex shrink-0">
          {tabs.map((t) => {
            const active = view === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => select(t.value)}
                aria-pressed={active}
                className={cn(
                  "relative shrink-0 whitespace-nowrap px-4 py-3 font-ds-sans text-sm font-medium transition-colors",
                  active
                    ? "bg-ds-surface-2 text-ds-text"
                    : "text-ds-text-muted hover:text-ds-text",
                )}
              >
                {t.label}
                <span
                  className={cn(
                    "ml-1.5 font-ds-mono tabular-nums",
                    active ? "text-ds-text-muted" : "text-ds-text-faint",
                  )}
                >
                  ({t.count})
                </span>
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-ds-accent"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {view === "BMS" ? (
        <CatalogExplorer assets={assets} order={order} />
      ) : view === "PAGINAS" ? (
        <PagesSection pages={pages} />
      ) : view === "PERFIS" ? (
        <PagesSection pages={perfis} variant="perfil" />
      ) : view === "VENDIDOS" ? (
        <VendidosSection assets={vendidosAssets} />
      ) : (
        <RentalsSection plans={rentals} />
      )}
    </section>
  );
}
