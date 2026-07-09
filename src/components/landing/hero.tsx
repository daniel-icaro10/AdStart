import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildWhatsappLink } from "@/lib/config";

/**
 * Banner translúcido do topo:
 * - imagem de fundo (public/banner.png) com camada escura semitransparente;
 * - logo (public/logo.png) num chip claro no canto superior esquerdo;
 * - tema / área admin / WhatsApp no canto superior direito.
 * Logo abaixo deste banner já começam os ativos (catálogo).
 */
export function Hero() {
  const whatsappLink = buildWhatsappLink(
    "Olá! Vim pelo catálogo e quero saber mais sobre as BMs disponíveis.",
  );

  return (
    <header className="relative h-40 overflow-hidden border-b border-border sm:h-52">
      {/* imagem de fundo */}
      <Image
        src="/banner.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        aria-hidden
      />
      {/* camadas translúcidas para legibilidade no tema escuro */}
      <div
        aria-hidden
        className="absolute inset-0 bg-background/75 backdrop-blur-[1px] dark:bg-background/70"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/55 to-background/90"
      />

      {/* glow azul flutuante */}
      <div
        aria-hidden
        className="ad-float pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-brand/20 blur-3xl"
      />

      {/* conteúdo (nav fixa no topo do banner) */}
      <div className="container relative flex h-full flex-col">
        <nav className="flex items-start justify-between gap-3 pt-4">
          <Link
            href="/"
            aria-label="adStart — início"
            className="inline-flex items-center rounded-xl bg-white/90 px-3 py-2 shadow-sm ring-1 ring-black/5 backdrop-blur transition-transform hover:scale-[1.02]"
          >
            <Image
              src="/logo.png"
              alt="adStart"
              width={1104}
              height={366}
              priority
              className="h-7 w-auto sm:h-8"
            />
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button asChild variant="whatsapp" size="sm">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </Button>
          </div>
        </nav>
      </div>

      {/* linha de degradê da marca na base do banner */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-fuchsia-500 via-sky-500 to-violet-500"
      />
    </header>
  );
}
