/**
 * PREVIEW-ONLY — parseia o texto livre (`conteudo`) das BMs reais para os
 * campos estruturados de DESIGN.md §4 (BMListing / ContaAnuncio).
 *
 * Este script é 100% LEITURA: só faz `findMany`, nunca `update`/`create`.
 * Roda com: DATABASE_URL="$DIRECT_URL" npx tsx scripts/parse-bm-conteudo.ts
 * Imprime um JSON (no stdout) com o resultado do parse de cada BM + cada
 * conta de anúncio encontrada no texto, para revisão humana ANTES de
 * qualquer backfill real no banco.
 *
 * Princípio: melhor `null`/"não encontrado" do que um valor inventado.
 * Cada campo carrega o texto bruto que originou o valor, para conferência.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type Moeda = "BRL" | "USD" | "EUR";

// ─── Normalização de valores monetários em texto livre ──────────────────────

/**
 * Converte uma string numérica capturada do texto livre para number.
 * Regra determinística (não tenta "adivinhar" formato ambíguo):
 *  - Tem vírgula → formato BR: remove pontos (milhar), vírgula vira ponto.
 *  - Sem vírgula, mas com um único ponto seguido de 3 dígitos → milhar BR
 *    (ex.: "18.900" = 18900), remove o ponto.
 *  - Sem vírgula, ponto seguido de 1-2 dígitos → decimal literal (ex.: "7.99").
 *  - Só dígitos → número inteiro direto.
 */
function parseValorBR(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;
  if (s.includes(",")) {
    const n = parseFloat(s.replace(/\./g, "").replace(",", "."));
    return isNaN(n) ? null : n;
  }
  if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    const n = parseFloat(s.replace(/\./g, ""));
    return isNaN(n) ? null : n;
  }
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

interface MoneyMatch {
  value: number;
  raw: string;
  symbol: string;
}

/**
 * Acha TODOS os valores monetários numa string. Aceita as 3 ordens vistas no
 * texto real: símbolo-antes ("US$ 900"), código-depois ("100 USD") e
 * símbolo-depois-colado ("divida 100$", "250€" — atalho informal comum).
 */
function findAllMoney(text: string): MoneyMatch[] {
  const out: MoneyMatch[] = [];
  const symbolFirst = /(US\$|U\$|R\$|€|\$)\s*(\d[\d.,]*)/g;
  const numberFirstCode = /(\d[\d.,]*)\s*(USD|BRL|EUR)\b/gi;
  const numberFirstSymbol = /(\d[\d.,]*)\s*(US\$|U\$|R\$|€|\$)/g;

  let m: RegExpExecArray | null;
  while ((m = symbolFirst.exec(text))) {
    const value = parseValorBR(m[2]);
    if (value != null) out.push({ value, raw: m[0], symbol: m[1] });
  }
  while ((m = numberFirstCode.exec(text))) {
    const value = parseValorBR(m[1]);
    if (value != null) {
      const symbol =
        m[2].toUpperCase() === "USD"
          ? "US$"
          : m[2].toUpperCase() === "EUR"
            ? "€"
            : "R$";
      out.push({ value, raw: m[0], symbol });
    }
  }
  while ((m = numberFirstSymbol.exec(text))) {
    const value = parseValorBR(m[1]);
    if (value != null) out.push({ value, raw: m[0], symbol: m[2] });
  }
  return out;
}

const SYMBOLS_BY_MOEDA: Record<Moeda, string[]> = {
  BRL: ["R$"],
  USD: ["US$", "U$", "$"],
  EUR: ["€"],
};

/** Acha o primeiro valor monetário de uma linha, preferindo o símbolo da moeda do ativo. */
function findMoneyPreferring(
  text: string,
  moeda: Moeda,
): { value: number; raw: string; confianca: "alta" | "baixa" } | null {
  const all = findAllMoney(text);
  if (all.length === 0) return null;
  const preferido = all.find((m) => SYMBOLS_BY_MOEDA[moeda].includes(m.symbol));
  if (preferido) {
    return { value: preferido.value, raw: preferido.raw, confianca: "alta" };
  }
  // símbolo esperado não apareceu — usa o primeiro valor mesmo assim, mas avisa.
  return { value: all[0].value, raw: all[0].raw, confianca: "baixa" };
}

