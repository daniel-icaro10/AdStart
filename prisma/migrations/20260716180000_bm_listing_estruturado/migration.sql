-- BMListing (DESIGN.md §4): campos estruturados novos em Asset.
-- Aditivo — só colunas nulas, nada escrito. Backfill real fica para depois
-- da validação do parse (ver scripts/parse-bm-conteudo.ts).
ALTER TABLE "Asset" ADD COLUMN "pais" TEXT;
ALTER TABLE "Asset" ADD COLUMN "limiteContas" INTEGER;
ALTER TABLE "Asset" ADD COLUMN "gastoTotal" DOUBLE PRECISION;

-- ContaAnuncio (DESIGN.md §4): único campo novo em AdAccount.
ALTER TABLE "AdAccount" ADD COLUMN "threshold" DOUBLE PRECISION;
