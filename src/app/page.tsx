import { Hero } from "@/components/landing/hero";
import { CatalogTabs } from "@/components/landing/catalog-tabs";
import { HowToBuy } from "@/components/landing/how-to-buy";
import { Footer } from "@/components/landing/footer";
import { getCatalogAssets, getVendidosAssets } from "@/lib/assets";
import { getCatalogPages } from "@/lib/pages";
import { getActiveRentalPlans } from "@/lib/rentals";
import { getCategoryOrder } from "@/lib/settings";

// Sempre renderiza com dados frescos do banco (catálogo muda com frequência).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [assets, pages, perfis, vendidosAssets, rentals, order] =
    await Promise.all([
      getCatalogAssets(),
      getCatalogPages("PAGINA"),
      getCatalogPages("PERFIL"),
      getVendidosAssets(),
      getActiveRentalPlans(),
      getCategoryOrder(),
    ]);

  return (
    // "dark" fixo: a landing é sempre escura e não deve reagir ao toggle
    // claro/escuro do admin (que marca <html> globalmente via next-themes).
    <main className="dark min-h-screen">
      <Hero />

      <CatalogTabs
        assets={assets}
        pages={pages}
        perfis={perfis}
        vendidosAssets={vendidosAssets}
        rentals={rentals}
        order={order}
      />

      <HowToBuy />
      <Footer />
    </main>
  );
}
