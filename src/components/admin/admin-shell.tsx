import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";

interface AdminShellProps {
  userEmail: string;
  userRole: string;
  children: React.ReactNode;
}

/**
 * Layout base do admin: sidebar fixa + header + área de conteúdo.
 * Novas sub-rotas renderizam dentro de {children} sem repetir o chrome.
 */
export function AdminShell({ userEmail, userRole, children }: AdminShellProps) {
  return (
    <div className="admin-theme flex min-h-screen bg-background text-foreground">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader userEmail={userEmail} userRole={userRole} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
