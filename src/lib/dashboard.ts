/**
 * Dados agregados do dashboard operacional (/admin).
 * Junta estoque + financeiro + sinais de risco (aging, perdas, dados incompletos).
 */
import { prisma } from "./prisma";
import {
  getAtivosFinanceiros,
  getTaxaAtual,
  getMetricasFinanceiras,
  getSerieMensal,
  periodoMesAtual,
  toBRL,
  type AtivoFinanceiro,
  type MetricasFinanceiras,
  type PontoMensal,
} from "./financeiro";
import { CATEGORIA_META, CATEGORIA_ORDER, type Categoria } from "./constants";

// Limiares (dias) — ajustáveis conforme a operação.
export const AGING_WARN = 30;
export const AGING_CRIT = 60;
export const RESERVADO_TRAVADO = 14;

const DIA_MS = 86_400_000;

export interface AgingItem {
  id: string;
  origem: "asset" | "page";
  titulo: string;
  status: string;
  dias: number;
  custoBRL: number | null;
  fornecedor: string | null;
}

export interface IncompletoItem {
  id: string;
  origem: "asset" | "page";
  titulo: string;
  faltaCusto: boolean;
  faltaFornecedor: boolean;
}

export interface FornecedorRank {
  fornecedor: string;
  lucro: number;
  vendidos: number;
  perdidos: number;
  custoPerdas: number;
}

export interface EstoqueCategoria {
  categoria: string;
  label: string;
  qtd: number;
}

export interface DashboardData {
  taxa: number;
  metricas: MetricasFinanceiras;
  serie: PontoMensal[];
  aging: AgingItem[];
  agingWarn: number;
  agingCrit: number;
  reservadosTravados: AgingItem[];
  incompletos: IncompletoItem[];
  incompletosTotal: number;
  fornecedores: FornecedorRank[];
  estoquePorCategoria: EstoqueCategoria[];
}

function diasDesde(d: Date | null): number {
  if (!d) return 0;
  return Math.max(0, Math.floor((Date.now() - d.getTime()) / DIA_MS));
}

export async function getDashboardData(): Promise<DashboardData> {
  const [ativos, taxa, metricas, serie, catGroup] = await Promise.all([
    getAtivosFinanceiros(),
    getTaxaAtual(),
    getMetricasFinanceiras(periodoMesAtual()),
    getSerieMensal(6),
    prisma.asset.groupBy({
      by: ["categoria"],
      where: { statusVenda: { in: ["DISPONIVEL", "RESERVADO"] } },
      _count: { _all: true },
    }),
  ]);

  const custoBRL = (a: AtivoFinanceiro): number | null =>
    a.custoAquisicao == null
      ? null
      : toBRL(a.custoAquisicao, a.moedaCusto, a.taxaCambioNaDia, taxa);

  const emEstoque = ativos.filter(
    (a) => a.statusVenda === "DISPONIVEL" || a.statusVenda === "RESERVADO",
  );

  // ── Aging (ordenado do mais parado) ──────────────────────────────────
  const aging: AgingItem[] = emEstoque
    .map((a) => ({
      id: a.id,
      origem: a.origem,
      titulo: a.titulo,
      status: a.statusVenda,
      dias: diasDesde(a.dataEntrada),
      custoBRL: custoBRL(a),
      fornecedor: a.fornecedor,
    }))
    .sort((x, y) => y.dias - x.dias);

  const agingWarn = aging.filter((a) => a.dias >= AGING_WARN).length;
  const agingCrit = aging.filter((a) => a.dias >= AGING_CRIT).length;

  const reservadosTravados = aging.filter(
    (a) => a.status === "RESERVADO" && a.dias >= RESERVADO_TRAVADO,
  );

  // ── Dados financeiros incompletos ────────────────────────────────────
  const incompletosAll: IncompletoItem[] = emEstoque
    .filter((a) => a.custoAquisicao == null || !a.fornecedor)
    .map((a) => ({
      id: a.id,
      origem: a.origem,
      titulo: a.titulo,
      faltaCusto: a.custoAquisicao == null,
      faltaFornecedor: !a.fornecedor,
    }));

  // ── Ranking de fornecedores (lucro vs perda) ─────────────────────────
  const fmap = new Map<string, FornecedorRank>();
  const ensure = (f: string): FornecedorRank => {
    let r = fmap.get(f);
    if (!r) {
      r = { fornecedor: f, lucro: 0, vendidos: 0, perdidos: 0, custoPerdas: 0 };
      fmap.set(f, r);
    }
    return r;
  };
  for (const a of ativos) {
    if (!a.fornecedor) continue;
    if (a.statusVenda === "VENDIDO" && a.precoVenda != null) {
      const r = ensure(a.fornecedor);
      r.vendidos++;
      r.lucro += a.precoVenda - (custoBRL(a) ?? 0);
    } else if (a.statusVenda === "PERDIDO") {
      const r = ensure(a.fornecedor);
      r.perdidos++;
      r.custoPerdas += custoBRL(a) ?? 0;
    }
  }
  const fornecedores = [...fmap.values()]
    .filter((r) => r.vendidos > 0 || r.perdidos > 0)
    .sort((a, b) => b.lucro - a.lucro)
    .slice(0, 6);

  // ── Estoque por categoria (BMs) ──────────────────────────────────────
  const countByCat = new Map<string, number>();
  for (const c of catGroup) countByCat.set(c.categoria, c._count._all);
  const estoquePorCategoria: EstoqueCategoria[] = CATEGORIA_ORDER.map(
    (cat: Categoria) => ({
      categoria: cat,
      label: CATEGORIA_META[cat].label,
      qtd: countByCat.get(cat) ?? 0,
    }),
  ).filter((c) => c.qtd > 0);

  return {
    taxa,
    metricas,
    serie,
    aging: aging.slice(0, 8),
    agingWarn,
    agingCrit,
    reservadosTravados: reservadosTravados.slice(0, 8),
    incompletos: incompletosAll.slice(0, 8),
    incompletosTotal: incompletosAll.length,
    fornecedores,
    estoquePorCategoria,
  };
}
