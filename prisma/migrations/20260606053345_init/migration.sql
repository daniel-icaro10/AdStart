-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "moeda" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "anoCriacao" INTEGER,
    "totalGastosBRL" DOUBLE PRECISION,
    "totalGastosUSD" DOUBLE PRECISION,
    "qtdContas" INTEGER,
    "verificada" BOOLEAN NOT NULL DEFAULT false,
    "semDividas" BOOLEAN NOT NULL DEFAULT true,
    "semBloqueios" BOOLEAN NOT NULL DEFAULT true,
    "statusVenda" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "icone" TEXT,
    "conteudo" TEXT,
    "tier" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdAccount" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "gastos" DOUBLE PRECISION,
    "limiteMeta" DOUBLE PRECISION,
    "cicloLivre" DOUBLE PRECISION,
    "dividas" DOUBLE PRECISION DEFAULT 0,

    CONSTRAINT "AdAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nicho" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "seguidores" INTEGER NOT NULL DEFAULT 0,
    "anoCriacao" INTEGER,
    "status" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "destaque" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'ADMIN',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "AdAccount" ADD CONSTRAINT "AdAccount_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
