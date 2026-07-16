"use client";

import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/format";
import { Badge } from "@/components/ui/ds/badge";
import { PriceTag } from "@/components/ui/ds/price-tag";
import { SpecRow } from "@/components/ui/ds/spec-row";
import { getIconeEmoji, type Moeda, type StatusVenda } from "@/lib/constants";
import { getCardSpecRows, getDebtInfo, getMetaLine } from "./bm-card-utils";
import type { AssetWithContas } from "@/types";

interface AssetCardProps {
  asset: AssetWithContas;
  onClick: () => void;
}

/**
 * Card de uma BM (DESIGN.md §5.1) — clicável → abre o modal de detalhes.
 * Botão único (sem CTA duplo no rosto do card): mantém o padrão já usado
 * por Page/Perfil/Vendidos, onde o WhatsApp real só existe dentro do modal.
 */
export function AssetCard({ asset, onClick }: AssetCardProps) {
  const statusVenda = asset.statusVenda as StatusVenda;
  const isVendido = statusVenda === "VENDIDO";
  const moeda = (asset.moeda as Moeda) ?? "BRL";
  const emoji = getIconeEmoji(asset.icone);
  const debt = getDebtInfo(asset);
  const specRows = getCardSpecRows(asset);
  const metaLine = getMetaLine(asset);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative w-full rounded-ds-lg border border-ds-border bg-ds-surface p-4 text-left",
        "transition-[border-color,transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-ds-accent hover:shadow-ds-card",
        "outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ds-accent",
        isVendido && "opacity-55",
      )}
    >
      {isVendido && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <Badge
            variant="vendida"
            className="-rotate-6 border-ds-text-faint bg-ds-surface px-3 py-1 text-sm"
          >
            Vendida
          </Badge>
        </div>
      )}

      {/* badges topo */}
      <div className="flex flex-wrap items-center gap-1.5">
        {asset.tier != null && <Badge variant="tier">Tier {asset.tier}</Badge>}
        <Badge variant="moeda">
          {emoji && <span>{emoji}</span>}
          {asset.moeda}
        </Badge>
        {asset.destaque && !isVendido && <Badge variant="nova">Nova</Badge>}

        {debt.hasDebt ? (
          <Badge variant="divida" className="ml-auto">
            Dívida{debt.amount != null ? ` ${formatCurrency(debt.amount, moeda)}` : ""}
          </Badge>
        ) : (
          <Badge variant="sem-dividas" className="ml-auto">
            Sem dívidas
          </Badge>
        )}
      </div>

      {/* título */}
      <h3 className="mt-3 font-ds-display text-ds-title-card text-ds-text">
        {asset.titulo}
      </h3>

      {/* metadados */}
      {metaLine && (
        <p className="mt-1 font-ds-sans text-ds-body text-ds-text-muted">
          {metaLine}
        </p>
      )}

      {/* ficha técnica: até 4 linhas pontilhadas */}
      {specRows.length > 0 && (
        <div className="mt-3 space-y-1.5 border-t border-ds-border-soft pt-3">
          {specRows.map((row) => (
            <SpecRow key={row.label} label={row.label} value={row.value} />
          ))}
        </div>
      )}

      {/* preço */}
      {asset.valor > 0 && (
        <div className="mt-3 flex items-end justify-between gap-2 border-t border-ds-border-soft pt-3">
          <PriceTag price={asset.valor} originalPrice={asset.precoAntigo} />
          <span className="shrink-0 font-ds-sans text-ds-label uppercase text-ds-text-faint group-hover:text-ds-accent">
            Ver detalhes
          </span>
        </div>
      )}
    </button>
  );
}
