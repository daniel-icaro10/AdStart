import { AlugueisHub, type AlugueisTab } from "@/components/admin/alugueis-hub";
import { getAdminRentalPlans } from "@/lib/rentals";
import { getAdminClients } from "@/lib/clients";

export const dynamic = "force-dynamic";

export default async function AdminAlugueisPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const [plans, clients] = await Promise.all([
    getAdminRentalPlans(),
    getAdminClients(),
  ]);

  const initialTab: AlugueisTab =
    searchParams.tab === "clientes" ? "CLIENTES" : "PLANOS";

  return <AlugueisHub plans={plans} clients={clients} initialTab={initialTab} />;
}
