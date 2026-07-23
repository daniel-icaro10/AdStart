/**
 * Constantes de domínio: categorias, status e suas cores/labels.
 * Centralizadas para manter consistência entre filtros, board e cards.
 */

export type Categoria =
  | "DISPONIVEL"
  | "DOLAR"
  | "EURO"
  | "10K_50K"
  | "MAIS_50K"
  | "MAIS_100K"
  | "SEM_CATEGORIA";

export type StatusVenda = "DISPONIVEL" | "RESERVADO" | "VENDIDO" | "PERDIDO";

export type Moeda = "BRL" | "USD" | "EUR";

/** Ordem em que as colunas do Kanban aparecem. */
export const CATEGORIA_ORDER: Categoria[] = [
  "DOLAR",
  "EURO",
  "DISPONIVEL",
  "10K_50K",
  "MAIS_50K",
  "MAIS_100K",
  "SEM_CATEGORIA",
];

interface CategoriaMeta {
  label: string;
  /** Classe de badge no estilo Notion (cores suaves). */
  badgeClass: string;
  /** Cor do "trilho"/bolinha da coluna no Kanban. */
  accentClass: string;
  /** Fundo tintado do card (estilo Notion) — inclui border + hover. */
  cardClass: string;
}

export const CATEGORIA_META: Record<Categoria, CategoriaMeta> = {
  DISPONIVEL: {
    label: "BMS BRS",
    badgeClass:
      "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/20 dark:text-sky-200 dark:border-sky-500/30",
    accentClass: "bg-sky-500/70",
    cardClass:
      "border border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-700/40 dark:bg-slate-800/50 dark:hover:border-slate-500/70",
  },
  DOLAR: {
    label: "Dólar",
    badgeClass:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-500/30",
    accentClass: "bg-amber-500/70",
    cardClass:
      "border border-amber-200 bg-amber-50 hover:border-amber-300 dark:border-yellow-900/40 dark:bg-yellow-950/50 dark:hover:border-yellow-700/70",
  },
  EURO: {
    label: "Euro",
    badgeClass:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-200 dark:border-blue-500/30",
    accentClass: "bg-blue-500/70",
    cardClass:
      "border border-blue-200 bg-blue-50 hover:border-blue-300 dark:border-blue-900/40 dark:bg-blue-950/50 dark:hover:border-blue-700/70",
  },
  "10K_50K": {
    label: "10K – 50K",
    badgeClass:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-200 dark:border-rose-500/30",
    accentClass: "bg-rose-500/70",
    cardClass:
      "border border-rose-200 bg-rose-50 hover:border-rose-300 dark:border-rose-900/40 dark:bg-rose-950/50 dark:hover:border-rose-700/70",
  },
  MAIS_50K: {
    label: "+50K",
    badgeClass:
      "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/20 dark:text-violet-200 dark:border-violet-500/30",
    accentClass: "bg-violet-500/70",
    cardClass:
      "border border-violet-200 bg-violet-50 hover:border-violet-300 dark:border-indigo-900/40 dark:bg-indigo-950/50 dark:hover:border-indigo-700/70",
  },
  MAIS_100K: {
    label: "100K+",
    badgeClass:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-500/30",
    accentClass: "bg-emerald-500/70",
    cardClass:
      "border border-emerald-200 bg-emerald-50 hover:border-emerald-300 dark:border-emerald-900/40 dark:bg-emerald-950/50 dark:hover:border-emerald-700/70",
  },
  SEM_CATEGORIA: {
    label: "Sem categoria",
    badgeClass:
      "bg-neutral-100 text-neutral-700 border-neutral-300 dark:bg-neutral-500/20 dark:text-neutral-200 dark:border-neutral-500/30",
    accentClass: "bg-neutral-500/60",
    cardClass:
      "border border-neutral-200 bg-neutral-50 hover:border-neutral-300 dark:border-neutral-700/40 dark:bg-neutral-800/50 dark:hover:border-neutral-500/70",
  },
};

/** Cores do card de Página por tipo (com/sem seguidores), estilo translúcido. */
export const PAGE_KIND_META: Record<
  "COM" | "SEM",
  { label: string; cardClass: string }
> = {
  COM: {
    label: "Com seguidores",
    cardClass:
      "border border-cyan-200 bg-cyan-50 hover:border-cyan-300 dark:border-cyan-900/40 dark:bg-cyan-950/50 dark:hover:border-cyan-700/70",
  },
  SEM: {
    label: "Sem seguidores",
    cardClass:
      "border border-teal-200 bg-teal-50 hover:border-teal-300 dark:border-teal-900/40 dark:bg-teal-950/50 dark:hover:border-teal-700/70",
  },
};

interface StatusMeta {
  label: string;
  badgeClass: string;
}

export const STATUS_VENDA_META: Record<StatusVenda, StatusMeta> = {
  DISPONIVEL: {
    label: "Disponível",
    badgeClass:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25",
  },
  RESERVADO: {
    label: "Reservado",
    badgeClass:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25",
  },
  VENDIDO: {
    label: "Vendido",
    badgeClass:
      "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/25",
  },
  PERDIDO: {
    label: "Perdido",
    badgeClass:
      "bg-zinc-100 text-zinc-700 border-zinc-300 dark:bg-zinc-500/15 dark:text-zinc-400 dark:border-zinc-500/25",
  },
};

/** Ícones (bandeiras/símbolos) que podem aparecer ao lado do título da BM. */
export const ICONE_OPTIONS: { value: string; emoji: string; label: string }[] = [
  { value: "BR", emoji: "🇧🇷", label: "Brasil" },
  { value: "US", emoji: "🇺🇸", label: "EUA / Dólar" },
  { value: "EU", emoji: "🇪🇺", label: "Europa" },
  { value: "GLOBAL", emoji: "🌐", label: "Global" },
  { value: "FIRE", emoji: "🔥", label: "Quente" },
  { value: "STAR", emoji: "⭐", label: "Destaque" },
];

/** Emoji correspondente à chave do ícone (vazio se não houver). */
export function getIconeEmoji(value?: string | null): string {
  return ICONE_OPTIONS.find((i) => i.value === value)?.emoji ?? "";
}

/** Opções de tier da BM (Nenhum, Tier 1..3). */
export const TIER_OPTIONS: { value: string; label: string }[] = [
  { value: "NONE", label: "Nenhum" },
  { value: "1", label: "Tier 1" },
  { value: "2", label: "Tier 2" },
  { value: "3", label: "Tier 3" },
];

/** Classe (azul accent) do badge de tier. */
export const TIER_BADGE_CLASS =
  "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/15 dark:text-blue-300";

export const MOEDA_OPTIONS: { value: Moeda; label: string }[] = [
  { value: "BRL", label: "Real (R$)" },
  { value: "USD", label: "Dólar (US$)" },
];

/** Faixas de gasto para o filtro (em BRL — referência aproximada). */
export const FAIXA_GASTO_OPTIONS = [
  { value: "ALL", label: "Qualquer gasto" },
  { value: "0_10K", label: "Até 10K" },
  { value: "10K_50K", label: "10K – 50K" },
  { value: "50K_PLUS", label: "Acima de 50K" },
] as const;

export type FaixaGasto = (typeof FAIXA_GASTO_OPTIONS)[number]["value"];
