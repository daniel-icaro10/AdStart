import { ClientsManager } from "@/components/admin/clients-manager";
import { getAdminClients } from "@/lib/clients";
import { getAdminRentalPlans } from "@/lib/rentals";

export const dynamic = "force-dynamic";

export default async function AdminClientesPage() {
  const [clients, plans] = await Promise.all([
    getAdminClients(),
    getAdminRentalPlans(),
  ]);
  return <ClientsManager clients={clients} plans={plans} />;
}
