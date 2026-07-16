/**
 * Fonte ÚNICA de cores/estilo para os gráficos (recharts) — tema compartilhado
 * do DESIGN.md §6.5. recharts exige strings de cor (não classes Tailwind),
 * então centralizamos aqui os hex dos tokens `--ds-*` — zero cor hardcoded
 * espalhada, e nada de paleta multicolorida padrão do Recharts: só estas 3
 * cores de série (accent, secondary, money) em qualquer gráfico.
 */
import { formatCompact, formatCurrency } from "./format";

export const chart = {
  accent: "#4D8DFF", // --ds-accent — série principal
  secondary: "#8A94A8", // série secundária (ex.: Investimento)
  money: "#F5B84D", // --ds-money — série de lucro/valores em destaque
  axis: "#5C6577", // --ds-text-faint
  grid: "#1A2233", // --ds-border-soft
} as const;

/** Estilo do tooltip alinhado às superfícies do design system (--ds-*). */
export const tooltipStyle = {
  backgroundColor: "#18202F", // --ds-surface-2
  border: "1px solid #232D40", // --ds-border
  borderRadius: 8,
  fontSize: 12,
  color: "#E8ECF4", // --ds-text
} as const;

/** Eixo: moeda compacta pt-BR — "R$ 1,5 mil". */
export const brlCompact = (v: number) => formatCompact(v, "BRL");

/** Tooltip: moeda BRL completa. */
export const brlFull = (v: number) => formatCurrency(v, "BRL");
