import { describe, it, expect } from "vitest";
import {
  calcularMetricas,
  toBRL,
  periodoDoMesSP,
  type AtivoFinanceiro,
  type CustoSerializado,
  type PeriodoFiltro,
} from "../financeiro-calc";

// ─── Fixtures ───────────────────────────────────────────────────────────────

const PERIODO: PeriodoFiltro = {
  inicio: new Date("2026-06-01T00:00:00.000Z"),
  fim: new Date("2026-06-30T23:59:59.999Z"),
};
const TAXA = 5;

function ativo(p: Partial<AtivoFinanceiro>): AtivoFinanceiro {
  return {
    id: Math.random().toString(36).slice(2),
    origem: "asset",
    grupo: "BM",
    titulo: "Ativo",
    tipo: "BM",
    fornecedor: null,
    statusVenda: "DISPONIVEL",
    custoAquisicao: null,
    moedaCusto: "BRL",
    dataEntrada: null,
    precoPrevisto: null,
    precoVenda: null,
    moedaVenda: "BRL",
    taxaVendaNaDia: null,
    comprador: null,
    dataSaida: null,
    motivoPerda: null,
    observacoes: null,
    taxaCambioNaDia: null,
    ...p,
  };
}

const dentro = new Date("2026-06-15T12:00:00.000Z");
const fora = new Date("2026-05-15T12:00:00.000Z");

// ─── toBRL ──────────────────────────────────────────────────────────────────

describe("toBRL", () => {
  it("mantém BRL inalterado", () => {
    expect(toBRL(100, "BRL", null, 5)).toBe(100);
  });
  it("converte USD pela taxa de fallback quando não há taxa do dia", () => {
    expect(toBRL(100, "USD", null, 5)).toBe(500);
  });
  it("usa a taxa histórica do dia quando disponível", () => {
    expect(toBRL(100, "USD", 4.8, 5)).toBe(480);
  });
  it("trata moeda null como BRL", () => {
    expect(toBRL(100, null, null, 5)).toBe(100);
  });
});

// ─── Lucro realizado ──────────────────────────────────────────────────────────

describe("calcularMetricas — lucro realizado", () => {
  it("calcula lucro = precoVenda − custo nos vendidos do período", () => {
    const ativos = [
      ativo({
        statusVenda: "VENDIDO",
        custoAquisicao: 1000,
        precoVenda: 1500,
        dataSaida: dentro,
      }),
    ];
    const m = calcularMetricas(ativos, [], PERIODO, TAXA);
    expect(m.receitaRealizada).toBe(1500);
    expect(m.lucroRealizado).toBe(500);
    expect(m.totalVendidoPeriodo).toBe(1);
  });

  it("desconta custos operacionais do lucro realizado", () => {
    const ativos = [
      ativo({
        statusVenda: "VENDIDO",
        custoAquisicao: 1000,
        precoVenda: 1500,
        dataSaida: dentro,
      }),
    ];
    const custos: CustoSerializado[] = [
      {
        id: "c1",
        descricao: "Proxies",
        categoria: "INFRAESTRUTURA",
        valor: 200,
        moeda: "BRL",
        data: dentro,
        recorrente: true,
        taxaCambioNaDia: null,
      },
    ];
    const m = calcularMetricas(ativos, custos, PERIODO, TAXA);
    expect(m.lucroRealizado).toBe(300); // 500 − 200
  });

  it("ignora vendas fora do período", () => {
    const ativos = [
      ativo({
        statusVenda: "VENDIDO",
        custoAquisicao: 1000,
        precoVenda: 1500,
        dataSaida: fora,
      }),
    ];
    const m = calcularMetricas(ativos, [], PERIODO, TAXA);
    expect(m.totalVendidoPeriodo).toBe(0);
    expect(m.lucroRealizado).toBe(0);
  });
});

// ─── Vendas sem custo ─────────────────────────────────────────────────────────

describe("calcularMetricas — vendas sem custo", () => {
  it("conta na receita mas fica fora do lucro e do ROI", () => {
    const ativos = [
      ativo({
        statusVenda: "VENDIDO",
        custoAquisicao: null, // sem custo
        precoVenda: 800,
        dataSaida: dentro,
      }),
    ];
    const m = calcularMetricas(ativos, [], PERIODO, TAXA);
    expect(m.receitaRealizada).toBe(800);
    expect(m.vendasSemCusto).toBe(1);
    expect(m.lucroRealizado).toBe(0);
    expect(m.roiRealizado).toBe(0); // denominador 0
  });
});

