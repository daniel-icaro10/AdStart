import type { Prisma, AdAccount, AssetImage, PageImage } from "@prisma/client";

/**
 * Campos PÚBLICOS de um Asset exibidos na vitrine. Allowlist explícita — NUNCA
 * inclui campos financeiros (custoAquisicao, fornecedor, precoVenda, comprador,
 * margem, taxa…), que não podem vazar para rotas públicas.
 * O `select` correspondente vive em src/lib/assets.ts (PUBLIC_ASSET_SELECT) e o
 * compilador garante que a query bate com este tipo.
 */
export type AssetWithContas = Prisma.AssetGetPayload<{
  select: {
    id: true;
    codigo: true;
    titulo: true;
    moeda: true;
    categoria: true;
    anoCriacao: true;
    totalGastosBRL: true;
    totalGastosUSD: true;
    qtdContas: true;
    verificada: true;
    semDividas: true;
    semBloqueios: true;
    statusVenda: true;
    valor: true;
    destaque: true;
    icone: true;
    conteudo: true;
    tier: true;
    createdAt: true;
    updatedAt: true;
  };
}>;

/** Campos PÚBLICOS de uma Página (sem nada financeiro). */
export type PagePublic = Prisma.PageGetPayload<{
  select: {
    id: true;
    nome: true;
    categoria: true;
    kind: true;
    status: true;
    valor: true;
    destaque: true;
    conteudo: true;
    imagens: { select: { data: true } };
  };
}>;

/** Asset com contas + imagens — usado na área admin (edição, dados completos). */
export type AssetWithDetails = Prisma.AssetGetPayload<{
  include: { contas: true; imagens: true };
}> & { contas: AdAccount[]; imagens: AssetImage[] };

/** Página com imagens — usado na área admin (edição, dados completos). */
export type PageWithImages = Prisma.PageGetPayload<{
  include: { imagens: true };
}> & { imagens: PageImage[] };

/** Cliente com plano vinculado + linhas da planilha — CRM de aluguéis (admin). */
export type ClientWithPlan = Prisma.ClientGetPayload<{
  include: { plan: true; entries: true };
}>;

/** Estatísticas agregadas exibidas na StatBar da landing. */
export interface CatalogStats {
  totalDisponiveis: number;
  totalDolar: number;
  totalVerificadas: number;
  totalPaginasDisponiveis: number;
}
