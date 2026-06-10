import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import {
  getAtivosFinanceiros,
  getMetricasFinanceiras,
  resolverPeriodo,
} from "@/lib/financeiro";

const TIPO_LABELS: Record<string, string> = {
  BM: "BM",
  CONTA_ANUNCIO: "Conta de anúncio",
  KIT: "Kit",
  PERFIL: "Perfil",
  PAGINA: "Página",
};

// CSV pt-BR: delimitador ';', decimal ',', com BOM para Excel abrir em UTF-8.
function toCsv(rows: (string | number | null)[][]): string {
  const esc = (v: string | number | null) =>
    `"${(v == null ? "" : String(v)).replace(/"/g, '""')}"`;
  return "﻿" + rows.map((r) => r.map(esc).join(";")).join("\r\n");
}

const money = (v: number | null) =>
  v == null ? "" : v.toFixed(2).replace(".", ",");
const date = (d: Date | null) =>
  d ? d.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" }) : "";

function csvResponse(filename: string, csv: string) {
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(req: Request) {
  // Defesa em profundidade: além do middleware, exige sessão admin aqui.
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const url = new URL(req.url);
  const tipo = url.searchParams.get("tipo") ?? "ativos";
  const hoje = new Date().toISOString().slice(0, 10);

  if (tipo === "resumo") {
    const { preset, periodo } = resolverPeriodo(
      url.searchParams.get("periodo") ?? undefined,
      url.searchParams.get("inicio") ?? undefined,
      url.searchParams.get("fim") ?? undefined,
    );
    const m = await getMetricasFinanceiras(periodo);
    const rows: (string | number | null)[][] = [
      ["Resumo financeiro (BRL)", ""],
      ["Período", preset],
      ["De", date(periodo.inicio)],
      ["Até", date(periodo.fim)],
      ["", ""],
      ["Métrica", "Valor"],
      ["Investimento total", money(m.investimentoTotal)],
      ["Receita realizada", money(m.receitaRealizada)],
      ["Lucro realizado", money(m.lucroRealizado)],
      ["Perdas", money(m.perdas)],
      ["ROI realizado (%)", money(m.roiRealizado)],
      ["Taxa de perda (%)", money(m.taxaPerda)],
      ["Vendas sem custo", m.vendasSemCusto],
      ["Estoque (custo)", money(m.valorEstoqueCusto)],
      ["Estoque (potencial)", money(m.valorEstoquePotencial)],
      ["Lucro previsto", money(m.lucroPrevisto)],
      ["Em estoque (qtd)", m.totalEmEstoque],
      ["Reservado (qtd)", m.totalReservado],
      ["Vendidos no período (qtd)", m.totalVendidoPeriodo],
      ["Perdidos no período (qtd)", m.totalPerdidoPeriodo],
    ];
    return csvResponse(`resumo-financeiro-${hoje}.csv`, toCsv(rows));
  }

  // tipo === "ativos": inventário completo
  const ativos = await getAtivosFinanceiros();
  const header = [
    "Origem",
    "Título",
    "Tipo",
    "Fornecedor",
    "Status",
    "Custo",
    "Moeda custo",
    "Preço previsto",
    "Preço venda",
    "Comprador",
    "Data entrada",
    "Data saída",
    "Motivo perda",
    "Observações",
  ];
  const rows: (string | number | null)[][] = [
    header,
    ...ativos.map((a) => [
      a.origem === "asset" ? "BM" : "Página",
      a.titulo,
      a.tipo ? TIPO_LABELS[a.tipo] ?? a.tipo : "",
      a.fornecedor ?? "",
      a.statusVenda,
      money(a.custoAquisicao),
      a.moedaCusto ?? "",
      money(a.precoPrevisto),
      money(a.precoVenda),
      a.comprador ?? "",
      date(a.dataEntrada),
      date(a.dataSaida),
      a.motivoPerda ?? "",
      a.observacoes ?? "",
    ]),
  ];
  return csvResponse(`ativos-financeiro-${hoje}.csv`, toCsv(rows));
}
