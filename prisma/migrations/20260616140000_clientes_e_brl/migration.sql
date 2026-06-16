-- 1) RentalPlan: preço passa a ser em R$ (renomeia coluna + converte valores pela taxa 5,50).
ALTER TABLE "RentalPlan" RENAME COLUMN "precoMensalUSD" TO "precoMensal";
UPDATE "RentalPlan" SET "precoMensal" = ROUND(("precoMensal" * 5.5)::numeric, 2);

-- 2) Financeiro sem USD: converte custos/vendas/operacionais em US$ para R$ (mantém asset.moeda da vitrine).
UPDATE "Asset"
   SET "custoAquisicao" = ROUND(("custoAquisicao" * COALESCE("taxaCambioNaDia", 5.5))::numeric, 2),
       "moedaCusto" = 'BRL',
       "taxaCambioNaDia" = NULL
 WHERE "moedaCusto" = 'USD';

UPDATE "Asset"
   SET "precoVenda" = ROUND(("precoVenda" * COALESCE("taxaVendaNaDia", 5.5))::numeric, 2),
       "moedaVenda" = 'BRL',
       "taxaVendaNaDia" = NULL
 WHERE "moedaVenda" = 'USD';

UPDATE "Page"
   SET "custoAquisicao" = ROUND(("custoAquisicao" * COALESCE("taxaCambioNaDia", 5.5))::numeric, 2),
       "moedaCusto" = 'BRL',
       "taxaCambioNaDia" = NULL
 WHERE "moedaCusto" = 'USD';

UPDATE "Page"
   SET "precoVenda" = ROUND(("precoVenda" * COALESCE("taxaVendaNaDia", 5.5))::numeric, 2),
       "moedaVenda" = 'BRL',
       "taxaVendaNaDia" = NULL
 WHERE "moedaVenda" = 'USD';

UPDATE "CustoOperacional"
   SET "valor" = ROUND(("valor" * COALESCE("taxaCambioNaDia", 5.5))::numeric, 2),
       "moeda" = 'BRL',
       "taxaCambioNaDia" = NULL
 WHERE "moeda" = 'USD';

-- 3) Clientes (CRM de aluguéis).
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "contato" TEXT,
    "planId" TEXT,
    "valorMensal" DOUBLE PRECISION,
    "dataVencimento" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ATIVO',
    "observacoes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Client_status_dataVencimento_idx" ON "Client"("status", "dataVencimento");

ALTER TABLE "Client" ADD CONSTRAINT "Client_planId_fkey" FOREIGN KEY ("planId") REFERENCES "RentalPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