// ─── Conversão USD ────────────────────────────────────────────────────────────

describe("calcularMetricas — câmbio USD", () => {
  it("converte custo USD para BRL usando taxa do dia", () => {
    const ativos = [
      ativo({
        statusVenda: "VENDIDO",
        custoAquisicao: 100,
        moedaCusto: "USD",
        taxaCambioNaDia: 5,
        precoVenda: 800, // BRL
        dataSaida: dentro,
      }),
    ];
    const m = calcularMetricas(ativos, [], PERIODO, TAXA);
    // custo 100 USD * 5 = 500 BRL; lucro = 800 − 500 = 300
    expect(m.lucroRealizado).toBe(300);
  });
});

// ─── Perdas ───────────────────────────────────────────────────────────────────

describe("calcularMetricas — perdas e taxa de perda", () => {
  it("soma custo dos perdidos no período e calcula taxa de perda", () => {
    const ativos = [
      ativo({
        statusVenda: "VENDIDO",
        custoAquisicao: 1000,
        precoVenda: 1500,
        dataSaida: dentro,
      }),
      ativo({
        statusVenda: "PERDIDO",
        custoAquisicao: 700,
        dataSaida: dentro,
        motivoPerda: "ban",
      }),
    ];
    const m = calcularMetricas(ativos, [], PERIODO, TAXA);
    expect(m.perdas).toBe(700);
    expect(m.totalPerdidoPeriodo).toBe(1);
    // 1 perdido / (1 vendido + 1 perdido) = 50%
    expect(m.taxaPerda).toBe(50);
  });
});

// ─── ROI ──────────────────────────────────────────────────────────────────────

describe("calcularMetricas — ROI", () => {
  it("ROI = lucro / (custo das vendas + custos op) × 100", () => {
    const ativos = [
      ativo({
        statusVenda: "VENDIDO",
        custoAquisicao: 1000,
        precoVenda: 1500,
        dataSaida: dentro,
      }),
    ];
    const custos: CustoSerializado[] = [
      {
        id: "c1",
        descricao: "Tráfego",
        categoria: "TRAFEGO",
        valor: 200,
        moeda: "BRL",
        data: dentro,
        recorrente: false,
        taxaCambioNaDia: null,
      },
    ];
    const m = calcularMetricas(ativos, custos, PERIODO, TAXA);
    // lucro = (1500−1000) − 200 = 300; denom = 1000 + 200 = 1200
    expect(m.lucroRealizado).toBe(300);
    expect(m.roiRealizado).toBeCloseTo(25, 5); // 300/1200 = 25%
  });
});

// ─── Estoque ──────────────────────────────────────────────────────────────────

describe("calcularMetricas — estoque", () => {
  it("soma custo/potencial dos em estoque (ignora período) e lucro previsto", () => {
    const ativos = [
      ativo({ statusVenda: "DISPONIVEL", custoAquisicao: 1000, precoPrevisto: 1800 }),
      ativo({ statusVenda: "RESERVADO", custoAquisicao: 500, precoPrevisto: 900 }),
      ativo({ statusVenda: "VENDIDO", custoAquisicao: 999, precoVenda: 1, dataSaida: dentro }),
    ];
    const m = calcularMetricas(ativos, [], PERIODO, TAXA);
    expect(m.valorEstoqueCusto).toBe(1500);
    expect(m.valorEstoquePotencial).toBe(2700);
    expect(m.lucroPrevisto).toBe(1200);
    expect(m.totalEmEstoque).toBe(1);
    expect(m.totalReservado).toBe(1);
  });
});

// ─── Fronteiras de período em America/Sao_Paulo (UTC-3) ──────────────────────

