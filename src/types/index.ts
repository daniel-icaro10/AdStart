import type { Asset, AdAccount, AssetImage } from "@prisma/client";

/** Asset com suas contas de anúncio carregadas — formato usado na landing. */
export type AssetWithContas = Asset & {
  contas: AdAccount[];
};

/** Asset com contas + imagens — usado na área admin (edição). */
export type AssetWithDetails = Asset & {
  contas: AdAccount[];
  imagens: AssetImage[];
};

/** Estatísticas agregadas exibidas na StatBar da landing. */
export interface CatalogStats {
  totalDisponiveis: number;
  totalDolar: number;
  totalVerificadas: number;
  totalPaginasDisponiveis: number;
}
