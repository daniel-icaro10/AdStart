import Link from "next/link";
import { Plus, Receipt, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Atalhos rápidos de ação no topo do dashboard. */
export function DashboardAtalhos() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild>
        <Link href="/admin/ativos">
          <Plus className="h-4 w-4" />
          Novo ativo
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/admin/financeiro/custos">
          <Receipt className="h-4 w-4" />
          Lançar custo
        </Link>
      </Button>
      <Button asChild variant="outline">
        <Link href="/admin/financeiro">
          <Wallet className="h-4 w-4" />
          Financeiro
        </Link>
      </Button>
    </div>
  );
}
