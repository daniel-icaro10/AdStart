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
      <div aria-hidden className="ad-landing-mark-bg pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="ad-float pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-brand/20 blur-3xl"
      />
      <div
        aria-hidden
        className="ad-float pointer-events-none absolute -left-16 bottom-0 h-72 w-72 rounded-full bg-brand/10 blur-3xl [animation-delay:-3.5s]"
      />

      <div className="container relative flex flex-col">
        <nav className="flex items-start justify-end gap-3 pt-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button asChild variant="whatsapp" size="sm">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            </Button>
          </div>
        </nav>

        {/* conteúdo central: tudo nasce da linha — o grupo de cima sobe, o de baixo desce */}
        <div className="flex flex-col items-center py-10 text-center sm:py-16">
          {/* grupo de cima: logo + tagline, sobem a partir da linha */}
          <div className="flex flex-col items-center">
            <Image
              src="/logo-white.png"
              alt="Startfy"
              width={1774}
              height={887}
              priority
              className="ad-rise-up h-20 w-auto sm:h-28 [animation-delay:300ms]"
            />
            <p className="ad-rise-up mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground [animation-delay:420ms] sm:text-sm">
              Ativos · BM · Perfil · Página
            </p>
          </div>

          {/* linha central: nasce no meio e cresce pros dois lados; tudo mais surge a partir dela */}
          <span
            aria-hidden
            className="ad-split-line mt-10 h-px w-full max-w-xl bg-border"
          />

          {/* grupo de baixo: conceitos, descem a partir da linha */}
          <div className="mt-10 flex flex-wrap items-start justify-center gap-x-8 gap-y-6 sm:gap-x-12">
            {CONCEITOS.map((c, i) => (
              <div
                key={c.label}
                className="ad-fall-down flex flex-col items-center gap-2"
                style={{ animationDelay: `${400 + i * 110}ms` }}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-primary">
                  <c.Icon className="h-5 w-5" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {c.label}
                </span>
              </div>
            ))}
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
