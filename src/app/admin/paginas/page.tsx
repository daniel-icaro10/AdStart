import { PagesManager } from "@/components/admin/pages-manager";
import { getAdminPages } from "@/lib/pages";

export const dynamic = "force-dynamic";

export default async function AdminPaginasPage() {
  const pages = await getAdminPages();
  return <PagesManager pages={pages} />;
}
