import { AssetsManager } from "@/components/admin/assets-manager";
import { getAdminAssets } from "@/lib/assets";
import { getCategoryOrder } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function AdminAtivosPage() {
  const [assets, order] = await Promise.all([
    getAdminAssets(),
    getCategoryOrder(),
  ]);
  return <AssetsManager assets={assets} order={order} />;
}
