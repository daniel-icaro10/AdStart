"use client";

import * as React from "react";
import Image from "next/image";
import { BadgeCheck, KeyRound, AtSign, type LucideIcon } from "lucide-react";

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
 * Seletor no topo do catálogo da landing: alterna entre exibir somente as BMs
 * (board por categoria) ou somente as Páginas. Segmented control moderno, com
 * pílula deslizante animada; lembra a última aba via localStorage.
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

  const tabs: { value: View; label: string; img?: string; Icon?: LucideIcon }[] =
    [
      { value: "BMS", label: "BMs", img: "/icon-bm.png" },
      { value: "PAGINAS", label: "Páginas", img: "/icon-paginas.png" },
      { value: "PERFIS", label: "Perfis", Icon: AtSign },
      { value: "ALUGUEIS", label: "Aluguéis", Icon: KeyRound },
      { value: "VENDIDOS", label: "Vendidos", Icon: BadgeCheck },
    ];

  const activeIndex = VIEWS.indexOf(view);

  return (
    <section id="catalogo" className="container pt-8 pb-16 sm:pt-10 sm:pb-20">
      {/* seletor moderno BMs / Páginas / Vendidos / Aluguéis */}
      <div className="mb-8 -mx-4 flex justify-start overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:justify-center sm:px-0">
        <div className="relative inline-flex shrink-0 rounded-full border border-border bg-card/80 p-1 shadow-sm backdrop-blur">
          {/* pílula deslizante */}
          <span
            aria-hidden
            className="absolute left-1 top-1 bottom-1 w-[92px] rounded-full bg-primary shadow-[0_6px_24px_-6px_rgb(var(--brand)/0.8)] transition-transform duration-300 ease-out sm:w-[124px]"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          />
          {tabs.map((t) => {
            const active = view === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => select(t.value)}
                aria-pressed={active}
                className={cn(
                  "relative z-10 inline-flex w-[92px] shrink-0 items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition-colors sm:w-[124px]",
                  active
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t.img ? (
                  <Image
                    src={t.img}
                    alt=""
                    width={32}
                    height={32}
                    className={cn(
                      "object-contain",
                      t.value === "PAGINAS" ? "h-8 w-8" : "h-5 w-5",
                    )}
                  />
                ) : t.Icon ? (
                  <t.Icon className="h-5 w-5" />
                ) : null}
                {t.label}
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
