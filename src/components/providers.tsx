"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";

import { ThemeProvider } from "@/components/theme/theme-provider";

/** Providers globais do app (tema + sessão NextAuth) no lado do cliente. */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem={false}
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
