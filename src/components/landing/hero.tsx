import Link from "next/link";
import Image from "next/image";
import {
  MessageCircle,
  ArrowUpRight,
  Shield,
  Handshake,
  Tag,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildWhatsappLink } from "@/lib/config";

const CONCEITOS: { label: string; Icon: LucideIcon }[] = [
  { label: "Crescimento", Icon: ArrowUpRight },
  { label: "Proteção", Icon: Shield },
  { label: "Confiança", Icon: Handshake },
  { label: "Negócios", Icon: Tag },
];

/**
 * Hero da landing: sem imagem de fundo — fundo gerado em CSS (grid sutil +
 * glows) para não depender de arte externa. Logo, headline e os 4 conceitos
 * são texto/SVG "de verdade" (não pixels), cada um com entrada animada em
 * sequência (animate-fade-in + delay escalonado).
 */
export function Hero() {
  const whatsappLink = buildWhatsappLink(
    "Olá! Vim pelo catálogo e quero saber mais sobre as BMs disponíveis.",
  );

  return (
    <header className="relative overflow-hidden border-b border-border">
      {/* fundo: grid sutil + glows da marca (sem imagem) */}
      <div aria-hidden className="ad-hero-grid pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="ad-float pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-brand/20 blur-3xl"
      />
      <div
        aria-hidden
        className="ad-float pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-brand/10 blur-3xl [animation-delay:-3.5s]"
      />

      <div className="container relative flex flex-col">
        <nav className="flex items-start justify-between gap-3 pt-4">
          <Link
            href="/"
            aria-label="Startfy — início"
            className="inline-flex items-center transition-transform hover:scale-[1.02]"
          >
            <Image
              src="/logo-white.png"
              alt="Startfy"
              width={1774}
              height={887}
              priority
              className="h-9 w-auto sm:h-11"
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

        {/* conteúdo central: logo grande + mensagem + conceitos, cada um animando em sequência */}
        <div className="flex flex-col items-center py-10 text-center sm:py-16">
          <Image
            src="/logo-white.png"
            alt="Startfy"
            width={1774}
            height={887}
            className="animate-fade-in h-16 w-auto sm:h-20"
          />

          <p
            className="animate-fade-in mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground [animation-delay:150ms] [animation-fill-mode:both] sm:text-sm"
          >
            Ativos · BM · Perfil · Página
          </p>

          <h1
            className="ad-text-gradient animate-fade-in mt-3 max-w-2xl text-2xl font-extrabold leading-tight [animation-delay:280ms] [animation-fill-mode:both] sm:text-4xl"
          >
            Venda com segurança, resultados que ficam.
          </h1>

          {/* "CONCEITO": as duas linhas nascem no centro e crescem cada uma pro seu lado */}
          <div
            className="mt-10 flex w-full max-w-xl items-center gap-4 [animation-delay:420ms]"
          >
            <span
              aria-hidden
              className="ad-split-line h-px flex-1 origin-right bg-border [animation-delay:420ms]"
            />
            <span className="animate-fade-in shrink-0 text-xs font-semibold uppercase tracking-[0.25em] text-faint [animation-delay:420ms] [animation-fill-mode:both]">
              Conceito
            </span>
            <span
              aria-hidden
              className="ad-split-line h-px flex-1 origin-left bg-border [animation-delay:420ms]"
            />
          </div>

          {/* conceitos: a metade esquerda entra vindo do centro pra esquerda, a direita o oposto */}
          <div className="mt-6 flex flex-wrap items-start justify-center gap-x-8 gap-y-6 sm:gap-x-12">
            {CONCEITOS.map((c, i) => {
              const half = i < CONCEITOS.length / 2 ? "ad-split-left" : "ad-split-right";
              // distância até o centro do grupo: os do meio "nascem" primeiro, os das pontas depois.
              const distanceFromCenter = Math.abs(i - (CONCEITOS.length - 1) / 2);
              return (
                <div
                  key={c.label}
                  className={`${half} flex flex-col items-center gap-2`}
                  style={{ animationDelay: `${600 + distanceFromCenter * 90}ms` }}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-primary">
                    <c.Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {c.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* linha de degradê da marca na base do banner */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-fuchsia-500 via-sky-500 to-violet-500"
      />
    </header>
  );
}
