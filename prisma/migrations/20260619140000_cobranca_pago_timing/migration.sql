-- Renomeia o aviso único para "aviso do dia" e adiciona "aviso antecipado" + marcação de pago.
ALTER TABLE "Client" RENAME COLUMN "avisoVencimentoEm" TO "avisoDiaEm";
ALTER TABLE "Client" ADD COLUMN "avisoPreEm" TIMESTAMP(3);
ALTER TABLE "Client" ADD COLUMN "pagoVencimentoEm" TIMESTAMP(3);