describe("períodos — fronteiras no fuso America/Sao_Paulo", () => {
  it("mês de junho/2026: início 01/06 00:00 SP (=03:00Z) e fim 30/06 23:59:59.999 SP (=01/07 02:59:59.999Z)", () => {
    const p = periodoDoMesSP(new Date("2026-06-15T12:00:00.000Z"));
    expect(p.inicio.toISOString()).toBe("2026-06-01T03:00:00.000Z");
    expect(p.fim.toISOString()).toBe("2026-07-01T02:59:59.999Z");
  });

  it("venda às 02:00Z de 01/06 (= 31/05 23:00 em SP) NÃO entra em junho", () => {
    const p = periodoDoMesSP(new Date("2026-06-15T12:00:00.000Z"));
    const ativos = [
      ativo({
        statusVenda: "VENDIDO",
        custoAquisicao: 100,
        precoVenda: 200,
        dataSaida: new Date("2026-06-01T02:00:00.000Z"),
      }),
    ];
    const m = calcularMetricas(ativos, [], p, 5);
    expect(m.totalVendidoPeriodo).toBe(0);
  });

  it("venda às 03:00Z de 01/06 (= 01/06 00:00 em SP) entra em junho", () => {
    const p = periodoDoMesSP(new Date("2026-06-15T12:00:00.000Z"));
    const ativos = [
      ativo({
        statusVenda: "VENDIDO",
        custoAquisicao: 100,
        precoVenda: 200,
        dataSaida: new Date("2026-06-01T03:00:00.000Z"),
      }),
    ];
    const m = calcularMetricas(ativos, [], p, 5);
    expect(m.totalVendidoPeriodo).toBe(1);
  });
});

// ─── Moeda da venda (normalização da receita/lucro) ──────────────────────────

describe("calcularMetricas — moeda da venda", () => {
  it("venda em BRL não é convertida (raw)", () => {
    const ativos = [
      ativo({
        statusVenda: "VENDIDO",
        custoAquisicao: 160,
        moedaCusto: "BRL",
        precoVenda: 1990,
        moedaVenda: "BRL",
        dataSaida: dentro,
      }),
    ];
    const m = calcularMetricas(ativos, [], PERIODO, 5.5);
    expect(m.receitaRealizada).toBe(1990);
    expect(m.lucroRealizado).toBe(1830);
  });

  it("venda em USD é convertida pela taxa da venda", () => {
    const ativos = [
      ativo({
        statusVenda: "VENDIDO",
        custoAquisicao: 900,
        moedaCusto: "USD",
        taxaCambioNaDia: 5,
        precoVenda: 1990,
        moedaVenda: "USD",
        taxaVendaNaDia: 5,
        dataSaida: dentro,
      }),
    ];
    const m = calcularMetricas(ativos, [], PERIODO, 5);
    // venda 1990 USD × 5 = 9950 ; custo 900 USD × 5 = 4500 ; lucro = 5450
    expect(m.receitaRealizada).toBe(9950);
    expect(m.lucroRealizado).toBe(5450);
  });

  it("cenário real do bug: 3 vendas em BRL, custo USD convertido → receita 5970, lucro 210", () => {
    const ativos = [
      ativo({ statusVenda: "VENDIDO", custoAquisicao: 160, moedaCusto: "BRL", precoVenda: 1990, moedaVenda: "BRL", dataSaida: dentro }),
      ativo({ statusVenda: "VENDIDO", custoAquisicao: 900, moedaCusto: "USD", taxaCambioNaDia: 5.5, precoVenda: 1990, moedaVenda: "BRL", dataSaida: dentro }),
      ativo({ statusVenda: "VENDIDO", custoAquisicao: 650, moedaCusto: "BRL", precoVenda: 1990, moedaVenda: "BRL", dataSaida: dentro }),
    ];
    const m = calcularMetricas(ativos, [], PERIODO, 5.5);
    expect(m.receitaRealizada).toBe(5970);
    // 1830 + (1990 − 4950) + 1340 = 210  (lucro é rastreável e correto)
    expect(m.lucroRealizado).toBe(210);
  });
});

// ─── Lucro previsto (base equivalente) ───────────────────────────────────────

