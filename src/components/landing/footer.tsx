import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Instagram, Users } from "lucide-react";

import { siteConfig, buildWhatsappLink } from "@/lib/config";
import { formatCurrency } from "@/lib/format";

/** Rodapé com contatos, cotação do dia (DESIGN.md §7) e link discreto para a área admin. */
export function Footer({ taxaCambio }: { taxaCambio: number }) {
  const whatsappLink = buildWhatsappLink(
    "Olá! Quero falar sobre as BMs do catálogo.",
  );

  return (
    <footer className="border-t border-border">
      <div className="container flex flex-col items-center justify-between gap-6 py-10 sm:flex-row">
        <Link
          href="/"
          aria-label={siteConfig.agencyName}
          className="inline-flex items-center rounded-xl bg-white/90 px-3 py-2 shadow-sm ring-1 ring-black/5"
        >
          <Image
            src="/logo.png"
            alt={siteConfig.agencyName}
            width={1104}
            height={366}
            className="h-7 w-auto"
          />
        </Link>

        <div className="flex items-center gap-2">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border transition-colors hover:bg-accent"
            aria-label="WhatsApp"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
          {siteConfig.instagramUrl && (
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border transition-colors hover:bg-accent"
              aria-label="Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
          )}
          {siteConfig.communityUrl && (
            <a
              href={siteConfig.communityUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-border transition-colors hover:bg-accent"
              aria-label="Comunidade"
            >
              <Users className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>

      <div className="border-t border-ds-border-soft">
        <div className="container flex flex-col items-center justify-center gap-1 py-4 text-center font-ds-sans text-xs">
          <span className="text-ds-text-faint">
            Cotação de hoje: {formatCurrency(taxaCambio, "BRL")}
          </span>
          <span className="text-muted-foreground">
            © {new Date().getFullYear()} {siteConfig.agencyName}. Todos os
            direitos reservados.
          </span>
        </div>
      </div>
    </footer>
  );
}
