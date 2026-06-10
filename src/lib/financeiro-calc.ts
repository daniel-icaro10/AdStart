/**
 * Módulo de cálculos financeiros — ZERO dependências externas.
 * Todas as funções são puras (sem IO) e fáceis de testar.
 *
 * Convenções de moeda:
 *  - custoAquisicao e precoPrevisto: na moeda indicada por moedaCusto.
 *  - precoVenda: assumido sempre em BRL (venda no mercado nacional).
 *  - Conversão USD→BRL usa taxaCambioNaDia; fallback = taxaAtual do Setting.
 */

// ─── Constantes ───────────────────────────────────────────────────────────────

export const TAXA_CAMBIO_KEY = "taxa_cambio_usd_brl";
export const TAXA_CAMBIO_DEFAULT = 5.5;

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type TipoAtivo = "BM" | "CONTA_ANUNCIO" | "KIT" | "PERFIL" | "PAGINA";
export type StatusAtivo = "DISPONIVEL" | "RESERVADO" | "VENDIDO" | "PERDIDO";
export type MoedaAtivo = "BRL" | "USD";
export type CategoriasCusto =
  | "INFRAESTRUTURA"
  | "TRAFEGO"
  | "FERRAMENTAS"
  | "OUTROS";

/**
 * Representação unificada de um ativo (Asset ou Page) para cálculos financeiros.
 * Todos os campos Decimal já convertidos para number | null antes de chegar aqui.
 */
export interface AtivoFinanceiro {
  id: string;
  /** Tabela de origem: "asset" (BMs) ou "page" (perfis/páginas). */
  origem: "asset" | "page";
  titulo: string;
  tipo: TipoAtivo | null;
  fornecedor: string | null;
  statusVenda: StatusAtivo;
  /** Custo de aquisição na moedaCusto, como number. */
  custoAquisicao: number | null;
  moedaCusto: MoedaAtivo | null;
  dataEntrada: Date | null;
  /** Preço pretendido de venda na moedaCusto, como number. */
  precoPrevisto: number | null;
  /** Preço real da venda — assumido em BRL. */
  precoVenda: number | null;
  comprador: string | null;
  dataSaida: Date | null;
  motivoPerda: string | null;
  observacoes: string | null;
  /** Taxa USD→BRL na data da transação. null = usar taxaAtual do Setting. */
  taxaCambioNaDia: number | null;
}

export interface CustoSerializado {
  id: string;
  descricao: string;
  categoria: CategoriasCusto;
  valor: number;
  moeda: MoedaAtivo;
  data: Date;
  /** Apenas informativo — não multiplica automaticamente por período. */
  recorrente: boolean;
  taxaCambioNaDia: number | null;
}

export interface PeriodoFiltro {
  inicio: Date;
  fim: Date;
}

export interface MetricasFinanceiras {
  // ── Resultado do período (em BRL) ────────────────────────────────────
  /** custoAquisicao dos ativos que ENTRARAM no período + custos operacionais */
  investimentoTotal: number;
  /** Soma de precoVenda de TODOS os vendidos no período (incluindo sem custo) */
  receitaRealizada: number;
  /** (precoVenda − custoAquisicao) dos vendidos COM custo − custos operacionais */
  lucroRealizado: number;
  /** custoAquisicao dos ativos com status PERDIDO cuja dataSaida cai no período */
  perdas: number;
  /**
   * lucroRealizado / (custo_base_das_vendas_com_custo + custos_op) × 100.
   * Denominador exclui vendas sem custo para não distorcer o índice.
   */
  roiRealizado: number;
  /** perdidos / (vendidos + perdidos) × 100 */
  taxaPerda: number;
  /** Vendas no período sem custoAquisicao registrado — excluídas de lucro e ROI. */
  vendasSemCusto: number;
  // ── Estoque atual (todos os ativos, sem filtro de período) ────────────
  valorEstoqueCusto: number;
  valorEstoquePotencial: number;
  lucroPrevisto: number;
  // ── Contadores ───────────────────────────────────────────────────────
  totalEmEstoque: number;
  totalReservado: number;
  totalVendidoPeriodo: number;
  totalPerdidoPeriodo: number;
  // ── Para gráficos ────────────────────────────────────────────────────
  /** Margem bruta (sem descontar custos op) por tipo de ativo vendido no período. */
  lucroPorTipo: Record<string, { lucroRealizado: number; quantidade: number }>;
  /** Composição do estoque atual por tipo (custo em BRL e quantidade). */
  estoquePorTipo: Record<string, { custo: number; quantidade: number }>;
}

