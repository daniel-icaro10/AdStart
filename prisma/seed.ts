/**
 * Script de seed.
 *
 *  1. Cria o PRIMEIRO usuário admin lendo ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME
 *     do ambiente. A senha é gravada com bcrypt (custo 12). É idempotente: se o
 *     admin já existir, apenas atualiza a senha/nome.
 *  2. Popula o catálogo com 5 BMs de exemplo (dados fictícios plausíveis).
 *
 *  Rode com:  npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const BCRYPT_COST = 12;

async function seedAdmin() {
  // Mesma normalização do login (loginSchema, src/lib/validation.ts) — sem
  // isso um ADMIN_EMAIL com maiúscula gravaria um registro que o login
  // (que sempre compara em minúsculas) nunca encontraria.
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Administrador";

  if (!email || !password) {
    console.warn(
      "[seed] ADMIN_EMAIL/ADMIN_PASSWORD não definidos — pulando criação do admin.",
    );
    return;
  }

  const hash = await bcrypt.hash(password, BCRYPT_COST);

  const admin = await prisma.user.upsert({
    where: { email },
    update: { password: hash, name },
    create: { email, password: hash, name, role: "ADMIN" },
  });

  console.log(`[seed] Admin pronto: ${admin.email}`);
}

async function seedAssets() {
  // NÃO-destrutivo: só popula exemplos se o catálogo estiver vazio.
  const existing = await prisma.asset.count();
  if (existing > 0) {
    console.log(`[seed] ${existing} ativo(s) já existem — exemplos pulados.`);
    return;
  }

  await prisma.asset.createMany({
    data: [
      {
        codigo: "P100",
        titulo: "P100 · BM Verificada Premium",
        icone: "BR",
        tier: 1,
        valor: 4800,
        moeda: "BRL",
        categoria: "DISPONIVEL",
        statusVenda: "DISPONIVEL",
        destaque: true,
        conteudo: [
          "BM 01 (2021) 87.4K",
          "Gastos Totais: R$ 87.450,00",
          "",
          "✅ BM verificada",
          "✅ Sem dívidas e sem bloqueios",
          "✅ 3 Contas de Anúncio Ativas",
          "",
          "CA 01 - ATIVA",
          "Gastos: R$ 42.300,00 · Limite Meta: R$ 5.000,00",
          "CA 02 - ATIVA",
          "Gastos: R$ 31.150,00 · Limite Meta: R$ 5.000,00",
          "CA 03 - NOVA",
          "Gastos: R$ 14.000,00",
          "",
          "VALOR 4.8",
        ].join("\n"),
      },
      {
        codigo: "D050",
        titulo: "D050 · BM Dólar Aquecida",
        icone: "US",
        tier: 1,
        valor: 3200,
        moeda: "USD",
        categoria: "DOLAR",
        statusVenda: "DISPONIVEL",
        destaque: true,
        conteudo: [
          "Criação: 2022",
          "Total Gastos: US$ 12.600,00",
          "",
          "✅ BM verificada · 2 Contas Ativas",
          "",
          "CA 01 - ATIVA",
          "Gastos: US$ 8.200 · Limite: US$ 1.500",
          "CA 02 - ATIVA",
          "Gastos: US$ 4.400 · Limite: US$ 1.500",
          "",
          "VALOR 3.2",
        ].join("\n"),
      },
      {
        codigo: "BM14",
        titulo: "BM 14 · Intermediária",
        icone: "BR",
        tier: 2,
        valor: 1900,
        moeda: "BRL",
        categoria: "10K_50K",
        statusVenda: "RESERVADO",
        destaque: false,
        conteudo: [
          "Criação: 2023",
          "Total Gastos: R$ 23.800,00",
          "",
          "✅ Sem dívidas · 2 Contas Ativas",
          "",
          "CA 01 - ATIVA · Gastos: R$ 15.800",
          "CA 02 - ATIVA · Gastos: R$ 8.000",
          "",
          "VALOR 1.9",
        ].join("\n"),
      },
      {
        codigo: "BM07",
        titulo: "BM 07 · Nova Disponível",
        icone: "BR",
        valor: 850,
        moeda: "BRL",
        categoria: "DISPONIVEL",
        statusVenda: "DISPONIVEL",
        destaque: true,
        conteudo: [
          "Criação: 2024",
          "Total Gastos: R$ 3.200,00",
          "",
          "Conta nova, limpa, pronta para uso.",
          "",
          "VALOR 0.85",
        ].join("\n"),
      },
      {
        codigo: "P220",
        titulo: "P220 · High Spend",
        icone: "STAR",
        tier: 3,
        valor: 7500,
        moeda: "BRL",
        categoria: "MAIS_100K",
        statusVenda: "VENDIDO",
        destaque: false,
        conteudo: [
          "Criação: 2020",
          "Total Gastos: R$ 152.000,00",
          "",
          "✅ 4 Contas Ativas de alto gasto",
          "",
          "VALOR 7.5",
        ].join("\n"),
      },
    ],
  });

  console.log("[seed] 5 BMs de exemplo criadas.");
}

async function seedPages() {
  // NÃO-destrutivo: só popula exemplos se não houver páginas.
  const existing = await prisma.page.count();
  if (existing > 0) {
    console.log(`[seed] ${existing} página(s) já existem — exemplos pulados.`);
    return;
  }

  await prisma.page.createMany({
    data: [
      // Com seguidores
      {
        nome: "Página Moda & Estilo",
        nicho: "Moda feminina",
        kind: "COM",
        seguidores: 48200,
        anoCriacao: 2021,
        status: "DISPONIVEL",
        valor: 1200,
        destaque: true,
      },
      {
        nome: "Página Receitas Fáceis",
        nicho: "Gastronomia",
        kind: "COM",
        seguidores: 124000,
        anoCriacao: 2020,
        status: "DISPONIVEL",
        valor: 2800,
      },
      {
        nome: "Página Humor & Memes",
        nicho: "Entretenimento",
        kind: "COM",
        seguidores: 86500,
        anoCriacao: 2022,
        status: "RESERVADO",
        valor: 1900,
      },
      // Sem seguidores
      {
        nome: "Página Nova Verificável",
        nicho: "Uso geral",
        kind: "SEM",
        seguidores: 0,
        anoCriacao: 2024,
        status: "DISPONIVEL",
        valor: 350,
        destaque: true,
      },
      {
        nome: "Página Limpa BR",
        nicho: "Uso geral",
        kind: "SEM",
        seguidores: 0,
        anoCriacao: 2023,
        status: "DISPONIVEL",
        valor: 280,
      },
    ],
  });

  console.log("[seed] 5 páginas de exemplo criadas.");
}

async function seedRentalPlans() {
  // Idempotente: upsert por slug — ajusta valores/quotas sem duplicar.
  const planos = [
    {
      nome: "Plano A",
      slug: "plano-a",
      precoMensal: 2750,
      contasAtivas: 1,
      reposicoesIlimitadas: true,
      paginasAntigas2021: false,
      paginasAntigas2021Ilimitadas: false,
      perfisVerificados: 0,
      beneficios: "",
      destaque: false,
      ordem: 1,
      ativo: true,
    },
    {
      nome: "Plano B",
      slug: "plano-b",
      precoMensal: 6050,
      contasAtivas: 2,
      reposicoesIlimitadas: true,
      paginasAntigas2021: true,
      paginasAntigas2021Ilimitadas: true,
      perfisVerificados: 2,
      beneficios: "",
      destaque: true, // "mais popular"
      ordem: 2,
      ativo: true,
    },
    {
      nome: "Plano C",
      slug: "plano-c",
      precoMensal: 11000,
      contasAtivas: 5,
      reposicoesIlimitadas: true,
      paginasAntigas2021: true,
      paginasAntigas2021Ilimitadas: true,
      perfisVerificados: 5,
      beneficios: "",
      destaque: false,
      ordem: 3,
      ativo: true,
    },
  ];

  for (const p of planos) {
    await prisma.rentalPlan.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }

  console.log(`[seed] ${planos.length} planos de aluguel prontos (upsert).`);
}

async function main() {
  await seedAdmin();
  await seedAssets();
  await seedPages();
  await seedRentalPlans();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
