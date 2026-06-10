-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "comprador" TEXT,
ADD COLUMN     "custoAquisicao" DECIMAL(12,2),
ADD COLUMN     "dataEntrada" TIMESTAMP(3),
ADD COLUMN     "dataSaida" TIMESTAMP(3),
ADD COLUMN     "fornecedor" TEXT,
ADD COLUMN     "moedaCusto" TEXT,
ADD COLUMN     "motivoPerda" TEXT,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "precoPrevisto" DECIMAL(12,2),
ADD COLUMN     "precoVenda" DECIMAL(12,2),
ADD COLUMN     "taxaCambioNaDia" DECIMAL(10,4),
ADD COLUMN     "tipo" TEXT;

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "comprador" TEXT,
ADD COLUMN     "custoAquisicao" DECIMAL(12,2),
ADD COLUMN     "dataEntrada" TIMESTAMP(3),
ADD COLUMN     "dataSaida" TIMESTAMP(3),
ADD COLUMN     "fornecedor" TEXT,
ADD COLUMN     "moedaCusto" TEXT,
ADD COLUMN     "motivoPerda" TEXT,
ADD COLUMN     "observacoes" TEXT,
ADD COLUMN     "precoPrevisto" DECIMAL(12,2),
ADD COLUMN     "precoVenda" DECIMAL(12,2),
ADD COLUMN     "taxaCambioNaDia" DECIMAL(10,4),
ADD COLUMN     "tipo" TEXT;

-- CreateTable
CREATE TABLE "CustoOperacional" (
    "id" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "moeda" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "recorrente" BOOLEAN NOT NULL DEFAULT false,
    "taxaCambioNaDia" DECIMAL(10,4),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustoOperacional_pkey" PRIMARY KEY ("id")
);

-- Backfill: dataEntrada = createdAt para todos os registros existentes
UPDATE "Asset" SET "dataEntrada" = "createdAt" WHERE "dataEntrada" IS NULL;
UPDATE "Page"  SET "dataEntrada" = "createdAt" WHERE "dataEntrada" IS NULL;

-- CreateIndex
CREATE INDEX "CustoOperacional_data_idx" ON "CustoOperacional"("data");

-- CreateIndex
CREATE INDEX "CustoOperacional_categoria_idx" ON "CustoOperacional"("categoria");

-- CreateIndex
CREATE INDEX "Asset_statusVenda_dataSaida_idx" ON "Asset"("statusVenda", "dataSaida");

-- CreateIndex
CREATE INDEX "Asset_statusVenda_dataEntrada_idx" ON "Asset"("statusVenda", "dataEntrada");

-- CreateIndex
CREATE INDEX "Page_status_dataSaida_idx" ON "Page"("status", "dataSaida");

-- CreateIndex
CREATE INDEX "Page_status_dataEntrada_idx" ON "Page"("status", "dataEntrada");
