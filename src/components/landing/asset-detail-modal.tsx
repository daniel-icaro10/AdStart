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
import { fetchAssetImagens } from "@/app/admin/actions";
import {
  CATEGORIA_META,
  STATUS_VENDA_META,
  TIER_BADGE_CLASS,
  getIconeEmoji,
  type Categoria,
  type StatusVenda,
} from "@/lib/constants";
import { buildWhatsappLink } from "@/lib/config";
import { formatCurrency } from "@/lib/format";
import type { AssetWithContas } from "@/types";

interface AssetDetailModalProps {
  asset: AssetWithContas | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Modal com o conteúdo completo (texto livre) da BM. */
export function AssetDetailModal({
  asset,
  open,
  onOpenChange,
}: AssetDetailModalProps) {
  const [imagens, setImagens] = React.useState<string[]>([]);
  const [lightbox, setLightbox] = React.useState<string | null>(null);
  const assetId = asset?.id;

  // Busca as imagens da BM só quando o modal abre (mantém a listagem leve).
  React.useEffect(() => {
    let active = true;
    setImagens([]);
    setLightbox(null);
    if (open && assetId) {
      fetchAssetImagens(assetId).then((imgs) => {
        if (active) setImagens(imgs);
      });
    }
    return () => {
      active = false;
    };
  }, [open, assetId]);

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

  if (!asset) return null;

  const categoria = asset.categoria as Categoria;
  const statusVenda = asset.statusVenda as StatusVenda;
  const emoji = getIconeEmoji(asset.icone);

  const whatsappLink = buildWhatsappLink(
    `Tenho interesse na ${asset.titulo}.`,
  );

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge className={cn("border", CATEGORIA_META[categoria].badgeClass)}>
              {CATEGORIA_META[categoria].label}
            </Badge>
            <Badge
              className={cn("border", STATUS_VENDA_META[statusVenda].badgeClass)}
            >
              {STATUS_VENDA_META[statusVenda].label}
            </Badge>
            {asset.tier != null && (
              <Badge className={TIER_BADGE_CLASS}>Tier {asset.tier}</Badge>
            )}
            {asset.destaque && (
              <Badge className="border border-amber-500/30 bg-amber-500/15 text-amber-400">
                Nova
              </Badge>
            )}
          </div>
          <DialogTitle className="mt-1 flex items-center gap-2">
            {emoji && <span className="text-2xl leading-none">{emoji}</span>}
            {asset.titulo}
          </DialogTitle>
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
                  alt={`${asset.titulo} — imagem ${i + 1}`}
                  className="h-40 w-full cursor-zoom-in object-cover transition-transform group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        )}

        {/* conteúdo em texto livre */}
        {asset.conteudo ? (
          <div className="whitespace-pre-line rounded-lg border border-border bg-background p-4 text-sm leading-relaxed">
            {asset.conteudo}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Sem descrição cadastrada.
          </p>
        )}

        {/* preço */}
        {asset.valor > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3">
            <span className="text-sm text-muted-foreground">Preço</span>
            <span className="text-2xl font-bold text-brand">
              {formatCurrency(asset.valor, "BRL")}
            </span>
          </div>
        )}

        {/* CTA */}
        <Button
          asChild
          variant="whatsapp"
          size="lg"
          className="w-full"
          disabled={statusVenda === "VENDIDO"}
        >
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-5 w-5" />
            Tenho interesse → WhatsApp
          </a>
        </Button>
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
