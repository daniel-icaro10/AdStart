import { CategoryOrderEditor } from "@/components/admin/category-order-editor";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { getCategoryOrder } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminCategoriasPage() {
  const order = await getCategoryOrder();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Categorias"
        description="Arraste para definir a ordem em que as colunas aparecem na landing."
      />

      <CategoryOrderEditor initial={order} />
    </div>
  );
}
