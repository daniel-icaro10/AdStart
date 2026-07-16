import { Hero } from "@/components/landing/hero";
import { CatalogTabs } from "@/components/landing/catalog-tabs";
import { HowToBuy } from "@/components/landing/how-to-buy";
import { Footer } from "@/components/landing/footer";
import { getCatalogAssets, getVendidosAssets } from "@/lib/assets";
import { getCatalogPages } from "@/lib/pages";
import { getActiveRentalPlans } from "@/lib/rentals";
import { getCategoryOrder } from "@/lib/settings";
import { getTaxaAtual } from "@/lib/financeiro";

// Sempre renderiza com dados frescos do banco (catálogo muda com frequência).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [assets, pages, perfis, vendidosAssets, rentals, order, taxaCambio] =
    await Promise.all([
      getCatalogAssets(),
      getCatalogPages("PAGINA"),
      getCatalogPages("PERFIL"),
      getVendidosAssets(),
      getActiveRentalPlans(),
      getCategoryOrder(),
      getTaxaAtual(),
    ]);

  // Gasto histórico somado do catálogo (DESIGN.md §5.4): BRL + USD convertido
  // pela cotação do dia, somando também as já vendidas (histórico real).
  const gastoHistoricoBRL = [...assets, ...vendidosAssets].reduce(
    (sum, a) => sum + (a.totalGastosBRL ?? 0) + (a.totalGastosUSD ?? 0) * taxaCambio,
    0,
  );

  return (
    <main className="min-h-screen">
      <Hero
        stats={{
          bmsDisponiveis: assets.filter((a) => a.statusVenda === "DISPONIVEL")
            .length,
          gastoHistoricoBRL,
          bmsVendidas: vendidosAssets.length,
        }}
      />

      <CatalogTabs
        assets={assets}
        pages={pages}
        perfis={perfis}
        vendidosAssets={vendidosAssets}
        rentals={rentals}
        order={order}
      />

      <HowToBuy />
      <Footer taxaCambio={taxaCambio} />
    </main>
  );
}
