"use client";

import * as React from "react";
import { MessageCircle, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/ds/badge";
import { Button } from "@/components/ui/ds/button";
import { PriceTag } from "@/components/ui/ds/price-tag";
import { SpecRow } from "@/components/ui/ds/spec-row";
import { cn } from "@/lib/utils";
import { fetchAssetImagens } from "@/app/admin/actions";
import {
  STATUS_VENDA_META,
  getIconeEmoji,
  type Moeda,
  type StatusVenda,
} from "@/lib/constants";
import { buildWhatsappLink } from "@/lib/config";
import { formatCurrency } from "@/lib/format";
import { getCardSpecRows, getDebtInfo, getMetaLine } from "./bm-card-utils";
import type { AssetWithContas } from "@/types";

interface AssetDetailModalProps {
  asset: AssetWithContas | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Modal de detalhes da BM (DESIGN.md §5.1): ficha técnica + tabela de contas. */
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

  const statusVenda = asset.statusVenda as StatusVenda;
  const isVendido = statusVenda === "VENDIDO";
  const moeda = (asset.moeda as Moeda) ?? "BRL";
  const emoji = getIconeEmoji(asset.icone);
  const debt = getDebtInfo(asset);
  const specRows = getCardSpecRows(asset);
  const metaLine = getMetaLine(asset);

  // Desconto visual: só quando o preço antigo é maior que o atual.
  const temDesconto =
    asset.precoAntigo != null &&
    asset.valor > 0 &&
    asset.precoAntigo > asset.valor;
  const pctDesconto = temDesconto
    ? Math.round((1 - asset.valor / asset.precoAntigo!) * 100)
    : 0;

  // Mensagem do WhatsApp com os dados da BM clicada (o vendedor já sabe qual é).
  const selos = [
    asset.verificada && "Verificada",
    asset.semDividas && "Sem dívidas",
    asset.semBloqueios && "Sem bloqueios",
  ].filter(Boolean);
  const linhas = [
    "Olá! Tenho interesse nesta BM 👇",
    "",
    `*${asset.codigo}${asset.titulo ? ` — ${asset.titulo}` : ""}*`,
    ...(asset.valor > 0
      ? [
          `• Preço: ${formatCurrency(asset.valor, "BRL")}${
            temDesconto && pctDesconto > 0
              ? ` (de ${formatCurrency(asset.precoAntigo!, "BRL")} · -${pctDesconto}%)`
              : ""
          }`,
        ]
      : []),
    ...(metaLine ? [`• ${metaLine}`] : []),
    ...(asset.gastoTotal != null
      ? [`• Gasto total: ${formatCurrency(asset.gastoTotal, moeda)}`]
      : []),
    ...(asset.tier != null ? [`• Tier ${asset.tier}`] : []),
    ...(selos.length ? [`• ${selos.join(" · ")}`] : []),
    `• ${debt.hasDebt ? `Dívida${debt.amount != null ? `: ${formatCurrency(debt.amount, moeda)}` : ""}` : "Sem dívidas"}`,
    "",
    "Pode me passar mais detalhes?",
  ];
  const whatsappLink = buildWhatsappLink(linhas.join("\n"));

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex flex-wrap items-center gap-1.5">
            {asset.tier != null && <Badge variant="tier">Tier {asset.tier}</Badge>}
            <Badge variant="moeda">
              {emoji && <span>{emoji}</span>}
              {asset.moeda}
            </Badge>
            <Badge
              className={cn("border", STATUS_VENDA_META[statusVenda].badgeClass)}
            >
              {STATUS_VENDA_META[statusVenda].label}
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
          <DialogTitle className="mt-1 font-ds-display text-ds-text">
            {asset.titulo}
          </DialogTitle>
          {metaLine && (
            <p className="font-ds-sans text-ds-body text-ds-text-muted">
              {metaLine}
            </p>
          )}
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

        {/* ficha técnica */}
        {specRows.length > 0 && (
          <div className="space-y-1.5 rounded-ds-lg border border-ds-border bg-ds-surface p-4">
            {specRows.map((row) => (
              <SpecRow key={row.label} label={row.label} value={row.value} />
            ))}
          </div>
        )}

        {/* tabela de contas de anúncio */}
        <div>
          <h4 className="mb-2 font-ds-sans text-ds-label uppercase text-ds-text-faint">
            Contas de anúncio
          </h4>
          {asset.contas.length > 0 ? (
            <div className="overflow-x-auto rounded-ds-lg border border-ds-border">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-ds-border bg-ds-surface-2">
                    <th className="px-3 py-2 font-ds-sans text-ds-label uppercase text-ds-text-faint">
                      Conta
                    </th>
                    <th className="px-3 py-2 font-ds-sans text-ds-label uppercase text-ds-text-faint">
                      Status
                    </th>
                    <th className="px-3 py-2 text-right font-ds-sans text-ds-label uppercase text-ds-text-faint">
                      Gasto
                    </th>
                    <th className="px-3 py-2 text-right font-ds-sans text-ds-label uppercase text-ds-text-faint">
                      Limite Meta
                    </th>
                    <th className="px-3 py-2 text-right font-ds-sans text-ds-label uppercase text-ds-text-faint">
                      Ciclo
                    </th>
                    <th className="px-3 py-2 text-right font-ds-sans text-ds-label uppercase text-ds-text-faint">
                      Threshold
                    </th>
                    <th className="px-3 py-2 text-right font-ds-sans text-ds-label uppercase text-ds-text-faint">
                      Dívida
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {asset.contas.map((conta) => (
                    <tr key={conta.id} className="border-b border-ds-border-soft last:border-0">
                      <td className="px-3 py-2 font-ds-sans text-ds-data text-ds-text">
                        {conta.nome}
                      </td>
                      <td className="px-3 py-2 font-ds-sans text-ds-data text-ds-text-muted">
                        {conta.status}
                      </td>
                      <td className="px-3 py-2 text-right font-ds-mono text-ds-data tabular-nums text-ds-text">
                        {conta.gastos != null ? formatCurrency(conta.gastos, moeda) : "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-ds-mono text-ds-data tabular-nums text-ds-text">
                        {conta.limiteMeta != null ? formatCurrency(conta.limiteMeta, moeda) : "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-ds-mono text-ds-data tabular-nums text-ds-text">
                        {conta.cicloLivre != null ? formatCurrency(conta.cicloLivre, moeda) : "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-ds-mono text-ds-data tabular-nums text-ds-text">
                        {conta.threshold != null ? formatCurrency(conta.threshold, moeda) : "—"}
                      </td>
                      <td
                        className={cn(
                          "px-3 py-2 text-right font-ds-mono text-ds-data tabular-nums",
                          conta.dividas && conta.dividas > 0 ? "text-ds-danger" : "text-ds-text-muted",
                        )}
                      >
                        {conta.dividas ? formatCurrency(conta.dividas, moeda) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="rounded-ds-lg border border-ds-border-soft bg-ds-surface p-4 text-sm text-ds-text-muted">
              Nenhuma conta de anúncio cadastrada ainda.
            </p>
          )}
        </div>

        {/* conteúdo em texto livre (descrição complementar) */}
        {asset.conteudo && (
          <div className="whitespace-pre-line rounded-lg border border-border bg-background p-4 text-sm leading-relaxed">
            {asset.conteudo}
          </div>
        )}

        {/* preço */}
        {asset.valor > 0 && (
          <div className="flex items-center justify-between rounded-ds-lg border border-ds-border bg-ds-surface px-4 py-3">
            <span className="font-ds-sans text-ds-body text-ds-text-muted">Preço</span>
            <PriceTag price={asset.valor} originalPrice={asset.precoAntigo} />
          </div>
        )}

        {/* CTA */}
        <Button
          asChild
          variant="whatsapp"
          className="w-full"
          disabled={isVendido}
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
