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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        ref={tilt.ref}
        onMouseMove={tilt.onMouseMove}
        onMouseLeave={tilt.onMouseLeave}
        className={cn(
          "group ad-hover-glow w-full rounded-xl p-4 text-left shadow-sm",
          kindMeta.cardClass,
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isVendido && "opacity-60",
        )}
      >
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
              <div className="text-lg font-bold leading-none">
                {formatCurrency(page.valor, "BRL")}
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

      <PageDetailModal page={page} open={open} onOpenChange={setOpen} />
    </>
  );
}

/**
 * Seção de Páginas exibida ABAIXO do catálogo de BMs.
 * Abas: "Com seguidores" / "Sem seguidores".
 */
export function PagesSection({ pages }: { pages: PagePublic[] }) {
  const [tab, setTab] = React.useState<PageFollowerKind>("COM");
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