// ─── Campos de nível BM (BMListing) ──────────────────────────────────────────

interface CampoParse<T> {
  valor: T | null;
  origem: string | null; // trecho do texto que originou o valor
  confianca: "alta" | "baixa" | "ausente";
}

function campoAusente<T>(): CampoParse<T> {
  return { valor: null, origem: null, confianca: "ausente" };
}

function parseAnoCriacao(conteudo: string): CampoParse<number> {
  let m = conteudo.match(/ano de cria[cç][aã]o:?\s*(\d{4})/i);
  if (m) return { valor: Number(m[1]), origem: m[0], confianca: "alta" };
  m = conteudo.match(/criada? em \d{1,2}\/\d{1,2}\/(\d{4})/i);
  if (m) return { valor: Number(m[1]), origem: m[0], confianca: "alta" };
  m = conteudo.match(/\/\/\s*ano\s*(\d{4})/i);
  if (m) return { valor: Number(m[1]), origem: m[0], confianca: "baixa" };
  return campoAusente();
}

function parseTierTexto(conteudo: string): CampoParse<string> {
  const m = conteudo.match(/tier\s*(\d\+*)/i);
  if (!m) return campoAusente();
  return { valor: m[1], origem: m[0], confianca: "alta" };
}

/** País ISO — só inferido do ícone (flag) já cadastrado; texto livre não menciona país explicitamente. */
function paisDoIcone(icone: string | null): CampoParse<string> {
  if (icone === "BR" || icone === "US") {
    return { valor: icone, origem: `icone="${icone}"`, confianca: "alta" };
  }
  if (icone === "EU") {
    // "EU" é zona da moeda (Euro), não um país ISO real — não dá pra inferir país.
    return { valor: null, origem: `icone="EU" (zona, não país)`, confianca: "ausente" };
  }
  return campoAusente();
}

function parseLimiteContas(conteudo: string): CampoParse<number> {
  let m = conteudo.match(/limite de (\d+)\s*contas?/i);
  if (m) return { valor: Number(m[1]), origem: m[0], confianca: "alta" };
  m = conteudo.match(/BM\s?(\d+)\s*(?:USA)?\b/i);
  if (m) return { valor: Number(m[1]), origem: m[0], confianca: "alta" };
  m = conteudo.match(/account limit:\s*BM\s?(\d+)/i);
  if (m) return { valor: Number(m[1]), origem: m[0], confianca: "alta" };
  return campoAusente();
}

function parseContasCriadasExplicito(conteudo: string): CampoParse<number> {
  const m = conteudo.match(
    /(\d+)\s*contas?\s*de\s*an[uú]ncios?\s*criad[ao]s?/i,
  );
  if (m) return { valor: Number(m[1]), origem: m[0], confianca: "alta" };
  return campoAusente();
}

function parseGastoTotal(conteudo: string, moeda: Moeda): CampoParse<number> {
  const linhas = conteudo.split("\n");
  const linha = linhas.find((l) => /gastos?\s*totais?/i.test(l));
  if (!linha) return campoAusente();
  const achado = findMoneyPreferring(linha, moeda);
  if (!achado) return campoAusente();
  return { valor: achado.value, origem: achado.raw, confianca: achado.confianca };
}

function parseVerificadaTexto(conteudo: string): boolean {
  return /BM\s*Verificada/i.test(conteudo);
}

// ─── ContaAnuncio (blocos "CA 0N ... ") ──────────────────────────────────────

export interface ContaParse {
  rotulo: string;
  moedaDetectada: Moeda | null;
  gasto: CampoParse<number>;
  limiteMeta: CampoParse<number>;
  ciclo: CampoParse<number>;
  threshold: CampoParse<number>;
  divida: CampoParse<number>;
  semDadosReais: boolean; // bloco tipo "Disponível"/"SEM GASTOS" (slot não criado)
  blocoBruto: string;
}

