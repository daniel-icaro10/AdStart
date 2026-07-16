import { SectionTitle } from "@/components/ui/ds/section-title";
import { FinanceiroNav } from "@/components/admin/financeiro/financeiro-nav";
import { CustosTableClient } from "@/components/admin/financeiro/custos-table-client";
import { getCustosSerializados } from "@/lib/financeiro";

export const dynamic = "force-dynamic";

export default async function FinanceiroCustosPage() {
  const custos = await getCustosSerializados();

  return (
    <div className="space-y-6">
      <SectionTitle
        as="h1"
        size="l"
        description="Despesas que não são compra de ativo (proxies, ferramentas, tráfego…) e impactam o lucro real do período."
      >
        Custos operacionais
      </SectionTitle>

      <FinanceiroNav />
      <CustosTableClient custos={custos} />
    </div>
  );
}
