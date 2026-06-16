-- 1) Página ganha categoria (PAGINA | PERFIL). Tudo existente é PAGINA.
ALTER TABLE "Page" ADD COLUMN "categoria" TEXT NOT NULL DEFAULT 'PAGINA';

-- 2) Planilha editável do cliente.
CREATE TABLE "ClientEntry" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "data" TIMESTAMP(3),
    "descricao" TEXT NOT NULL DEFAULT '',
    "valor" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT '',
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientEntry_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ClientEntry_clientId_ordem_idx" ON "ClientEntry"("clientId", "ordem");

ALTER TABLE "ClientEntry" ADD CONSTRAINT "ClientEntry_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
