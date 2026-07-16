/**
 * Fonte ÚNICA de cores/estilo para os gráficos (recharts).
 * recharts exige strings de cor (não classes Tailwind), então centralizamos
 * aqui os hex dos tokens do tema admin — zero cor hardcoded espalhada.
 */
import { formatCompact, formatCurrency } from "./format";

export const chart = {
  accent: "#3B82F6", // série principal
  positive: "#22C55E", // lucro
  negative: "#EF4444", // perdas / negativo
  warning: "#F59E0B",
  neutral: "#64748B", // séries/eixos secundários (text-muted)
  axis: "#64748B",
  grid: "rgba(255,255,255,0.06)",
} as const;

/** Estilo do tooltip alinhado às superfícies do admin. */
export const tooltipStyle = {
  backgroundColor: "#111726", // bg-surface
  border: "1px solid #232D45", // border-subtle
  borderRadius: 8,
  fontSize: 12,
  color: "#E8ECF4", // text-primary
} as const;

/** Eixo: moeda compacta pt-BR — "R$ 1,5 mil". */
export const brlCompact = (v: number) => formatCompact(v, "BRL");

/** Tooltip: moeda BRL completa. */
export const brlFull = (v: number) => formatCurrency(v, "BRL");