// ─── Conversão de tipos Prisma → primitivos ──────────────────────────────────

/**
 * Converte qualquer objeto com `.toNumber()` (ex: Prisma.Decimal) para number | null.
 * Usa duck typing para evitar importar Prisma aqui e manter o módulo testável.
 */
export function decimalToNumber(
  v: { toNumber(): number } | null | undefined,
): number | null {
  if (v === null || v === undefined) return null;
  return v.toNumber();
}

// ─── Conversão de moeda ───────────────────────────────────────────────────────

/**
 * Converte um valor monetário para BRL.
 *  - BRL ou null → retorna o valor sem alteração.
 *  - USD → multiplica pela taxaTransacao (histórica) ou taxaFallback (atual).
 */
export function toBRL(
  valor: number,
  moeda: MoedaAtivo | string | null,
  taxaTransacao: number | null,
  taxaFallback: number,
): number {
  if (!moeda || moeda === "BRL") return valor;
  // Apenas USD por enquanto; taxaTransacao preserva o câmbio do dia da compra.
  const taxa = taxaTransacao ?? taxaFallback;
  return valor * taxa;
}

// ─── Cálculo de métricas ─────────────────────────────────────────────────────

/**
 * Calcula todas as métricas financeiras.
 * Recebe dados já serializados (sem Decimal, sem IO) — 100% testável.
 *
 * Regras de negócio:
 * 1. Vendidos SEM custoAquisicao → somam à receitaRealizada, ficam FORA de
 *    lucroRealizado e do denominador do ROI (vendasSemCusto++).
 * 2. Conversão USD→BRL: taxaCambioNaDia da transação; fallback = taxaAtual.
 * 3. Flag `recorrente` nos custos operacionais é apenas informativo.
 */
