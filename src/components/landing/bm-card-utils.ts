import { formatCurrency } from "@/lib/format";
import type { Moeda } from "@/lib/constants";
import type { AssetWithContas } from "@/types";

/**
 * Lógica compartilhada entre AssetCard e AssetDetailModal (DESIGN.md §5.1/§4):
 * dívida sempre visível, spec rows agregadas a partir de `contas`, linha de
 * metadados. Uma só fonte de verdade para não divergir card ↔ modal.
 */

type ContaField = "limiteMeta" | "cicloLivre" | "threshold";

function sumContas(asset: AssetWithContas, field: ContaField): number | null {
  const valores = asset.contas
    .map((c) => c[field])
    .filter((v): v is number => v != null);
  return valores.length ? valores.reduce((a, b) => a + b, 0) : null;
}

export interface DebtInfo {
  hasDebt: boolean;
  /** Valor total da dívida, na moeda da BM — null quando desconhecido. */
  amount: number | null;
}

/** Badge de dívida: binário, nunca escondido (regra do §5.1). */
export function getDebtInfo(asset: AssetWithContas): DebtInfo {
  const totalContas = asset.contas.reduce((sum, c) => sum + (c.dividas ?? 0), 0);
  return {
    hasDebt: !asset.semDividas || totalContas > 0,
    amount: totalContas > 0 ? totalContas : null,
  };
}

export interface CardSpecRow {
  label: string;
  value: string;
}

/** No máximo 4 linhas pontilhadas (gasto total, limite, ciclo, threshold). */
export function getCardSpecRows(asset: AssetWithContas): CardSpecRow[] {
  const moeda = (asset.moeda as Moeda) ?? "BRL";
  const rows: CardSpecRow[] = [];

  if (asset.gastoTotal != null) {
    rows.push({ label: "Gasto total", value: formatCurrency(asset.gastoTotal, moeda) });
  }
  const limiteMeta = sumContas(asset, "limiteMeta");
  if (limiteMeta != null) {
    rows.push({ label: "Limite Meta", value: formatCurrency(limiteMeta, moeda) });
  }
  const ciclo = sumContas(asset, "cicloLivre");
  if (ciclo != null) {
    rows.push({ label: "Ciclo", value: formatCurrency(ciclo, moeda) });
  }
  const threshold = sumContas(asset, "threshold");
  if (threshold != null) {
    rows.push({ label: "Threshold", value: formatCurrency(threshold, moeda) });
  }

  return rows.slice(0, 4);
}

/** Linha de metadados: "Criada em 2020 · BM5 · 2 de 5 contas". */
export function getMetaLine(asset: AssetWithContas): string {
  const partes: string[] = [];
  if (asset.anoCriacao != null) partes.push(`Criada em ${asset.anoCriacao}`);
  if (asset.limiteContas != null) partes.push(`BM${asset.limiteContas}`);

  const contasCriadas = asset.qtdContas ?? (asset.contas.length || null);
  if (contasCriadas != null) {
    partes.push(
      asset.limiteContas != null
        ? `${contasCriadas} de ${asset.limiteContas} contas`
        : `${contasCriadas} conta${contasCriadas === 1 ? "" : "s"}`,
    );
  }

  return partes.join(" · ");
}
