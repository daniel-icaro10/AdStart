-- Idempotência dos avisos de cobrança por WhatsApp.
ALTER TABLE "Client" ADD COLUMN "avisoVencimentoEm" TIMESTAMP(3);
