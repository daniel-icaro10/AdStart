/**
 * Camada de acesso a dados para o módulo financeiro.
 * Re-exporta tipos e funções de financeiro-calc para que componentes
 * importem tudo de um único lugar.
 *
 * NOTA: este arquivo NÃO usa "use server" — é um módulo de queries importado
 * por Server Components. As mutações (Server Actions) ficam em
 * src/app/admin/financeiro/actions.ts.
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import {
  decimalToNumber,
  calcularMetricas,
  toBRL,
  periodoMesAtual,
  periodoMesAnterior,
  periodoUltimosDias,
  periodoTotal,
  periodoDoMesSP,
  resolverPeriodo,
  TAXA_CAMBIO_KEY,
  TAXA_CAMBIO_DEFAULT,
  type AtivoFinanceiro,
  type CustoSerializado,
  type PeriodoFiltro,
  type MetricasFinanceiras,
  type TipoAtivo,
  type StatusAtivo,
  type MoedaAtivo,
  type CategoriasCusto,
  type PeriodoPreset,
} from "./financeiro-calc";

export type {
  AtivoFinanceiro,
  CustoSerializado,
  PeriodoFiltro,
  MetricasFinanceiras,
  TipoAtivo,
  StatusAtivo,
  MoedaAtivo,
  CategoriasCusto,
  PeriodoPreset,
};
export {
  decimalToNumber,
  calcularMetricas,
  toBRL,
  periodoMesAtual,
  periodoMesAnterior,
  periodoUltimosDias,
  periodoTotal,
  periodoDoMesSP,
  resolverPeriodo,
  TAXA_CAMBIO_KEY,
  TAXA_CAMBIO_DEFAULT,
};

// ─── Seletores Prisma ─────────────────────────────────────────────────────────
// Apenas campos financeiros + identidade — não puxa imagens/contas.

const ASSET_SELECT = {
  id: true,
  titulo: true,
  tipo: true,
  fornecedor: true,
  statusVenda: true,
  custoAquisicao: true,
  moedaCusto: true,
  dataEntrada: true,
  precoPrevisto: true,
  precoVenda: true,
  moedaVenda: true,
  taxaVendaNaDia: true,
  comprador: true,
  dataSaida: true,
  motivoPerda: true,
  observacoes: true,
  taxaCambioNaDia: true,
  createdAt: true,
} as const satisfies Prisma.AssetSelect;

const PAGE_SELECT = {
  id: true,
  nome: true,
  tipo: true,
  fornecedor: true,
  status: true,
  custoAquisicao: true,
  moedaCusto: true,
  dataEntrada: true,
  precoPrevisto: true,
  precoVenda: true,
  moedaVenda: true,
  taxaVendaNaDia: true,
  comprador: true,
  dataSaida: true,
  motivoPerda: true,
  observacoes: true,
  taxaCambioNaDia: true,
  createdAt: true,
} as const satisfies Prisma.PageSelect;

type AssetRow = Prisma.AssetGetPayload<{ select: typeof ASSET_SELECT }>;
type PageRow = Prisma.PageGetPayload<{ select: typeof PAGE_SELECT }>;

// ─── Mapeamento DB → AtivoFinanceiro ─────────────────────────────────────────

function mapAsset(a: AssetRow): AtivoFinanceiro {
  return {
    id: a.id,
    origem: "asset",
    titulo: a.titulo,
    tipo: (a.tipo ?? null) as TipoAtivo | null,
    fornecedor: a.fornecedor,
    statusVenda: a.statusVenda as StatusAtivo,
    custoAquisicao: decimalToNumber(a.custoAquisicao),
    moedaCusto: (a.moedaCusto ?? null) as MoedaAtivo | null,
    dataEntrada: a.dataEntrada,
    precoPrevisto: decimalToNumber(a.precoPrevisto),
    precoVenda: decimalToNumber(a.precoVenda),
    moedaVenda: (a.moedaVenda ?? null) as MoedaAtivo | null,
    taxaVendaNaDia: decimalToNumber(a.taxaVendaNaDia),
    comprador: a.comprador,
    dataSaida: a.dataSaida,
    motivoPerda: a.motivoPerda,
    observacoes: a.observacoes,
    taxaCambioNaDia: decimalToNumber(a.taxaCambioNaDia),
  };
}

function mapPage(p: PageRow): AtivoFinanceiro {
  return {
    id: p.id,
    origem: "page",
    titulo: p.nome,
    tipo: (p.tipo ?? null) as TipoAtivo | null,
    fornecedor: p.fornecedor,
    // Page usa `status`; Asset usa `statusVenda`
    statusVenda: p.status as StatusAtivo,
    custoAquisicao: decimalToNumber(p.custoAquisicao),
    moedaCusto: (p.moedaCusto ?? null) as MoedaAtivo | null,
    dataEntrada: p.dataEntrada,
    precoPrevisto: decimalToNumber(p.precoPrevisto),
    precoVenda: decimalToNumber(p.precoVenda),
    moedaVenda: (p.moedaVenda ?? null) as MoedaAtivo | null,
    taxaVendaNaDia: decimalToNumber(p.taxaVendaNaDia),
    comprador: p.comprador,
    dataSaida: p.dataSaida,
    motivoPerda: p.motivoPerda,
    observacoes: p.observacoes,
    taxaCambioNaDia: decimalToNumber(p.taxaCambioNaDia),
  };
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Todos os ativos financeiros (Asset + Page) em paralelo. */
export async function getAtivosFinanceiros(): Promise<AtivoFinanceiro[]> {
  const [assets, pages] = await Promise.all([
    prisma.asset.findMany({ select: ASSET_SELECT }),
    prisma.page.findMany({ select: PAGE_SELECT }),
  ]);
  return [...assets.map(mapAsset), ...pages.map(mapPage)];
}

