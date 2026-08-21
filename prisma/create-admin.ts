/**
 * Cria (ou atualiza a senha de) um admin adicional, sem tocar no admin do
 * seed principal (seed.ts só sabe lidar com UM admin, via ADMIN_EMAIL).
 *
 * Uso:
 *   npm run db:add-admin -- "email@dominio.com" "senha-forte" "Nome (opcional)"
 *
 * Idempotente: se o email já existir, só atualiza a senha (e o nome, se
 * informado) — não cria duplicata.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const BCRYPT_COST = 12;

async function main() {
  const [, , rawEmail, password, name] = process.argv;
  // Mesma normalização do login (loginSchema, src/lib/validation.ts) — sem
  // isso um email com maiúscula é gravado como veio, mas o login sempre
  // compara em minúsculas, e o admin nunca mais consegue entrar.
  const email = rawEmail?.trim().toLowerCase();

  if (!email || !password) {
    console.error(
      'Uso: npm run db:add-admin -- "email@dominio.com" "senha-forte" "Nome (opcional)"',
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("A senha precisa ter pelo menos 8 caracteres.");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, BCRYPT_COST);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hash, ...(name ? { name } : {}) },
    create: { email, password: hash, name: name ?? null, role: "ADMIN" },
  });

  console.log(`[create-admin] Pronto: ${user.email} (${user.name ?? "sem nome"})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
