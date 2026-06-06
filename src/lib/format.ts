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