/** Taxa USD→BRL salva no Setting. Retorna TAXA_CAMBIO_DEFAULT se ausente. */
export async function getTaxaAtual(): Promise<number> {
  const setting = await prisma.setting.findUnique({
    where: { key: TAXA_CAMBIO_KEY },
  });
  if (!setting) return TAXA_CAMBIO_DEFAULT;
  const parsed = parseFloat(setting.value);
  return isNaN(parsed) ? TAXA_CAMBIO_DEFAULT : parsed;
}

/** Atualiza a taxa USD→BRL no Setting. */
export async function upsertTaxaCambio(taxa: number): Promise<void> {
  await prisma.setting.upsert({
    where: { key: TAXA_CAMBIO_KEY },
    update: { value: String(taxa) },
    create: { key: TAXA_CAMBIO_KEY, value: String(taxa) },
  });
}

/** Todos os custos operacionais (filtragem de período feita em calcularMetricas). */
export async function getCustosOperacionais(): Promise<CustoSerializado[]> {
  const rows = await prisma.custoOperacional.findMany({
    orderBy: { data: "desc" },
  });
  return rows.map((c) => ({
    id: c.id,
    descricao: c.descricao,
    categoria: c.categoria as CategoriasCusto,
    valor: decimalToNumber(c.valor) ?? 0,
    moeda: c.moeda as MoedaAtivo,
    data: c.data,
    recorrente: c.recorrente,
    taxaCambioNaDia: decimalToNumber(c.taxaCambioNaDia),
  }));
}

// ─── Tipo serializado (datas ISO) para Client Components ─────────────────────

export type SerializedCusto = Omit<CustoSerializado, "data"> & {
  data: string; // ISO string
};

/** Custos operacionais (datas como ISO string) para componentes Client. */
export async function getCustosSerializados(
  periodo?: PeriodoFiltro,
): Promise<SerializedCusto[]> {
  const rows = await prisma.custoOperacional.findMany({
    where: periodo
      ? { data: { gte: periodo.inicio, lte: periodo.fim } }
      : undefined,
    orderBy: { data: "desc" },
  });
  return rows.map((c) => ({
    id: c.id,
    descricao: c.descricao,
    categoria: c.categoria as CategoriasCusto,
    valor: decimalToNumber(c.valor) ?? 0,
    moeda: c.moeda as MoedaAtivo,
    data: c.data.toISOString(),
    recorrente: c.recorrente,
    taxaCambioNaDia: decimalToNumber(c.taxaCambioNaDia),
  }));
}

/** Ponto da série mensal (gráfico de evolução). */
export interface PontoMensal {
  mes: string;
  investimento: number;
  receita: number;
  lucro: number;
}

/** Série dos últimos N meses: investimento × receita × lucro (BRL). */
export async function getSerieMensal(meses = 6): Promise<PontoMensal[]> {
  const [ativos, custos, taxaAtual] = await Promise.all([
    getAtivosFinanceiros(),
    getCustosOperacionais(),
    getTaxaAtual(),
  ]);
  const now = new Date();
  const out: PontoMensal[] = [];
  for (let i = meses - 1; i >= 0; i--) {
    // Referência no meio do mês (longe das bordas) → período em fuso SP.
    const ref = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 15, 12),
    );
    const periodo = periodoDoMesSP(ref);
    const m = calcularMetricas(ativos, custos, periodo, taxaAtual);
    out.push({
      mes: periodo.inicio.toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
        timeZone: "America/Sao_Paulo",
      }),
      investimento: Math.round(m.investimentoTotal),
      receita: Math.round(m.receitaRealizada),
      lucro: Math.round(m.lucroRealizado),
    });
  }
  return out;
}

