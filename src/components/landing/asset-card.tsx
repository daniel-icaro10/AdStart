"use client";

import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTilt } from "@/hooks/use-tilt";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  CATEGORIA_META,
  STATUS_VENDA_META,
  TIER_BADGE_CLASS,
  getIconeEmoji,
  type Categoria,
  type StatusVenda,
} from "@/lib/constants";
import type { AssetWithContas } from "@/types";

interface AssetCardProps {
  asset: AssetWithContas;
  onClick: () => void;
}

/** Card de uma BM no board Kanban. Clicável → abre o modal de detalhes. */
export function AssetCard({ asset, onClick }: AssetCardProps) {
  const categoria = asset.categoria as Categoria;
  const statusVenda = asset.statusVenda as StatusVenda;
  const isVendido = statusVenda === "VENDIDO";
  const emoji = getIconeEmoji(asset.icone);
  const tilt = useTilt<HTMLButtonElement>();

  // Desconto visual: só quando o preço antigo é maior que o atual.
  const temDesconto =
    asset.precoAntigo != null &&
    asset.valor > 0 &&
    asset.precoAntigo > asset.valor;
  const pctDesconto = temDesconto
    ? Math.round((1 - asset.valor / asset.precoAntigo!) * 100)
    : 0;

  return (
    <button
      type="button"
      onClick={onClick}
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      className={cn(
        "group ad-hover-glow w-full rounded-xl p-4 text-left shadow-sm",
        CATEGORIA_META[categoria].cardClass,
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isVendido && "opacity-60",
      )}
    >
      {/* topo: badges */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge className={cn("border", CATEGORIA_META[categoria].badgeClass)}>
          {CATEGORIA_META[categoria].label}
        </Badge>
        {asset.tier != null && (
          <Badge className={TIER_BADGE_CLASS}>Tier {asset.tier}</Badge>
        )}
        {asset.destaque && !isVendido && (
          <Badge className="border border-amber-500/30 bg-amber-500/15 text-amber-400">
            <Sparkles className="h-3 w-3" />
            Nova
          </Badge>
        )}
        {isVendido && (
          <Badge className={cn("border", STATUS_VENDA_META.VENDIDO.badgeClass)}>
            Vendido
          </Badge>
        )}
      </div>

      {/* título com ícone */}
      <div className="mt-3 flex items-center gap-2">
        {emoji && <span className="text-xl leading-none">{emoji}</span>}
        <h3 className="font-semibold leading-snug">{asset.titulo}</h3>
      </div>

      {/* conteúdo em texto livre completo (quebras preservadas) */}
      {asset.conteudo && (
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {asset.conteudo}
        </p>
      )}

      <div className="mt-3 flex items-end justify-between gap-2 border-t border-border pt-3">
        {asset.valor > 0 ? (
          <div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Preço
            </div>
            {temDesconto && (
              <div className="text-xs text-muted-foreground line-through">
                {formatCurrency(asset.precoAntigo!, "BRL")}
              </div>
            )}
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold leading-none">
                {formatCurrency(asset.valor, "BRL")}
              </span>
              {temDesconto && pctDesconto > 0 && (
                <span className="rounded-md border border-emerald-500/30 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-emerald-400">
                  -{pctDesconto}%
                </span>
              )}
            </div>
          </div>
        ) : (
          <span />
        )}
        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground">
          Ver detalhes →
        </span>
      </div>
    </button>
  );
}
