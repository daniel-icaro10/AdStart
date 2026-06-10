import { FinanceiroNav } from "@/components/admin/financeiro/financeiro-nav";
import { CustosTableClient } from "@/components/admin/financeiro/custos-table-client";
import { TaxaCambioForm } from "@/components/admin/financeiro/taxa-cambio-form";
import { getCustosSerializados, getTaxaAtual } from "@/lib/financeiro";

export const dynamic = "force-dynamic";

export default async function FinanceiroCustosPage() {
  const [custos, taxa] = await Promise.all([
    getCustosSerializados(),
    getTaxaAtual(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Custos operacionais
        </h1>
        <p className="text-sm text-muted-foreground">
          Despesas que não são compra de ativo (proxies, ferramentas, tráfego…)
          e impactam o lucro real do período.
        </p>
      </div>

      <FinanceiroNav />
      <div className="max-w-md">
        <TaxaCambioForm taxaAtual={taxa} />
      </div>
      <CustosTableClient custos={custos} />
    </div>
  );
}
