import { RentalsManager } from "@/components/admin/rentals-manager";
import { getAdminRentalPlans } from "@/lib/rentals";

export const dynamic = "force-dynamic";

export default async function AdminAlugueisPage() {
  const plans = await getAdminRentalPlans();
  return <RentalsManager plans={plans} />;
}
