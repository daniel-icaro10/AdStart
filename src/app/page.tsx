import { Hero } from "@/components/landing/hero";
import { CatalogTabs } from "@/components/landing/catalog-tabs";
import { HowToBuy } from "@/components/landing/how-to-buy";
import { Footer } from "@/components/landing/footer";
import { getCatalogAssets } from "@/lib/assets";
import { getCatalogPages } from "@/lib/pages";
import { getCategoryOrder } from "@/lib/settings";

// Sempre renderiza com dados frescos do banco (catálogo muda com frequência).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [assets, pages, order] = await Promise.all([
    getCatalogAssets(),
    getCatalogPages(),
    getCategoryOrder(),
  ]);

  return (
    <main className="min-h-screen">
      <Hero />

      <CatalogTabs assets={assets} pages={pages} order={order} />

      <HowToBuy />
      <Footer />
    </main>
  );
}
