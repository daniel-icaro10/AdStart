"use client";

import * as React from "react";
import { MessageCircle, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { fetchPageImagens } from "@/app/admin/actions";
import {
  PAGE_KIND_META,
  STATUS_VENDA_META,
  type StatusVenda,
} from "@/lib/constants";
import { buildWhatsappLink } from "@/lib/config";
import { formatCurrency } from "@/lib/format";
import type { PagePublic } from "@/types";

interface PageDetailModalProps {
  page: PagePublic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Modal com o conteúdo completo (texto livre) de uma Página — espelha a BM. */
export function PageDetailModal({
  page,
  open,
  onOpenChange,
}: PageDetailModalProps) {
  const [imagens, setImagens] = React.useState<string[]>([]);
  const [lightbox, setLightbox] = React.useState<string | null>(null);
  const pageId = page?.id;

  // Busca as imagens da página só quando o modal abre (mantém a listagem leve).
  React.useEffect(() => {
    let active = true;
    setImagens([]);
    setLightbox(null);
    if (open && pageId) {
      fetchPageImagens(pageId).then((imgs) => {
        if (active) setImagens(imgs);
      });
    }
    return () => {
      active = false;
    };
  }, [open, pageId]);

  // Esc fecha o lightbox (sem fechar o modal por baixo).
  React.useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        setLightbox(null);
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [lightbox]);

  if (!page) return null;

  const status = page.status as StatusVenda;
  const kindMeta = PAGE_KIND_META[page.kind as "COM" | "SEM"];
  const ehPerfil = page.categoria === "PERFIL";

  // Desconto visual: só quando o preço antigo é maior que o atual.
  const temDesconto =
    page.precoAntigo != null && page.valor > 0 && page.precoAntigo > page.valor;
  const pctDesconto = temDesconto
    ? Math.round((1 - page.valor / page.precoAntigo!) * 100)
    : 0;

  const whatsappLink = buildWhatsappLink(
    [
      `Olá! Tenho interesse ${ehPerfil ? "neste perfil" : "nesta página"} 👇`,
      "",
      `*${page.nome}*`,
      `• ${kindMeta?.label ?? page.kind}`,
      ...(page.valor > 0
        ? [
            `• Preço: ${formatCurrency(page.valor, "BRL")}${
              temDesconto && pctDesconto > 0
                ? ` (de ${formatCurrency(page.precoAntigo!, "BRL")} · -${pctDesconto}%)`
                : ""
            }`,
          ]
        : []),
      "",
      "Pode me passar mais detalhes?",
    ].join("\n"),
  );

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* dark fixo: modal é portalado pra fora do <main dark>, precisa reforçar */}
        <DialogContent className="dark">
          <DialogHeader>
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary">{kindMeta?.label ?? page.kind}</Badge>
              <Badge
                className={cn("border", STATUS_VENDA_META[status].badgeClass)}
              >
                {STATUS_VENDA_META[status].label}
              </Badge>
              {page.destaque && status !== "VENDIDO" && (
                <Badge className="border border-amber-500/30 bg-amber-500/15 text-amber-400">
                  Nova
                </Badge>
              )}
            </div>
            <DialogTitle className="mt-1">{page.nome}</DialogTitle>
          </DialogHeader>

          {/* galeria de imagens (carregadas ao abrir) */}
          {imagens.length > 0 && (
            <div
              className={cn(
                "grid gap-2",
                imagens.length === 1 ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3",
              )}
            >
              {imagens.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setLightbox(src)}
                  className="group relative overflow-hidden rounded-lg border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={`Ampliar imagem ${i + 1}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`${page.nome} — imagem ${i + 1}`}
                    className="h-40 w-full cursor-zoom-in object-cover transition-transform group-hover:scale-105"
                  />
                </button>
              ))}
            </div>
          )}

          {/* conteúdo em texto livre */}
          {page.conteudo ? (
            <div className="whitespace-pre-line rounded-lg border border-border bg-background p-4 text-sm leading-relaxed">
              {page.conteudo}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sem descrição cadastrada.
            </p>
          )}

          {/* preço */}
          {page.valor > 0 && (
            <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
              <span className="text-sm text-muted-foreground">Preço</span>
              <span className="flex items-center gap-2">
                {temDesconto && (
                  <>
                    <span className="text-sm text-muted-foreground line-through">
                      {formatCurrency(page.precoAntigo!, "BRL")}
                    </span>
                    {pctDesconto > 0 && (
                      <span className="rounded-md border border-emerald-500/30 bg-emerald-500/15 px-1.5 py-0.5 text-xs font-semibold text-emerald-400">
                        -{pctDesconto}%
                      </span>
                    )}
                  </>
                )}
                <span className="text-2xl font-bold text-brand">
                  {formatCurrency(page.valor, "BRL")}
                </span>
              </span>
            </div>
          )}

          {/* CTA — nunca usar asChild aqui: um <a> não obedece disabled, então o
              botão precisa virar de fato um <button disabled> quando vendido. */}
          {status === "VENDIDO" ? (
            <Button variant="whatsapp" size="lg" className="w-full" disabled>
              <MessageCircle className="h-5 w-5" />
              Vendido
            </Button>
          ) : (
            <Button asChild variant="whatsapp" size="lg" className="w-full">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-5 w-5" />
                Tenho interesse → WhatsApp
              </a>
            </Button>
          )}
        </DialogContent>
      </Dialog>

      {/* lightbox: imagem ampliada em tela cheia */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightbox}
            alt=""
            className="max-h-[92vh] max-w-[95vw] rounded-lg object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            aria-label="Fechar"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
}
