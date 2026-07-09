"use client";

import * as React from "react";
import { Users, UserX, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { useTilt } from "@/hooks/use-tilt";
import { Badge } from "@/components/ui/badge";
import {
  PAGE_KIND_META,
  STATUS_VENDA_META,
  type StatusVenda,
} from "@/lib/constants";
import { formatCurrency } from "@/lib/format";
import { PageDetailModal } from "./page-detail-modal";
import type { PagePublic } from "@/types";

type PageFollowerKind = "COM" | "SEM";

const TABS: { value: PageFollowerKind; label: string; icon: typeof Users }[] = [
  { value: "COM", label: "Com seguidores", icon: Users },
  { value: "SEM", label: "Sem seguidores", icon: UserX },
];

/** Card de uma página (estilo BM). Clicável → abre o modal de detalhes. */
export function PageCard({ page }: { page: PagePublic }) {
  const status = page.status as StatusVenda;
  const isVendido = status === "VENDIDO";
  const kindMeta = PAGE_KIND_META[page.kind as "COM" | "SEM"];
  const [open, setOpen] = React.useState(false);
  const tilt = useTilt<HTMLButtonElement>();
  const capa = page.imagens?.[0]?.data;

  // Desconto visual: só quando o preço antigo é maior que o atual.
  const temDesconto =
    page.precoAntigo != null && page.valor > 0 && page.precoAntigo > page.valor;
  const pctDesconto = temDesconto
    ? Math.round((1 - page.valor / page.precoAntigo!) * 100)
    : 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        className={cn(
          "group ad-hover-glow flex w-full flex-col overflow-hidden rounded-xl text-left shadow-sm",
          kindMeta.cardClass,
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isVendido && "opacity-60",
        )}
      >
        {capa && (
          <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-border/60 bg-black/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capa}
              alt={page.nome}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}

        <div className="p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{kindMeta.label}</Badge>
          {page.destaque && !isVendido && (
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

        <h3 className="mt-3 font-semibold leading-snug">{page.nome}</h3>

        {page.conteudo && (
          <p className="mt-2 line-clamp-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {page.conteudo}
          </p>
        )}

        <div className="mt-3 flex items-end justify-between gap-2 border-t border-border pt-3">
          {page.valor > 0 ? (
            <div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Preço
              </div>
              {temDesconto && (
                <div className="text-xs text-muted-foreground line-through">
                  {formatCurrency(page.precoAntigo!, "BRL")}
                </div>
              )}
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold leading-none">
                  {formatCurrency(page.valor, "BRL")}
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
        </div>
      </button>

      <PageDetailModal page={page} open={open} onOpenChange={setOpen} />
    </>
  );
}

/**
 * Seção de Páginas/Perfis do catálogo.
 * variant "pagina": abas "Com seguidores" / "Sem seguidores".
 * variant "perfil": grade simples (sem sub-abas).
 */
export function PagesSection({
  pages,
  variant = "pagina",
}: {
  pages: PagePublic[];
  variant?: "pagina" | "perfil";
}) {
  const [tab, setTab] = React.useState<PageFollowerKind>("COM");

  if (variant === "perfil") {
    return pages.length === 0 ? (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground">
        Nenhum perfil disponível no momento.
      </div>
    ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <PageCard key={page.id} page={page} />
        ))}
      </div>
    );
  }

  const items = pages.filter((p) => p.kind === tab);

  return (
    <div>
      {/* abas com/sem seguidores */}
      <div className="mb-6 inline-flex rounded-xl border border-border bg-card p-1 shadow-sm">
        {TABS.map((t) => {
          const active = tab === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setTab(t.value)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              aria-pressed={active}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* grade de páginas */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center text-muted-foreground">
          Nenhuma página nesta categoria no momento.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((page) => (
            <PageCard key={page.id} page={page} />
          ))}
        </div>
      )}
    </div>
  );
}
