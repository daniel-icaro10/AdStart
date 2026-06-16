-- CreateTable: Plano de aluguel de contas de agência.
CREATE TABLE "RentalPlan" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "precoMensalUSD" DOUBLE PRECISION NOT NULL,
    "contasAtivas" INTEGER NOT NULL DEFAULT 0,
    "reposicoesIlimitadas" BOOLEAN NOT NULL DEFAULT false,
    "paginasAntigas2021" BOOLEAN NOT NULL DEFAULT false,
    "paginasAntigas2021Ilimitadas" BOOLEAN NOT NULL DEFAULT false,
    "perfisVerificados" INTEGER NOT NULL DEFAULT 0,
    "beneficios" TEXT,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RentalPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RentalPlan_slug_key" ON "RentalPlan"("slug");

-- CreateIndex
CREATE INDEX "RentalPlan_ativo_ordem_idx" ON "RentalPlan"("ativo", "ordem");