function detectarMoedaBloco(bloco: string, fallback: Moeda): Moeda {
  if (/conta em usd|conta em \$/i.test(bloco)) return "USD";
  if (/conta em eur/i.test(bloco)) return "EUR";
  if (/conta em (r\$|brl)/i.test(bloco)) return "BRL";
  const money = findAllMoney(bloco);
  if (money.length > 0) {
    const s = money[0].symbol;
    if (s === "€") return "EUR";
    if (s === "R$") return "BRL";
    return "USD";
  }
  return fallback;
}

function parseCampoAposLabel(
  bloco: string,
  labelRegex: RegExp,
  moeda: Moeda,
): CampoParse<number> {
  const m = bloco.match(labelRegex);
  if (!m) return campoAusente();
  const resto = bloco.slice((m.index ?? 0) + m[0].length, (m.index ?? 0) + m[0].length + 60);
  const achado = findMoneyPreferring(resto, moeda);
  if (!achado) return campoAusente();
  return { valor: achado.value, origem: `${m[0]}${achado.raw}`, confianca: achado.confianca };
}

function parseDivida(bloco: string, moeda: Moeda): CampoParse<number> {
  if (/sem\s*d[ií]vidas?/i.test(bloco)) {
    return { valor: 0, origem: "sem dívidas (texto)", confianca: "alta" };
  }
  const m = bloco.match(/d[ií]vida:?\s*/i);
  if (m) {
    const resto = bloco.slice((m.index ?? 0) + m[0].length, (m.index ?? 0) + m[0].length + 40);
    const achado = findMoneyPreferring(resto, moeda);
    if (achado) {
      return { valor: achado.value, origem: `${m[0]}${achado.raw}`, confianca: achado.confianca };
    }
  }
  return campoAusente(); // não informado — não presumir 0 silenciosamente
}

interface Ocorrencia {
  num: string;
  index: number;
  matchEnd: number;
}

function findCaOcorrencias(conteudo: string): Ocorrencia[] {
  const re = /CA\s*0?(\d+)/gi;
  const out: Ocorrencia[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(conteudo))) {
    out.push({ num: m[1], index: m.index, matchEnd: m.index + m[0].length });
  }
  return out;
}

/**
 * Gap entre duas ocorrências "CA N" que é só um CONECTOR DE FAIXA
 * ("CA 02 ao CA 05", "CA 03, CA 04,CA 05") — nada de conteúdo real entre
 * elas. Quando o gap bate aqui, as duas ocorrências são a MESMA menção
 * (uma faixa de slots), não dois blocos distintos — evita cortar o
 * primeiro número no meio da frase antes de chegar em "SEM GASTOS"/
 * "Disponíveis", que é o que de fato diz se a faixa tem dado real ou não.
 */
const CONECTOR_FAIXA = /^[\s,]*(?:ao|a|e)?[\s,]*$/i;

interface GrupoCa {
  nums: string[];
  inicio: number;
  fimMatch: number;
}

function agruparOcorrencias(conteudo: string, ocorrencias: Ocorrencia[]): GrupoCa[] {
  const grupos: GrupoCa[] = [];
  for (const oc of ocorrencias) {
    const ultimo = grupos[grupos.length - 1];
    if (ultimo) {
      const gap = conteudo.slice(ultimo.fimMatch, oc.index);
      if (CONECTOR_FAIXA.test(gap)) {
        ultimo.nums.push(oc.num);
        ultimo.fimMatch = oc.matchEnd;
        continue;
      }
    }
    grupos.push({ nums: [oc.num], inicio: oc.index, fimMatch: oc.matchEnd });
  }
  return grupos;
}

function rotuloDoGrupo(nums: string[]): string {
  if (nums.length === 1) return `CA ${nums[0].padStart(2, "0")}`;
  return `CA ${nums.map((n) => n.padStart(2, "0")).join("/")}`;
}

