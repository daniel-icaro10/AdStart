import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FinanceiroNav } from "@/components/admin/financeiro/financeiro-nav";
import { AssetsFilters } from "@/components/admin/financeiro/assets-filters";
import { AssetsTableClient } from "@/components/admin/financeiro/assets-table-client";
import {
  getAtivosFinanceirosPaginados,
  getFornecedores,
} from "@/lib/financeiro";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function FinanceiroAtivosPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    status?: string;
    tipo?: string;
    origem?: string;
    fornecedor?: string;
    page?: string;
  };
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const [result, fornecedores] = await Promise.all([
    getAtivosFinanceirosPaginados({
      q: searchParams.q,
      status: searchParams.status,
      tipo: searchParams.tipo,
      origem: searchParams.origem,
      fornecedor: searchParams.fornecedor,
      page,
      pageSize: PAGE_SIZE,
    }),
    getFornecedores(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ativos — financeiro</h1>
          <p className="text-sm text-muted-foreground">
            Custo, margem prevista, dias em estoque e registro de venda/perda.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href="/admin/financeiro/export?tipo=ativos">
            <Download className="h-4 w-4" />
            Exportar CSV
          </a>
        </Button>
      </div>

      <FinanceiroNav />
      <AssetsFilters fornecedores={fornecedores} />
      <AssetsTableClient
        items={result.items}
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
      />
    </div>
  );
}
