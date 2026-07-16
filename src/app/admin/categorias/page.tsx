import { SectionTitle } from "@/components/ui/ds/section-title";
import { CategoryOrderEditor } from "@/components/admin/category-order-editor";
import { getCategoryOrder } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminCategoriasPage() {
  const order = await getCategoryOrder();

  return (
    <div className="space-y-6">
      <SectionTitle
        as="h1"
        size="l"
        description="Arraste para definir a ordem em que as colunas aparecem na landing."
      >
        Categorias
      </SectionTitle>

      <CategoryOrderEditor initial={order} />
    </div>
  );
}