describe("calcularMetricas — lucro previsto sobre base equivalente", () => {
  it("só considera ativos precificados (custo E preço > 0); conta os sem preço", () => {
    const ativos = [
      ativo({ statusVenda: "DISPONIVEL", custoAquisicao: 1000, precoPrevisto: 1800 }), // precificado
      ativo({ statusVenda: "DISPONIVEL", custoAquisicao: 500, precoPrevisto: null }), // custo, sem preço → fora
      ativo({ statusVenda: "DISPONIVEL", custoAquisicao: 300, precoPrevisto: 0 }), // preço 0 → fora
      ativo({ statusVenda: "RESERVADO", custoAquisicao: null, precoPrevisto: 900 }), // preço, sem custo → fora
    ];
    const m = calcularMetricas(ativos, [], PERIODO, 5);
    expect(m.valorEstoquePotencial).toBe(1800); // só o precificado
    expect(m.lucroPrevisto).toBe(800); // 1800 − 1000 (bases equivalentes)
    expect(m.estoqueSemPreco).toBe(3);
    expect(m.valorEstoqueCusto).toBe(1800); // custo de todos com custo (1000+500+300)
  });
});

// ─── Estoque por moeda ────────────────────────────────────────────────────────

describe("calcularMetricas — quebra do estoque por moeda", () => {
  it("separa custo USD (em USD) e BRL (em BRL); consolida em BRL pela taxa", () => {
    const ativos = [
      ativo({ statusVenda: "DISPONIVEL", custoAquisicao: 100, moedaCusto: "USD" }),
      ativo({ statusVenda: "RESERVADO", custoAquisicao: 500, moedaCusto: "BRL" }),
      ativo({ statusVenda: "DISPONIVEL", custoAquisicao: 50, moedaCusto: null }),
    ];
    const m = calcularMetricas(ativos, [], PERIODO, 5);
    expect(m.estoqueCustoUSD).toBe(100); // só o USD, sem converter
    expect(m.estoqueCustoBRL).toBe(550); // 500 (BRL) + 50 (sem moeda → BRL)
    // consolidado: 100*5 + 550 = 1050
    expect(m.valorEstoqueCusto).toBe(1050);
  });
});

// ─── Investimento ─────────────────────────────────────────────────────────────

describe("calcularMetricas — investimento do período", () => {
  it("soma custo dos ativos que entraram no período + custos op", () => {
    const ativos = [
      ativo({ custoAquisicao: 1000, dataEntrada: dentro }),
      ativo({ custoAquisicao: 5000, dataEntrada: fora }), // fora do período
    ];
    const custos: CustoSerializado[] = [
      {
        id: "c1",
        descricao: "AdsPower",
        categoria: "FERRAMENTAS",
        valor: 300,
        moeda: "BRL",
        data: dentro,
        recorrente: true,
        taxaCambioNaDia: null,
      },
    ];
    const m = calcularMetricas(ativos, custos, PERIODO, TAXA);
    expect(m.investimentoTotal).toBe(1300); // 1000 + 300
  });
});

// ─── Faturamento por grupo (BM / Página / Perfil) ────────────────────────────

describe("calcularMetricas — faturamento por grupo", () => {
  it("separa receita/lucro/qtd por grupo dos vendidos no período", () => {
    const ativos = [
      // BM: receita 1500, lucro 500
      ativo({ grupo: "BM", origem: "asset", statusVenda: "VENDIDO", custoAquisicao: 1000, precoVenda: 1500, dataSaida: dentro }),
      // Página: receita 800, lucro 300
      ativo({ grupo: "PAGINA", origem: "page", statusVenda: "VENDIDO", custoAquisicao: 500, precoVenda: 800, dataSaida: dentro }),
      // Perfil: receita 1200, sem custo → lucro 0
      ativo({ grupo: "PERFIL", origem: "page", statusVenda: "VENDIDO", custoAquisicao: null, precoVenda: 1200, dataSaida: dentro }),
      // fora do período → ignorado
      ativo({ grupo: "BM", origem: "asset", statusVenda: "VENDIDO", custoAquisicao: 100, precoVenda: 999, dataSaida: fora }),
    ];
    const m = calcularMetricas(ativos, [], PERIODO, TAXA);
    expect(m.faturamentoPorGrupo.BM).toEqual({ receita: 1500, lucro: 500, quantidade: 1 });
    expect(m.faturamentoPorGrupo.PAGINA).toEqual({ receita: 800, lucro: 300, quantidade: 1 });
    expect(m.faturamentoPorGrupo.PERFIL).toEqual({ receita: 1200, lucro: 0, quantidade: 1 });
  });
});