export function calcularMetricas(
  ativos: AtivoFinanceiro[],
  custos: CustoSerializado[],
  periodo: PeriodoFiltro,
  taxaAtual: number,
): MetricasFinanceiras {
  // ── helpers locais ───────────────────────────────────────────────────
  const custoEmBRL = (a: AtivoFinanceiro): number | null => {
    if (a.custoAquisicao === null) return null;
    return toBRL(a.custoAquisicao, a.moedaCusto, a.taxaCambioNaDia, taxaAtual);
  };

  const previstoEmBRL = (a: AtivoFinanceiro): number | null => {
    if (a.precoPrevisto === null) return null;
    return toBRL(a.precoPrevisto, a.moedaCusto, a.taxaCambioNaDia, taxaAtual);
  };

  const inPeriod = (date: Date | null): boolean =>
    date !== null && date >= periodo.inicio && date <= periodo.fim;

  // ── partições ────────────────────────────────────────────────────────
  const emEstoque = ativos.filter(
    (a) => a.statusVenda === "DISPONIVEL" || a.statusVenda === "RESERVADO",
  );
  const vendidosNoPeriodo = ativos.filter(
    (a) => a.statusVenda === "VENDIDO" && inPeriod(a.dataSaida),
  );
  const perdidosNoPeriodo = ativos.filter(
    (a) => a.statusVenda === "PERDIDO" && inPeriod(a.dataSaida),
  );
  const entradosNoPeriodo = ativos.filter((a) => inPeriod(a.dataEntrada));

  // ── custos operacionais do período ───────────────────────────────────
  const custosNoPeriodo = custos.filter((c) => inPeriod(c.data));
  const totalCustosOp = custosNoPeriodo.reduce(
    (sum, c) => sum + toBRL(c.valor, c.moeda, c.taxaCambioNaDia, taxaAtual),
    0,
  );

  // ── investimento total ───────────────────────────────────────────────
  const custoEntradas = entradosNoPeriodo.reduce(
    (sum, a) => sum + (custoEmBRL(a) ?? 0),
    0,
  );
  const investimentoTotal = custoEntradas + totalCustosOp;

  // ── receita realizada ─────────────────────────────────────────────────
  // Inclui TODOS os vendidos (com ou sem custo registrado)
  const receitaRealizada = vendidosNoPeriodo.reduce(
    (sum, a) => sum + (a.precoVenda ?? 0),
    0,
  );

  // ── lucro realizado + contagem de vendas sem custo ────────────────────
  let vendasSemCusto = 0;
  let custoBaseDasVendas = 0; // denominador do ROI

  const lucroVendas = vendidosNoPeriodo.reduce((sum, a) => {
    const custo = custoEmBRL(a);
    if (custo === null) {
      vendasSemCusto++;
      return sum; // fora do lucro e do ROI
    }
    custoBaseDasVendas += custo;
    return sum + ((a.precoVenda ?? 0) - custo);
  }, 0);

  const lucroRealizado = lucroVendas - totalCustosOp;

  // ── perdas ────────────────────────────────────────────────────────────
  const perdas = perdidosNoPeriodo.reduce(
    (sum, a) => sum + (custoEmBRL(a) ?? 0),
    0,
  );

  // ── ROI ───────────────────────────────────────────────────────────────
  // Denominador = custo_base_das_vendas (exclui sem custo) + custos_op
  // Numerador   = lucroRealizado (já desconta custos_op)
  const denominadorRoi = custoBaseDasVendas + totalCustosOp;
  const roiRealizado =
    denominadorRoi > 0 ? (lucroRealizado / denominadorRoi) * 100 : 0;

  // ── taxa de perda ─────────────────────────────────────────────────────
  const totalSaidas = vendidosNoPeriodo.length + perdidosNoPeriodo.length;
  const taxaPerda =
    totalSaidas > 0 ? (perdidosNoPeriodo.length / totalSaidas) * 100 : 0;

  // ── estoque atual (sem filtro de período) ─────────────────────────────
  const valorEstoqueCusto = emEstoque.reduce(
    (sum, a) => sum + (custoEmBRL(a) ?? 0),
    0,
  );
  const valorEstoquePotencial = emEstoque.reduce(
    (sum, a) => sum + (previstoEmBRL(a) ?? 0),
    0,
  );
  const lucroPrevisto = valorEstoquePotencial - valorEstoqueCusto;

  // ── lucro bruto por tipo (sem descontar custos op, para comparação) ───
  const lucroPorTipo: Record<
    string,
    { lucroRealizado: number; quantidade: number }
  > = {};
  for (const a of vendidosNoPeriodo) {
    const tipo = a.tipo ?? "SEM_TIPO";
    const custo = custoEmBRL(a);
    if (!lucroPorTipo[tipo])
      lucroPorTipo[tipo] = { lucroRealizado: 0, quantidade: 0 };
    lucroPorTipo[tipo].quantidade++;
    if (custo !== null) {
      lucroPorTipo[tipo].lucroRealizado += (a.precoVenda ?? 0) - custo;
    }
  }

  // ── composição do estoque por tipo ────────────────────────────────────
  const estoquePorTipo: Record<string, { custo: number; quantidade: number }> =
    {};
  for (const a of emEstoque) {
    const tipo = a.tipo ?? "SEM_TIPO";
    if (!estoquePorTipo[tipo]) estoquePorTipo[tipo] = { custo: 0, quantidade: 0 };
    estoquePorTipo[tipo].quantidade++;
    estoquePorTipo[tipo].custo += custoEmBRL(a) ?? 0;
  }

  return {
    investimentoTotal,
    receitaRealizada,
    lucroRealizado,
    perdas,
    roiRealizado,
    taxaPerda,
    vendasSemCusto,
    valorEstoqueCusto,
    valorEstoquePotencial,
    lucroPrevisto,
    totalEmEstoque: emEstoque.filter((a) => a.statusVenda === "DISPONIVEL")
      .length,
    totalReservado: emEstoque.filter((a) => a.statusVenda === "RESERVADO")
      .length,
    totalVendidoPeriodo: vendidosNoPeriodo.length,
    totalPerdidoPeriodo: perdidosNoPeriodo.length,
    lucroPorTipo,
    estoquePorTipo,
  };
}

