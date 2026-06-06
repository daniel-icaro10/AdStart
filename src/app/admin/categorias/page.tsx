import { CategoryOrderEditor } from "@/components/admin/category-order-editor";
import { getCategoryOrder } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminCategoriasPage() {
  const order = await getCategoryOrder();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Categorias</h1>
        <p className="text-sm text-muted-foreground">
          Arraste para definir a ordem em que as colunas aparecem na landing.
        </p>
      </div>

      <CategoryOrderEditor initial={order} />
    </div>
  );
}
