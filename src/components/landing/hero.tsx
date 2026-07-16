import Link from "next/link";
import Image from "next/image";
import { MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/ds/button";
import { SectionTitle } from "@/components/ui/ds/section-title";
import { buildWhatsappLink } from "@/lib/config";
import { formatCompact, formatInt } from "@/lib/format";

interface HeroStats {
  bmsDisponiveis: number;
  gastoHistoricoBRL: number;
  bmsVendidas: number;
}

/**
 * Nav (logo + WhatsApp) + hero em HTML/texto puro (DESIGN.md §5.4).
 * Sem banner-imagem: carrega instantâneo e os 3 dados agregados vêm do banco
 * (nunca inventados). "Entrega média" do mockup do doc não existe como dado
 * real hoje — substituído por "BMs vendidas" (prova de giro real).
 */
export function Hero({ stats }: { stats: HeroStats }) {
  const whatsappLink = buildWhatsappLink(
    "Olá! Vim pelo catálogo e quero saber mais sobre as BMs disponíveis.",
  );

  const dados = [
    { label: "BMs disponíveis", value: formatInt(stats.bmsDisponiveis) },
    {
      label: "Gasto histórico somado",
      value: formatCompact(stats.gastoHistoricoBRL, "BRL"),
    },
    { label: "BMs vendidas", value: formatInt(stats.bmsVendidas) },
  ];

  return (
    <header className="border-b border-ds-border-soft">
      <div className="container flex items-center justify-between gap-3 py-4">
        <Link
          href="/"
          aria-label="adStart — início"
          className="inline-flex items-center rounded-xl bg-white/90 px-3 py-2 shadow-sm ring-1 ring-black/5"
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

        <Button asChild variant="whatsapp">
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </Button>
      </div>

      <div className="container py-10 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <SectionTitle as="h1" size="xl">
              Ativos de Meta Ads verificados, sem dívidas e com histórico real
            </SectionTitle>
            <p className="mt-4 max-w-prose font-ds-sans text-ds-body text-ds-text-muted">
              BMs, páginas e perfis com dados reais de gasto e dívida — sem
              letras miúdas, sem surpresa depois da compra.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="primary">
                <a href="#catalogo">Ver catálogo</a>
              </Button>
              <Button asChild variant="whatsapp">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chamar no WhatsApp
                </a>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t border-ds-border-soft pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            {dados.map((item) => (
              <div key={item.label}>
                <div className="font-ds-mono text-ds-data-lg tabular-nums text-ds-text">
                  {item.value}
                </div>
                <div className="mt-1 font-ds-sans text-ds-label uppercase text-ds-text-faint">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