// ─── Períodos — fronteiras no fuso America/Sao_Paulo ─────────────────────────
// O Brasil não adota horário de verão desde 2019 → offset fixo de UTC-3.
// Datas são guardadas em UTC; aqui calculamos as bordas do dia/mês no relógio
// de São Paulo e convertemos para o instante UTC correspondente.

const SP_OFFSET_H = 3;

/** Componentes y/m/d do calendário de São Paulo para um instante UTC. */
function partesSP(d: Date): { y: number; m: number; day: number } {
  const sp = new Date(d.getTime() - SP_OFFSET_H * 3_600_000);
  return { y: sp.getUTCFullYear(), m: sp.getUTCMonth(), day: sp.getUTCDate() };
}

/** Instante UTC de uma parede-relógio (wall clock) em São Paulo. */
function spToUtc(
  y: number,
  m: number,
  day: number,
  hh = 0,
  mm = 0,
  ss = 0,
  ms = 0,
): Date {
  return new Date(Date.UTC(y, m, day, hh + SP_OFFSET_H, mm, ss, ms));
}

export type PeriodoPreset =
  | "mes_atual"
  | "mes_anterior"
  | "90_dias"
  | "total"
  | "custom";

/** Período do mês (em São Paulo) que contém o instante `ref`. */
export function periodoDoMesSP(ref: Date): PeriodoFiltro {
  const { y, m } = partesSP(ref);
  const inicio = spToUtc(y, m, 1);
  const proximoMes = spToUtc(y, m + 1, 1);
  return { inicio, fim: new Date(proximoMes.getTime() - 1) };
}

export function periodoMesAtual(): PeriodoFiltro {
  return periodoDoMesSP(new Date());
}

export function periodoMesAnterior(): PeriodoFiltro {
  const { y, m } = partesSP(new Date());
  return periodoDoMesSP(spToUtc(y, m - 1, 15, 12)); // meio do mês anterior (SP)
}

export function periodoUltimosDias(dias: number): PeriodoFiltro {
  const fim = new Date();
  const ref = new Date(fim.getTime() - dias * 86_400_000);
  const { y, m, day } = partesSP(ref);
  return { inicio: spToUtc(y, m, day), fim }; // início do dia SP de N dias atrás
}

export function periodoTotal(): PeriodoFiltro {
  return { inicio: new Date(0), fim: new Date() };
}

/** "YYYY-MM-DD" → início (00:00) ou fim (23:59:59.999) do dia em São Paulo. */
function parseDiaSP(s: string | undefined, fimDoDia: boolean): Date | null {
  if (!s) return null;
  const [y, m, day] = s.split("-").map(Number);
  if (!y || !m || !day) return null;
  if (!fimDoDia) return spToUtc(y, m - 1, day);
  return new Date(spToUtc(y, m - 1, day + 1).getTime() - 1);
}

/** Resolve preset/intervalo a partir de query params (datas custom em SP). */
export function resolverPeriodo(
  preset: string | undefined,
  inicio?: string,
  fim?: string,
): { preset: PeriodoPreset; periodo: PeriodoFiltro } {
  switch (preset) {
    case "mes_anterior":
      return { preset: "mes_anterior", periodo: periodoMesAnterior() };
    case "90_dias":
      return { preset: "90_dias", periodo: periodoUltimosDias(90) };
    case "total":
      return { preset: "total", periodo: periodoTotal() };
    case "custom": {
      const di = parseDiaSP(inicio, false);
      const df = parseDiaSP(fim, true);
      if (di && df) return { preset: "custom", periodo: { inicio: di, fim: df } };
      return { preset: "mes_atual", periodo: periodoMesAtual() };
    }
    default:
      return { preset: "mes_atual", periodo: periodoMesAtual() };
  }
}
