"use client";

import * as React from "react";

interface AdminSidebarContextValue {
  /** Sidebar recolhida ao modo ícone no desktop (equivalente ao "sidebarToggle" do TailAdmin). */
  collapsed: boolean;
  toggleCollapsed: () => void;
}

const AdminSidebarContext = React.createContext<AdminSidebarContextValue | null>(
  null,
);

/** Estado (expandida/colapsada) da sidebar desktop, compartilhado entre Header e Sidebar. */
export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = React.useState(false);
  const toggleCollapsed = React.useCallback(() => setCollapsed((prev) => !prev), []);

  const value = React.useMemo(
    () => ({ collapsed, toggleCollapsed }),
    [collapsed, toggleCollapsed],
  );

  return (
    <AdminSidebarContext.Provider value={value}>
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  const ctx = React.useContext(AdminSidebarContext);
  if (!ctx) {
    throw new Error("useAdminSidebar deve ser usado dentro de AdminSidebarProvider");
  }
  return ctx;
}