/** Ponto de entrada principal: métricas financeiras de um período. */
export async function getMetricasFinanceiras(
  periodo: PeriodoFiltro,
): Promise<MetricasFinanceiras> {
  const [ativos, custos, taxaAtual] = await Promise.all([
    getAtivosFinanceiros(),
    getCustosOperacionais(),
    getTaxaAtual(),
  ]);
  return calcularMetricas(ativos, custos, periodo, taxaAtual);
}

// ─── Ativos paginados/filtrados ───────────────────────────────────────────────

/** AtivoFinanceiro com datas serializadas (ISO) para Client Components. */
export type SerializedAtivoFinanceiro = Omit<
  AtivoFinanceiro,
  "dataEntrada" | "dataSaida"
> & {
  dataEntrada: string | null;
  dataSaida: string | null;
};

export interface AtivosQueryParams {
  q?: string;
  status?: string;
  tipo?: string;
  origem?: string;
  fornecedor?: string;
  periodo?: PeriodoFiltro;
  page: number;
  pageSize: number;
}

export interface AtivosPageResult {
  items: SerializedAtivoFinanceiro[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

function serializeAtivo(a: AtivoFinanceiro): SerializedAtivoFinanceiro {
  return {
    ...a,
    dataEntrada: a.dataEntrada?.toISOString() ?? null,
    dataSaida: a.dataSaida?.toISOString() ?? null,
  };
}

/**
 * Ativos filtrados e paginados. Status/tipo aplicados no DB; demais filtros e
 * paginação em memória (aceitável para centenas de ativos).
 */
export async function getAtivosFinanceirosPaginados(
  params: AtivosQueryParams,
): Promise<AtivosPageResult> {
  const { q, status, tipo, origem, fornecedor, periodo, page, pageSize } =
    params;

  const assetWhere: Prisma.AssetWhereInput = {};
  const pageWhere: Prisma.PageWhereInput = {};

  if (status && status !== "todos") {
    assetWhere.statusVenda = status;
    pageWhere.status = status;
  }
  if (tipo && tipo !== "todos") {
    assetWhere.tipo = tipo;
    pageWhere.tipo = tipo;
  }

  const [rawAssets, rawPages] = await Promise.all([
    origem !== "page"
      ? prisma.asset.findMany({ select: ASSET_SELECT, where: assetWhere })
      : Promise.resolve([] as AssetRow[]),
    origem !== "asset"
      ? prisma.page.findMany({ select: PAGE_SELECT, where: pageWhere })
      : Promise.resolve([] as PageRow[]),
  ]);

  let filtered: AtivoFinanceiro[] = [
    ...rawAssets.map(mapAsset),
    ...rawPages.map(mapPage),
  ];

  if (q?.trim()) {
    const lower = q.trim().toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.titulo.toLowerCase().includes(lower) ||
        (a.fornecedor?.toLowerCase().includes(lower) ?? false),
    );
  }

  if (fornecedor?.trim()) {
    const lower = fornecedor.trim().toLowerCase();
    filtered = filtered.filter(
      (a) => a.fornecedor?.toLowerCase().includes(lower) ?? false,
    );
  }

  if (periodo) {
    filtered = filtered.filter(
      (a) =>
        a.dataEntrada !== null &&
        a.dataEntrada >= periodo.inicio &&
        a.dataEntrada <= periodo.fim,
    );
  }

  // Mais recente primeiro; sem dataEntrada vai para o final
  filtered.sort((a, b) => {
    const ta = a.dataEntrada?.getTime() ?? -1;
    const tb = b.dataEntrada?.getTime() ?? -1;
    return tb - ta;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize).map(serializeAtivo);

  return { items, total, page: safePage, pageSize, totalPages };
}

/** Valores únicos de fornecedor em Asset + Page (ordenados). */
export async function getFornecedores(): Promise<string[]> {
  const [assetRows, pageRows] = await Promise.all([
    prisma.asset.findMany({
      where: { fornecedor: { not: null } },
      select: { fornecedor: true },
      distinct: ["fornecedor"],
    }),
    prisma.page.findMany({
      where: { fornecedor: { not: null } },
      select: { fornecedor: true },
      distinct: ["fornecedor"],
    }),
  ]);
  return [
    ...new Set([
      ...assetRows.map((a) => a.fornecedor!),
      ...pageRows.map((p) => p.fornecedor!),
    ]),
  ].sort();
}
