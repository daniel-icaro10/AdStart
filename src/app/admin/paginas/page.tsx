import { redirect } from "next/navigation";

// Páginas agora vivem dentro da aba "Ativos" (sub-aba Páginas).
export default function AdminPaginasPage() {
  redirect("/admin/ativos?tab=paginas");
}
