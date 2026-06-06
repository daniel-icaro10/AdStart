"use client";

import * as React from "react";
import {
  Users,
  UserX,
  Calendar,
  Sparkles,
  MessageCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PAGE_KIND_META,
  STATUS_VENDA_META,
  type StatusVenda,
} from "@/lib/constants";
import { formatCurrency, formatInt } from "@/lib/format";
import { buildWhatsappLink } from "@/lib/config";
import type { Page } from "@prisma/client";

type PageFollowerKind = "COM" | "SEM";

const TABS: { value: PageFollowerKind; label: string; icon: typeof Users }[] = [
  { value: "COM", label: "Com seguidores", icon: Users },
  { value: "SEM", label: "Sem seguidores", icon: UserX },
];

/** Card de uma página. */
function PageCard({ page }: { page: Page }) {
  const status = page.status as StatusVenda;
  const isVendido = status === "VENDIDO";
  const whatsappLink = buildWhatsappLink(
    `Tenho interesse na página "${page.nome}".`,
  );

  return (
    <div
      className={cn(
        "ad-hover-glow flex flex-col rounded-xl p-4 shadow-sm",
        PAGE_KIND_META[page.kind as "COM" | "SEM"].cardClass,
        isVendido && "opacity-60",
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary">{page.nicho}</Badge>
        {page.destaque && !isVendido && (
          <Badge className="border border-amber-500/30 bg-amber-500/15 text-amber-400">
            <Sparkles className="h-3 w-3" />
            Nova
          </Badge>
        )}
        <Badge className={cn("border", STATUS_VENDA_META[status].badgeClass)}>
          {STATUS_VENDA_META[status].label}
        </Badge>
      </div>

      <h3 className="mt-3 font-semibold leading-snug">{page.nome}</h3>

      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        {page.kind === "COM" ? (
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {formatInt(page.seguidores ?? 0)} seguidores
          </span>
        ) : (
          <span className="inline-flex items-center gap-1">
            <UserX className="h-3.5 w-3.5" />
            Sem seguidores
          </span>
        )}
        {page.anoCriacao && (
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {page.anoCriacao}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
        <div>
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Valor
          </div>
          <div className="text-2xl font-bold">
            {formatCurrency(page.valor, "BRL")}
          </div>
        </div>
        <Button
          asChild
          variant="whatsapp"
          size="sm"
          disabled={isVendido}
        >
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="h-4 w-4" />
            Interesse
          </a>
        </Button>
      </div>
    </div>
  );
}

/**
 * Seção de Páginas exibida ABAIXO do catálogo de BMs.
 * Abas: "Com seguidores" / "Sem seguidores".
 */
export function PagesSection({ pages }: { pages: Page[] }) {
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
