-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "moedaVenda" TEXT,
ADD COLUMN     "taxaVendaNaDia" DECIMAL(10,4);

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "moedaVenda" TEXT,
ADD COLUMN     "taxaVendaNaDia" DECIMAL(10,4);

-- Backfill: vendas existentes ficam em BRL (preserva os números atuais).
UPDATE "Asset" SET "moedaVenda" = 'BRL' WHERE "precoVenda" IS NOT NULL AND "moedaVenda" IS NULL;
UPDATE "Page"  SET "moedaVenda" = 'BRL' WHERE "precoVenda" IS NOT NULL AND "moedaVenda" IS NULL;
