import { redirect } from "next/navigation";

// Clientes agora vivem dentro da aba "Aluguéis" (sub-aba Clientes).
export default function AdminClientesPage() {
  redirect("/admin/alugueis?tab=clientes");
}
