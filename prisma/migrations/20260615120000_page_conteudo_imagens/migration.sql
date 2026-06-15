-- Página: texto livre (conteudo), nicho passa a ser opcional, e imagens (até 3).
ALTER TABLE "Page" ADD COLUMN "conteudo" TEXT;
ALTER TABLE "Page" ALTER COLUMN "nicho" DROP NOT NULL;

-- CreateTable
CREATE TABLE "PageImage" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PageImage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PageImage" ADD CONSTRAINT "PageImage_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
