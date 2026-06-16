import { AtivosHub, type AtivosTab } from "@/components/admin/ativos-hub";
import { getAdminAssets } from "@/lib/assets";
import { getAdminPages } from "@/lib/pages";
import { getCategoryOrder } from "@/lib/settings";

export const dynamic = "force-dynamic";

const TAB_MAP: Record<string, AtivosTab> = {
  paginas: "PAGINAS",
  perfis: "PERFIS",
  bms: "BMS",
};

export default async function AdminAtivosPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const [assets, order, paginas, perfis] = await Promise.all([
    getAdminAssets(),
    getCategoryOrder(),
    getAdminPages("PAGINA"),
    getAdminPages("PERFIL"),
  ]);

  const initialTab = TAB_MAP[searchParams.tab ?? ""] ?? "BMS";

  return (
    <AtivosHub
      assets={assets}
      order={order}
      paginas={paginas}
      perfis={perfis}
      initialTab={initialTab}
    />
  );
}
