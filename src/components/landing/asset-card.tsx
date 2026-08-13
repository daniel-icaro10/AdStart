"use client";

import { Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTilt } from "@/hooks/use-tilt";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  CATEGORIA_META,
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
        "group ad-hover-glow flex w-full overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isVendido && "opacity-60",
      )}
    >
      {/* faixa lateral colorida por categoria */}
      <span
        className={cn("w-1.5 shrink-0", CATEGORIA_META[categoria].accentClass)}
        aria-hidden
      />

      <div className="min-w-0 flex-1 p-4">
        {/* topo: chips */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            <span
              className={cn("h-1.5 w-1.5 rounded-full", CATEGORIA_META[categoria].accentClass)}
              aria-hidden
            />
            {CATEGORIA_META[categoria].label}
          </span>
          {asset.tier != null && (
            <Badge className={cn(TIER_BADGE_CLASS, "rounded-full px-1.5 py-0.5 text-[10px]")}>
              Tier {asset.tier}
            </Badge>
          )}
          {asset.destaque && !isVendido && (
            <Badge className="gap-1 rounded-full border-amber-500/30 bg-amber-500/15 px-1.5 py-0.5 text-[10px] text-amber-400">
              <Sparkles className="h-3 w-3" />
              Nova
            </Badge>
          )}
          {isVendido && (
            <Badge className="rounded-full border-transparent bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
              Vendido
            </Badge>
          )}
        </div>

        {/* título com ícone */}
        <div className="mt-2.5 flex items-center gap-2">
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
                  <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-emerald-400">
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
      </div>
    </button>
  );
}