function parseContas(conteudo: string, assetMoeda: Moeda): ContaParse[] {
  const ocorrencias = findCaOcorrencias(conteudo);
  const grupos = agruparOcorrencias(conteudo, ocorrencias);
  const out: ContaParse[] = [];

  for (let i = 0; i < grupos.length; i++) {
    const grupo = grupos[i];
    // fim = início do PRÓXIMO GRUPO (não da próxima ocorrência crua) OU "📊".
    const fimProximoGrupo = grupos[i + 1]?.inicio ?? conteudo.length;
    const resumoIdx = conteudo.indexOf("📊", grupo.inicio);
    const fim =
      resumoIdx !== -1 && resumoIdx < fimProximoGrupo ? resumoIdx : fimProximoGrupo;
    const bloco = conteudo.slice(grupo.inicio, fim);

    // "disponíve(l|is)" cobre singular e plural; "sem gastos"/"desativada"/
    // "dead" são as outras formas de "slot sem dado real" vistas no texto.
    const semDadosReais =
      /dispon[ií]ve|sem gastos|desativada|dead/i.test(bloco) &&
      !/gastos:\s*[^\n]*\d/i.test(bloco);

    const moedaDetectada = detectarMoedaBloco(bloco, assetMoeda);

    out.push({
      rotulo: rotuloDoGrupo(grupo.nums),
      moedaDetectada,
      gasto: parseCampoAposLabel(bloco, /gastos?:?\s*/i, moedaDetectada),
      limiteMeta: parseCampoAposLabel(
        bloco,
        /limit(?:e)?\s*meta:?\s*/i,
        moedaDetectada,
      ),
      ciclo: parseCampoAposLabel(bloco, /ciclo:?\s*/i, moedaDetectada),
      threshold: parseCampoAposLabel(bloco, /threshold:?\s*/i, moedaDetectada),
      divida: parseDivida(bloco, moedaDetectada),
      semDadosReais,
      blocoBruto: bloco.trim().slice(0, 200),
    });
  }

  return out;
}

// ─── Execução (só leitura) ───────────────────────────────────────────────────

async function main() {
  const assets = await prisma.asset.findMany({
    select: {
      id: true,
      codigo: true,
      titulo: true,
      moeda: true,
      icone: true,
      anoCriacao: true,
      tier: true,
      qtdContas: true,
      totalGastosBRL: true,
      totalGastosUSD: true,
      verificada: true,
      conteudo: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const resultado = assets.map((a) => {
    const moeda = (a.moeda as Moeda) ?? "BRL";
    const conteudo = a.conteudo ?? "";

    const anoCriacao = parseAnoCriacao(conteudo);
    const tierTexto = parseTierTexto(conteudo);
    const pais = paisDoIcone(a.icone);
    const limiteContas = parseLimiteContas(conteudo);
    const contasCriadasExplicito = parseContasCriadasExplicito(conteudo);
    const gastoTotal = parseGastoTotal(conteudo, moeda);
    const verificadaTexto = parseVerificadaTexto(conteudo);
    const contas = parseContas(conteudo, moeda);
    const contasComDados = contas.filter((c) => !c.semDadosReais);

    // conflito: tier já no banco E tier mencionado no texto divergem
    const tierConflito =
      a.tier != null &&
      tierTexto.valor != null &&
      String(a.tier) !== tierTexto.valor.replace(/\+/g, "");

    // contasCriadas: prioriza menção explícita "criada(s)"; senão usa contagem
    // de blocos CA com dado real como estimativa (confiança baixa).
    const contasCriadas: CampoParse<number> =
      contasCriadasExplicito.valor != null
        ? contasCriadasExplicito
        : contasComDados.length > 0
          ? {
              valor: contasComDados.length,
              origem: `contagem de blocos "CA N" com Gastos: real`,
              confianca: "baixa",
            }
          : campoAusente();

    return {
      id: a.id,
      codigo: a.codigo,
      conteudo,
      moeda,
      dbAtual: {
        anoCriacao: a.anoCriacao,
        tier: a.tier,
        qtdContas: a.qtdContas,
        totalGastosBRL: a.totalGastosBRL,
        totalGastosUSD: a.totalGastosUSD,
        verificada: a.verificada,
      },
      parse: {
        anoCriacao,
        pais,
        limiteContas,
        contasCriadas,
        gastoTotal,
        tierTexto,
        tierConflito,
        verificadaTexto,
        verificadaConflito: verificadaTexto && a.verificada === false,
      },
      contas,
    };
  });

  console.log(JSON.stringify(resultado, null, 2));
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("ERRO:", e);
  process.exit(1);
});
