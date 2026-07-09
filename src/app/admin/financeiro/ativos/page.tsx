import { redirect } from "next/navigation";

// A tabela financeira dos ativos agora vive na aba Ativos (sub-aba Financeiro).
export default function FinanceiroAtivosPage() {
  redirect("/admin/ativos?tab=financeiro");
}
