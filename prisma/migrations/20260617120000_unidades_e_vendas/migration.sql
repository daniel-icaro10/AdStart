-- Página ganha unidades em estoque (combos de página/perfil).
ALTER TABLE "Page" ADD COLUMN "quantidade" INTEGER NOT NULL DEFAULT 1;

-- Venda por unidade (cada unidade vendida = 1 registro).
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "custo" DOUBLE PRECISION,
    "comprador" TEXT,
    "data" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sale_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Sale_data_idx" ON "Sale"("data");
CREATE INDEX "Sale_pageId_idx" ON "Sale"("pageId");

ALTER TABLE "Sale" ADD CONSTRAINT "Sale_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: páginas/perfis já vendidos viram 1 venda registrada + estoque 0.
INSERT INTO "Sale" ("id", "pageId", "preco", "custo", "comprador", "data", "createdAt")
SELECT gen_random_uuid()::text, "id",
       COALESCE("precoVenda"::double precision, 0),
       "custoAquisicao"::double precision,
       "comprador",
       COALESCE("dataSaida", "updatedAt"),
       CURRENT_TIMESTAMP
FROM "Page"
WHERE "status" = 'VENDIDO' AND "precoVenda" IS NOT NULL;

UPDATE "Page" SET "quantidade" = 0 WHERE "status" = 'VENDIDO';
