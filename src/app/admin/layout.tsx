import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { AdminShell } from "@/components/admin/admin-shell";

// Render dinâmico: a sessão é checada a cada request.
export const dynamic = "force-dynamic";

/**
 * Layout das rotas /admin/*.
 * O middleware.ts já barra acesso sem sessão, mas reforçamos aqui no servidor
 * (defesa em profundidade) e obtemos os dados do usuário para o header.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <AdminShell
      userName={session.user.name ?? "Administrador"}
      userEmail={session.user.email ?? ""}
    >
      {children}
    </AdminShell>
  );
}
