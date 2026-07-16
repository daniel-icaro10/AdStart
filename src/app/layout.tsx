import type { Metadata } from "next";
import { Inter, Archivo } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { Providers } from "@/components/providers";
import { siteConfig } from "@/lib/config";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Fontes do design system v2 (DESIGN.md §3) — carregadas e disponíveis via
// CSS var, mas AINDA NÃO usadas em nenhum componente (body segue em Inter/
// font-sans). GeistSans/GeistMono já vêm instanciadas pelo pacote `geist`,
// com --font-geist-sans/--font-geist-mono como variable padrão.
const archivo = Archivo({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${siteConfig.agencyName} — Catálogo de BMs`,
  description:
    "Contas de anúncio (Business Managers) verificadas, sem dívidas e sem bloqueios. Entrega rápida e atendimento via WhatsApp.",
  icons: { icon: "/icon.png", apple: "/icon.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${archivo.variable} ${GeistSans.variable} ${GeistMono.variable} font-sans`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
