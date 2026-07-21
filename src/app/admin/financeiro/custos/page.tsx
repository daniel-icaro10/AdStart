import { FinanceiroNav } from "@/components/admin/financeiro/financeiro-nav";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CustosTableClient } from "@/components/admin/financeiro/custos-table-client";
import { getCustosSerializados } from "@/lib/financeiro";

export const dynamic = "force-dynamic";

export default async function FinanceiroCustosPage() {
  const custos = await getCustosSerializados();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Custos operacionais"
        description="Despesas que não são compra de ativo (proxies, ferramentas, tráfego…) e impactam o lucro real do período."
      />

      <FinanceiroNav />
      <CustosTableClient custos={custos} />
    </div>
  );
}
