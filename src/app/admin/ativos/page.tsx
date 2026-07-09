import { AtivosHub, type AtivosTab } from "@/components/admin/ativos-hub";
import { getAdminAssets } from "@/lib/assets";
import { getAdminPages } from "@/lib/pages";
import { getCategoryOrder } from "@/lib/settings";
import {
  getAtivosFinanceirosPaginados,
  getFornecedores,
} from "@/lib/financeiro";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const TAB_MAP: Record<string, AtivosTab> = {
  paginas: "PAGINAS",
  perfis: "PERFIS",
  financeiro: "FINANCEIRO",
  bms: "BMS",
};

export default async function AdminAtivosPage({
  searchParams,
}: {
  searchParams: {
    tab?: string;
    q?: string;
    status?: string;
    tipo?: string;
    origem?: string;
    fornecedor?: string;
    page?: string;
  };
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);

  const [assets, order, paginas, perfis, financeiro, fornecedores] =
    await Promise.all([
      getAdminAssets(),
      getCategoryOrder(),
      getAdminPages("PAGINA"),
      getAdminPages("PERFIL"),
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

  const initialTab = TAB_MAP[searchParams.tab ?? ""] ?? "BMS";

  return (
    <AtivosHub
      assets={assets}
      order={order}
      paginas={paginas}
      perfis={perfis}
      financeiro={financeiro}
      fornecedores={fornecedores}
      initialTab={initialTab}
    />
  );
}
