import type { Moeda } from "./constants";

/** Formata um valor monetário em BRL ou USD. */
export function formatCurrency(value: number, moeda: Moeda = "BRL"): string {
  const locale = moeda === "USD" ? "en-US" : "pt-BR";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: moeda,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Formata número grande de forma compacta (ex: 87.450 -> "87,4 mil"). */
export function formatCompact(value: number, moeda: Moeda = "BRL"): string {
  const locale = moeda === "USD" ? "en-US" : "pt-BR";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: moeda,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Inteiro com separador de milhar pt-BR. */
export function formatInt(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

const nf0 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

/**
 * Quebra de valores por moeda original, ex: "US$ 1.500 + R$ 5.000".
 * Omite a parte zerada; retorna null se ambos forem 0.
 */
export function breakdownMoeda(usd: number, brl: number): string | null {
  const partes: string[] = [];
  if (usd > 0) partes.push(`US$ ${nf0.format(usd)}`);
  if (brl > 0) partes.push(`R$ ${nf0.format(brl)}`);
  return partes.length ? partes.join(" + ") : null;
}
